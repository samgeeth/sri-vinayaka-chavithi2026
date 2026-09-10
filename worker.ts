/**
 * Production Cloudflare Worker for Sri Vinayaka Chavithi 2026 Portal
 *
 * Capabilities:
 *  - Cloudflare R2 bucket integration for permanent photo uploads & streaming
 *  - Cloudflare D1 / KV / R2 manifest database persistence
 *  - Committee photo lineup with permanent public HTTPS URLs
 *  - Live bulletin posts & media attachment storage
 *  - Devotee donations & volunteer registration persistence
 *  - Static Assets & Single Page Application (SPA) fallback routing
 */

export interface Env {
  // Cloudflare R2 Bucket for photos
  PHOTOS_BUCKET?: {
    get: (key: string) => Promise<any>;
    put: (key: string, value: any, options?: any) => Promise<any>;
    delete: (key: string) => Promise<any>;
    list: (options?: any) => Promise<any>;
  };
  // Cloudflare D1 Database
  DB?: {
    prepare: (query: string) => {
      bind: (...args: any[]) => {
        all: () => Promise<any>;
        run: () => Promise<any>;
        first: () => Promise<any>;
      };
      all: () => Promise<any>;
      run: () => Promise<any>;
      first: () => Promise<any>;
    };
  };
  // Cloudflare KV Namespace
  APP_KV?: {
    get: (key: string, type?: string) => Promise<any>;
    put: (key: string, value: string, options?: any) => Promise<any>;
    delete: (key: string) => Promise<any>;
  };
  // Static Assets Binding
  ASSETS?: {
    fetch: (request: Request) => Promise<Response>;
  };
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE, PUT',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

function parseBase64DataUrl(dataUrl: string): { contentType: string; buffer: Uint8Array } {
  const match = dataUrl.match(/^data:([a-zA-Z0-9+.-]+\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid base64 data URL format');
  }
  const contentType = match[1].toLowerCase();
  const base64Data = match[2];
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return { contentType, buffer: bytes };
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // 1. CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    // 2. Health & Diagnostics
    if (pathname === '/api/health') {
      return jsonResponse({
        status: 'ok',
        service: 'Sri Vinayaka Chavithi 2026 API',
        environment: 'Cloudflare Worker',
        storage: {
          r2Connected: Boolean(env.PHOTOS_BUCKET),
          d1Connected: Boolean(env.DB),
          kvConnected: Boolean(env.APP_KV),
        },
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Serve Image from Cloudflare R2 (/api/photos/<key>)
    if (pathname.startsWith('/api/photos/')) {
      const key = decodeURIComponent(pathname.replace(/^\/api\/photos\//, ''));
      if (!key) {
        return jsonResponse({ error: 'Missing image key parameter' }, 400);
      }

      if (!env.PHOTOS_BUCKET) {
        return jsonResponse({
          error: 'Cloudflare R2 bucket (PHOTOS_BUCKET) is not bound. Bind your R2 bucket in wrangler.jsonc.',
        }, 503);
      }

      try {
        const object = await env.PHOTOS_BUCKET.get(key);
        if (!object) {
          return jsonResponse({ error: `Image not found: ${key}` }, 404);
        }

        const headers = new Headers();
        if (typeof object.writeHttpMetadata === 'function') {
          object.writeHttpMetadata(headers);
        }
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        if (!headers.get('Content-Type')) {
          headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
        }
        if (object.httpEtag) {
          headers.set('ETag', object.httpEtag);
        }

        return new Response(object.body, { headers });
      } catch (err: any) {
        return jsonResponse({ error: `Failed to fetch image from R2: ${err?.message}` }, 500);
      }
    }

    // 4. Upload Image to Cloudflare R2 (/api/upload)
    if (pathname === '/api/upload' && request.method === 'POST') {
      if (!env.PHOTOS_BUCKET) {
        return jsonResponse({
          error: 'Cloudflare R2 bucket (PHOTOS_BUCKET) is not bound.',
        }, 503);
      }

      try {
        const contentTypeHeader = request.headers.get('content-type') || '';
        let contentType = 'image/jpeg';
        let buffer: Uint8Array | null = null;
        let originalName = 'upload';
        let category = 'general';

        if (contentTypeHeader.includes('multipart/form-data')) {
          const formData = await request.formData();
          const file = formData.get('file') as File | null;
          category = (formData.get('category') as string) || 'general';
          if (!file) {
            return jsonResponse({ error: 'No file found in multipart upload' }, 400);
          }
          contentType = file.type || 'image/jpeg';
          originalName = file.name || 'upload';
          const arrayBuf = await file.arrayBuffer();
          buffer = new Uint8Array(arrayBuf);
        } else {
          // JSON payload with base64 dataUrl
          const body = await request.json() as { dataUrl?: string; filename?: string; category?: string };
          if (!body.dataUrl) {
            return jsonResponse({ error: 'Missing dataUrl in request payload' }, 400);
          }
          const parsed = parseBase64DataUrl(body.dataUrl);
          contentType = parsed.contentType;
          buffer = parsed.buffer;
          originalName = body.filename || 'upload';
          category = body.category || 'general';
        }

        // Validation
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
        if (!validTypes.includes(contentType.toLowerCase())) {
          return jsonResponse({ error: `Invalid image type: ${contentType}. Allowed types: JPEG, PNG, WebP, GIF.` }, 400);
        }
        if (buffer.length > 10 * 1024 * 1024) {
          return jsonResponse({ error: 'Image size exceeds maximum allowed limit (10MB).' }, 400);
        }

        const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : contentType.includes('gif') ? 'gif' : 'jpg';
        const cleanCat = category.replace(/[^a-zA-Z0-9_-]/g, '') || 'general';
        const filename = `${cleanCat}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

        // Save binary to Cloudflare R2
        await env.PHOTOS_BUCKET.put(filename, buffer, {
          httpMetadata: {
            contentType,
            cacheControl: 'public, max-age=31536000, immutable',
          },
          customMetadata: {
            uploadedAt: new Date().toISOString(),
            originalName,
            category: cleanCat,
          },
        });

        const permanentUrl = `/api/photos/${filename}`;
        const fullHttpsUrl = `${url.origin}${permanentUrl}`;

        return jsonResponse({
          success: true,
          key: filename,
          url: permanentUrl,
          fullUrl: fullHttpsUrl,
          size: buffer.length,
          contentType,
        });
      } catch (err: any) {
        return jsonResponse({ error: `Upload to R2 failed: ${err?.message}` }, 500);
      }
    }

    // 5. Committee Photos: GET (/api/committee/photos)
    if (pathname === '/api/committee/photos' && request.method === 'GET') {
      try {
        // Priority 1: Cloudflare D1
        if (env.DB) {
          const result = await env.DB.prepare('SELECT member_id, image_url FROM committee_photos').all();
          const photos: Record<string, string> = {};
          if (result.results && Array.isArray(result.results)) {
            for (const row of result.results as any[]) {
              if (row.member_id && row.image_url) {
                photos[row.member_id] = row.image_url;
              }
            }
          }
          return jsonResponse({ success: true, source: 'd1', photos });
        }

        // Priority 2: Cloudflare KV
        if (env.APP_KV) {
          const stored = await env.APP_KV.get('manifests:committee_photos', 'json');
          return jsonResponse({ success: true, source: 'kv', photos: stored || {} });
        }

        // Priority 3: Cloudflare R2 Manifest
        if (env.PHOTOS_BUCKET) {
          const manifestObj = await env.PHOTOS_BUCKET.get('manifests/committee.json');
          if (manifestObj) {
            const photos = JSON.parse(await manifestObj.text());
            return jsonResponse({ success: true, source: 'r2_manifest', photos });
          }
        }

        return jsonResponse({ success: true, photos: {} });
      } catch (err: any) {
        return jsonResponse({ success: false, error: err?.message, photos: {} }, 500);
      }
    }

    // 6. Committee Photos: Save (/api/committee/save-photo)
    if (pathname === '/api/committee/save-photo' && request.method === 'POST') {
      try {
        const body = await request.json() as { memberId?: string; imageUrl?: string; dataUrl?: string };
        const memberId = body.memberId;
        let imageUrl = body.imageUrl;

        if (!memberId) {
          return jsonResponse({ error: 'Missing memberId' }, 400);
        }

        // If dataUrl was provided instead of imageUrl, upload it to R2 first
        if (!imageUrl && body.dataUrl && env.PHOTOS_BUCKET) {
          const { contentType, buffer } = parseBase64DataUrl(body.dataUrl);
          const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
          const filename = `committee/${memberId}-${Date.now()}.${ext}`;
          await env.PHOTOS_BUCKET.put(filename, buffer, {
            httpMetadata: { contentType, cacheControl: 'public, max-age=31536000, immutable' },
            customMetadata: { memberId, updatedAt: new Date().toISOString() },
          });
          imageUrl = `/api/photos/${filename}`;
        }

        if (!imageUrl) {
          return jsonResponse({ error: 'Missing imageUrl or dataUrl' }, 400);
        }

        const now = new Date().toISOString();

        // 1. Save to D1 if available
        if (env.DB) {
          await env.DB.prepare(
            'INSERT INTO committee_photos (member_id, image_url, updated_at) VALUES (?, ?, ?) ON CONFLICT(member_id) DO UPDATE SET image_url=excluded.image_url, updated_at=excluded.updated_at'
          ).bind(memberId, imageUrl, now).run();
        }

        // 2. Save to KV if available
        if (env.APP_KV) {
          const current = (await env.APP_KV.get('manifests:committee_photos', 'json')) || {};
          current[memberId] = imageUrl;
          await env.APP_KV.put('manifests:committee_photos', JSON.stringify(current));
        }

        // 3. Save to R2 Manifest if available
        if (env.PHOTOS_BUCKET) {
          let current: Record<string, string> = {};
          try {
            const m = await env.PHOTOS_BUCKET.get('manifests/committee.json');
            if (m) current = JSON.parse(await m.text());
          } catch {
            // ignore
          }
          current[memberId] = imageUrl;
          await env.PHOTOS_BUCKET.put('manifests/committee.json', JSON.stringify(current), {
            httpMetadata: { contentType: 'application/json' },
          });
        }

        return jsonResponse({
          success: true,
          memberId,
          url: imageUrl,
          fullUrl: imageUrl.startsWith('http') ? imageUrl : `${url.origin}${imageUrl}`,
        });
      } catch (err: any) {
        return jsonResponse({ error: `Failed to save committee photo: ${err?.message}` }, 500);
      }
    }

    // 7. Committee Photos: Remove (/api/committee/remove-photo)
    if (pathname === '/api/committee/remove-photo' && request.method === 'POST') {
      try {
        const { memberId } = (await request.json()) as { memberId?: string };
        if (memberId) {
          if (env.DB) {
            await env.DB.prepare('DELETE FROM committee_photos WHERE member_id = ?').bind(memberId).run();
          }
          if (env.APP_KV) {
            const current = (await env.APP_KV.get('manifests:committee_photos', 'json')) || {};
            delete current[memberId];
            await env.APP_KV.put('manifests:committee_photos', JSON.stringify(current));
          }
          if (env.PHOTOS_BUCKET) {
            try {
              const m = await env.PHOTOS_BUCKET.get('manifests/committee.json');
              if (m) {
                const current = JSON.parse(await m.text());
                delete current[memberId];
                await env.PHOTOS_BUCKET.put('manifests/committee.json', JSON.stringify(current), {
                  httpMetadata: { contentType: 'application/json' },
                });
              }
            } catch {
              // ignore
            }
          }
        }
        return jsonResponse({ success: true });
      } catch (err: any) {
        return jsonResponse({ error: err?.message }, 500);
      }
    }

    // 8. Live Posts: GET (/api/posts)
    if (pathname === '/api/posts' && request.method === 'GET') {
      try {
        if (env.DB) {
          const result = await env.DB.prepare('SELECT * FROM live_updates ORDER BY timestamp DESC').all();
          if (result.results && result.results.length > 0) {
            const posts = result.results.map((r: any) => ({
              id: r.id,
              title: r.title,
              author: r.author,
              role: r.role,
              timeAgo: r.time_ago,
              timestamp: r.timestamp,
              content: r.content,
              tag: r.tag,
              mediaUrl: r.media_url || undefined,
              reactions: typeof r.reactions === 'string' ? JSON.parse(r.reactions || '{}') : (r.reactions || {}),
            }));
            return jsonResponse({ success: true, posts });
          }
        }

        if (env.APP_KV) {
          const posts = await env.APP_KV.get('manifests:live_posts', 'json');
          if (posts) return jsonResponse({ success: true, posts });
        }

        if (env.PHOTOS_BUCKET) {
          const m = await env.PHOTOS_BUCKET.get('manifests/live_posts.json');
          if (m) {
            const posts = JSON.parse(await m.text());
            return jsonResponse({ success: true, posts });
          }
        }

        return jsonResponse({ success: true, posts: [] });
      } catch (err: any) {
        return jsonResponse({ success: false, error: err?.message, posts: [] }, 500);
      }
    }

    // 9. Live Posts: Save (/api/posts)
    if (pathname === '/api/posts' && request.method === 'POST') {
      try {
        const post = await request.json() as any;
        if (!post.id || !post.title || !post.content) {
          return jsonResponse({ error: 'Invalid post payload' }, 400);
        }

        const reactionsStr = JSON.stringify(post.reactions || {});

        if (env.DB) {
          await env.DB.prepare(
            'INSERT INTO live_updates (id, title, author, role, time_ago, timestamp, content, tag, media_url, reactions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET reactions=excluded.reactions'
          ).bind(
            post.id,
            post.title,
            post.author || 'Pooja Committee',
            post.role || 'Admin',
            post.timeAgo || 'Just now',
            post.timestamp || Date.now(),
            post.content,
            post.tag || 'Announcement',
            post.mediaUrl || null,
            reactionsStr
          ).run();
        }

        if (env.APP_KV) {
          const posts = ((await env.APP_KV.get('manifests:live_posts', 'json')) as any[]) || [];
          const idx = posts.findIndex((p) => p.id === post.id);
          if (idx >= 0) posts[idx] = post;
          else posts.unshift(post);
          await env.APP_KV.put('manifests:live_posts', JSON.stringify(posts));
        }

        if (env.PHOTOS_BUCKET) {
          let posts: any[] = [];
          try {
            const m = await env.PHOTOS_BUCKET.get('manifests/live_posts.json');
            if (m) posts = JSON.parse(await m.text());
          } catch {
            // ignore
          }
          const idx = posts.findIndex((p) => p.id === post.id);
          if (idx >= 0) posts[idx] = post;
          else posts.unshift(post);
          await env.PHOTOS_BUCKET.put('manifests/live_posts.json', JSON.stringify(posts), {
            httpMetadata: { contentType: 'application/json' },
          });
        }

        return jsonResponse({ success: true, post });
      } catch (err: any) {
        return jsonResponse({ error: err?.message }, 500);
      }
    }

    // 10. Donations: GET & POST (/api/donations)
    if (pathname === '/api/donations') {
      if (request.method === 'GET') {
        try {
          if (env.DB) {
            const result = await env.DB.prepare('SELECT * FROM donations ORDER BY timestamp DESC').all();
            if (result.results && result.results.length > 0) {
              const donations = result.results.map((r: any) => ({
                id: r.id,
                donorName: r.donor_name,
                amount: r.amount,
                date: r.date,
                time: r.time,
                receiptNo: r.receipt_no,
                gothram: r.gothram || undefined,
                village: r.village || undefined,
                isAnonymous: Boolean(r.is_anonymous),
              }));
              return jsonResponse({ success: true, donations });
            }
          }

          if (env.APP_KV) {
            const donations = await env.APP_KV.get('manifests:donations', 'json');
            if (donations) return jsonResponse({ success: true, donations });
          }

          return jsonResponse({ success: true, donations: [] });
        } catch (err: any) {
          return jsonResponse({ success: false, error: err?.message, donations: [] }, 500);
        }
      }

      if (request.method === 'POST') {
        try {
          const donation = await request.json() as any;
          if (!donation.id || !donation.donorName || !donation.amount) {
            return jsonResponse({ error: 'Invalid donation payload' }, 400);
          }

          if (env.DB) {
            await env.DB.prepare(
              'INSERT INTO donations (id, donor_name, amount, date, time, receipt_no, gothram, village, is_anonymous, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            ).bind(
              donation.id,
              donation.donorName,
              donation.amount,
              donation.date || new Date().toLocaleDateString('en-IN'),
              donation.time || new Date().toLocaleTimeString('en-IN'),
              donation.receiptNo || `REC-${Date.now()}`,
              donation.gothram || null,
              donation.village || null,
              donation.isAnonymous ? 1 : 0,
              Date.now()
            ).run();
          }

          if (env.APP_KV) {
            const list = ((await env.APP_KV.get('manifests:donations', 'json')) as any[]) || [];
            list.unshift(donation);
            await env.APP_KV.put('manifests:donations', JSON.stringify(list));
          }

          return jsonResponse({ success: true, donation });
        } catch (err: any) {
          return jsonResponse({ error: err?.message }, 500);
        }
      }
    }

    // 11. Volunteers: POST (/api/volunteers)
    if (pathname === '/api/volunteers' && request.method === 'POST') {
      try {
        const vol = await request.json() as any;
        if (!vol.name || !vol.phone) {
          return jsonResponse({ error: 'Name and phone required' }, 400);
        }

        if (env.DB) {
          await env.DB.prepare(
            'INSERT INTO volunteers (id, name, phone, age, wing, availability, date_submitted, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
          ).bind(
            vol.id || `vol-${Date.now()}`,
            vol.name,
            vol.phone,
            vol.age || '',
            vol.wing || 'General',
            vol.availability || 'All 9 Days',
            vol.dateSubmitted || new Date().toISOString(),
            Date.now()
          ).run();
        }

        return jsonResponse({ success: true });
      } catch (err: any) {
        return jsonResponse({ error: err?.message }, 500);
      }
    }

    // 12. Static Assets & SPA Fallback
    try {
      if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
        const assetResponse = await env.ASSETS.fetch(request);

        if (assetResponse.status !== 404) {
          return assetResponse;
        }

        // SPA fallback for HTML navigation requests
        if (request.method === 'GET' && !pathname.includes('.')) {
          const indexRequest = new Request(new URL('/index.html', request.url), request);
          return await env.ASSETS.fetch(indexRequest);
        }

        return assetResponse;
      }
    } catch {
      // Fall through to 404
    }

    return new Response('Not found', { status: 404 });
  },
};

/**
 * Cloudflare Pages Functions [[route]].ts handler
 * Matches the Cloudflare Worker API for R2 photo uploads and database operations.
 */

interface PagesContext {
  request: Request;
  env: {
    PHOTOS_BUCKET?: any;
    DB?: any;
    APP_KV?: any;
    [key: string]: any;
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

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const { pathname } = url;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Health
  if (pathname === '/api/health') {
    return jsonResponse({
      status: 'ok',
      service: 'Sri Vinayaka Chavithi 2026 Pages Functions',
      storage: {
        r2Connected: Boolean(env.PHOTOS_BUCKET),
        d1Connected: Boolean(env.DB),
        kvConnected: Boolean(env.APP_KV),
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Serve photo from R2
  if (pathname.startsWith('/api/photos/')) {
    const key = decodeURIComponent(pathname.replace(/^\/api\/photos\//, ''));
    if (!key) return jsonResponse({ error: 'Missing key' }, 400);

    if (!env.PHOTOS_BUCKET) {
      return jsonResponse({ error: 'PHOTOS_BUCKET is not bound' }, 503);
    }

    try {
      const object = await env.PHOTOS_BUCKET.get(key);
      if (!object) return jsonResponse({ error: `Not found: ${key}` }, 404);

      const headers = new Headers();
      if (typeof object.writeHttpMetadata === 'function') {
        object.writeHttpMetadata(headers);
      }
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      if (!headers.get('Content-Type')) {
        headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
      }
      return new Response(object.body, { headers });
    } catch (err: any) {
      return jsonResponse({ error: err?.message }, 500);
    }
  }

  // Upload to R2
  if (pathname === '/api/upload' && request.method === 'POST') {
    if (!env.PHOTOS_BUCKET) {
      return jsonResponse({ error: 'PHOTOS_BUCKET is not bound' }, 503);
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
        if (!file) return jsonResponse({ error: 'No file found' }, 400);
        contentType = file.type || 'image/jpeg';
        originalName = file.name || 'upload';
        buffer = new Uint8Array(await file.arrayBuffer());
      } else {
        const body = await request.json() as { dataUrl?: string; filename?: string; category?: string };
        if (!body.dataUrl) return jsonResponse({ error: 'Missing dataUrl' }, 400);
        const parsed = parseBase64DataUrl(body.dataUrl);
        contentType = parsed.contentType;
        buffer = parsed.buffer;
        originalName = body.filename || 'upload';
        category = body.category || 'general';
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
      if (!validTypes.includes(contentType.toLowerCase())) {
        return jsonResponse({ error: 'Invalid image format. Allowed: JPEG, PNG, WebP, GIF.' }, 400);
      }
      if (buffer.length > 10 * 1024 * 1024) {
        return jsonResponse({ error: 'Image exceeds 10MB limit' }, 400);
      }

      const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
      const cleanCat = category.replace(/[^a-zA-Z0-9_-]/g, '') || 'general';
      const filename = `${cleanCat}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      await env.PHOTOS_BUCKET.put(filename, buffer, {
        httpMetadata: { contentType, cacheControl: 'public, max-age=31536000, immutable' },
        customMetadata: { uploadedAt: new Date().toISOString(), originalName, category: cleanCat },
      });

      const permanentUrl = `/api/photos/${filename}`;
      return jsonResponse({
        success: true,
        key: filename,
        url: permanentUrl,
        fullUrl: `${url.origin}${permanentUrl}`,
        size: buffer.length,
      });
    } catch (err: any) {
      return jsonResponse({ error: err?.message }, 500);
    }
  }

  // Committee Photos GET
  if (pathname === '/api/committee/photos' && request.method === 'GET') {
    try {
      if (env.DB) {
        const result = await env.DB.prepare('SELECT member_id, image_url FROM committee_photos').all();
        const photos: Record<string, string> = {};
        if (result.results) {
          for (const row of result.results as any[]) {
            if (row.member_id && row.image_url) photos[row.member_id] = row.image_url;
          }
        }
        return jsonResponse({ success: true, photos });
      }

      if (env.PHOTOS_BUCKET) {
        const m = await env.PHOTOS_BUCKET.get('manifests/committee.json');
        if (m) {
          const photos = JSON.parse(await m.text());
          return jsonResponse({ success: true, photos });
        }
      }

      return jsonResponse({ success: true, photos: {} });
    } catch (err: any) {
      return jsonResponse({ success: false, error: err?.message, photos: {} }, 500);
    }
  }

  // Committee Photos Save
  if (pathname === '/api/committee/save-photo' && request.method === 'POST') {
    try {
      const body = await request.json() as { memberId?: string; imageUrl?: string; dataUrl?: string };
      const memberId = body.memberId;
      let imageUrl = body.imageUrl;

      if (!memberId) return jsonResponse({ error: 'Missing memberId' }, 400);

      if (!imageUrl && body.dataUrl && env.PHOTOS_BUCKET) {
        const { contentType, buffer } = parseBase64DataUrl(body.dataUrl);
        const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
        const filename = `committee/${memberId}-${Date.now()}.${ext}`;
        await env.PHOTOS_BUCKET.put(filename, buffer, {
          httpMetadata: { contentType, cacheControl: 'public, max-age=31536000, immutable' },
        });
        imageUrl = `/api/photos/${filename}`;
      }

      if (!imageUrl) return jsonResponse({ error: 'Missing imageUrl' }, 400);

      const now = new Date().toISOString();
      if (env.DB) {
        await env.DB.prepare(
          'INSERT INTO committee_photos (member_id, image_url, updated_at) VALUES (?, ?, ?) ON CONFLICT(member_id) DO UPDATE SET image_url=excluded.image_url, updated_at=excluded.updated_at'
        ).bind(memberId, imageUrl, now).run();
      }

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
      return jsonResponse({ error: err?.message }, 500);
    }
  }

  // Committee Photos Remove
  if (pathname === '/api/committee/remove-photo' && request.method === 'POST') {
    try {
      const { memberId } = await request.json() as { memberId?: string };
      if (memberId && env.PHOTOS_BUCKET) {
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
      return jsonResponse({ success: true });
    } catch (err: any) {
      return jsonResponse({ error: err?.message }, 500);
    }
  }

  // Live posts GET & POST
  if (pathname === '/api/posts') {
    if (request.method === 'GET') {
      try {
        if (env.DB) {
          const res = await env.DB.prepare('SELECT * FROM live_updates ORDER BY timestamp DESC').all();
          if (res.results) {
            const posts = res.results.map((r: any) => ({
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
        if (env.PHOTOS_BUCKET) {
          const m = await env.PHOTOS_BUCKET.get('manifests/live_posts.json');
          if (m) return jsonResponse({ success: true, posts: JSON.parse(await m.text()) });
        }
        return jsonResponse({ success: true, posts: [] });
      } catch (err: any) {
        return jsonResponse({ success: false, error: err?.message, posts: [] }, 500);
      }
    }

    if (request.method === 'POST') {
      try {
        const post = await request.json() as any;
        if (env.PHOTOS_BUCKET) {
          let posts: any[] = [];
          try {
            const m = await env.PHOTOS_BUCKET.get('manifests/live_posts.json');
            if (m) posts = JSON.parse(await m.text());
          } catch {}
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
  }

  // Donations GET & POST
  if (pathname === '/api/donations') {
    if (request.method === 'GET') {
      try {
        if (env.DB) {
          const res = await env.DB.prepare('SELECT * FROM donations ORDER BY timestamp DESC').all();
          if (res.results) {
            return jsonResponse({ success: true, donations: res.results });
          }
        }
        return jsonResponse({ success: true, donations: [] });
      } catch (err: any) {
        return jsonResponse({ success: false, error: err?.message, donations: [] }, 500);
      }
    }

    if (request.method === 'POST') {
      try {
        const donation = await request.json() as any;
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
        return jsonResponse({ success: true, donation });
      } catch (err: any) {
        return jsonResponse({ error: err?.message }, 500);
      }
    }
  }

  return jsonResponse({ error: 'Endpoint not found' }, 404);
}

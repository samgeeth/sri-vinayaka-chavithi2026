import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

// LINT.IfChange(aistudio_media_plugin)
function aistudioMediaPlugin(): Plugin {
  return {
    name: 'vite-plugin-aistudio-media',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/assets/aistudio/')) {
          const rawPath = req.url.split('?')[0].split('#')[0];
          try {
            const decodedPath = decodeURIComponent(rawPath);
            const relativePath = decodedPath.replace(/^\//, '');
            const aistudioDir = path.resolve(
              __dirname,
              'public',
              'assets',
              'aistudio',
            );
            const filePath = path.resolve(__dirname, 'public', relativePath);
            if (
              filePath.startsWith(aistudioDir + path.sep) &&
              fs.existsSync(filePath) &&
              fs.statSync(filePath).isFile()
            ) {
              const ext = path.extname(filePath).toLowerCase();
              const mimeMap: Record<string, string> = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
                '.bmp': 'image/bmp',
                '.ico': 'image/x-icon',
                '.mp4': 'video/mp4',
                '.webm': 'video/webm',
                '.ogv': 'video/ogg',
                '.mp3': 'audio/mpeg',
                '.wav': 'audio/wav',
                '.ogg': 'audio/ogg',
                '.pdf': 'application/pdf',
              };
              res.setHeader(
                'Content-Type',
                mimeMap[ext] || 'application/octet-stream',
              );
              res.setHeader('Cache-Control', 'no-cache');
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          } catch {
            // Fall through if URI decoding or file access fails
          }
        }
        next();
      });
    },
  };
}
// LINT.ThenChange(//depot/google3/java/com/google/alkali/boq/makersuite/applet_dev_service/templates/initializers/react_theme/vite.config.ts:aistudio_media_plugin)

function committeePhotosPlugin(): Plugin {
  return {
    name: 'vite-plugin-committee-photos',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        const parsedUrl = req.url.split('?')[0];
        const photosDir = path.resolve(__dirname, 'public', 'committee-photos');
        const jsonPath = path.resolve(__dirname, 'src', 'data', 'committeePhotosCustom.json');

        if (!fs.existsSync(photosDir)) {
          fs.mkdirSync(photosDir, { recursive: true });
        }

        // Handle health check
        if (parsedUrl === '/api/health') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'ok', localDev: true, r2Connected: true }));
          return;
        }

        // Handle direct /api/photos/ local dev asset serving
        if (req.method === 'GET' && parsedUrl.startsWith('/api/photos/')) {
          const subKey = decodeURIComponent(parsedUrl.replace(/^\/api\/photos\//, ''));
          const possiblePaths = [
            path.join(photosDir, path.basename(subKey)),
            path.resolve(__dirname, 'public', 'committee-photos', path.basename(subKey)),
            path.resolve(__dirname, 'public', subKey),
            path.resolve(__dirname, 'public', path.basename(subKey)),
          ];
          for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
              const ext = path.extname(p).toLowerCase();
              const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
              res.setHeader('Content-Type', mime);
              res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
              fs.createReadStream(p).pipe(res);
              return;
            }
          }
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Image not found' }));
          return;
        }

        const readSavedMap = (): Record<string, string> => {
          try {
            if (fs.existsSync(jsonPath)) {
              return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            }
          } catch {
            // ignore
          }
          return {};
        };

        const writeSavedMap = (map: Record<string, string>) => {
          try {
            fs.writeFileSync(jsonPath, JSON.stringify(map, null, 2), 'utf8');
          } catch (e) {
            console.error('Failed to write committeePhotosCustom.json:', e);
          }
        };

        if (req.method === 'GET' && parsedUrl === '/api/committee/photos') {
          const map = readSavedMap();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, photos: map }));
          return;
        }

        if (req.method === 'GET' && parsedUrl === '/api/posts') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, posts: [] }));
          return;
        }

        if (req.method === 'GET' && parsedUrl === '/api/donations') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, donations: [] }));
          return;
        }

        if (req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', (chunk) => {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
          });

          req.on('end', () => {
            try {
              const totalBuffer = Buffer.concat(chunks);
              const contentType = req.headers['content-type'] || '';

              // 1. File upload endpoint (/api/upload)
              if (parsedUrl === '/api/upload') {
                let fileBuffer: Buffer | null = null;
                let ext = '.jpg';

                if (contentType.includes('multipart/form-data')) {
                  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
                  const boundary = boundaryMatch ? (boundaryMatch[1] || boundaryMatch[2]) : null;

                  if (boundary) {
                    const boundaryBuffer = Buffer.from(`--${boundary}`);
                    const headerSep = Buffer.from('\r\n\r\n');
                    const idx1 = totalBuffer.indexOf(boundaryBuffer);
                    if (idx1 !== -1) {
                      const headerIdx = totalBuffer.indexOf(headerSep, idx1);
                      if (headerIdx !== -1) {
                        const headerStr = totalBuffer.slice(idx1, headerIdx).toString();
                        if (headerStr.includes('image/png')) ext = '.png';
                        else if (headerStr.includes('image/webp')) ext = '.webp';

                        const fileStart = headerIdx + 4;
                        const nextBoundaryIdx = totalBuffer.indexOf(boundaryBuffer, fileStart);
                        const fileEnd = nextBoundaryIdx !== -1 ? nextBoundaryIdx - 2 : totalBuffer.length;
                        fileBuffer = totalBuffer.slice(fileStart, fileEnd);
                      }
                    }
                  }
                  if (!fileBuffer) {
                    fileBuffer = totalBuffer;
                  }
                } else {
                  const payload = JSON.parse(totalBuffer.toString('utf8') || '{}');
                  if (payload.dataUrl) {
                    const matches = payload.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                    if (matches && matches[2]) {
                      ext = matches[1].includes('png') ? '.png' : matches[1].includes('webp') ? '.webp' : '.jpg';
                      fileBuffer = Buffer.from(matches[2], 'base64');
                    }
                  }
                }

                if (!fileBuffer || fileBuffer.length === 0) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ success: false, error: 'Empty file payload' }));
                  return;
                }

                const fileBase = `r2-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;
                const filePath = path.join(photosDir, fileBase);
                fs.writeFileSync(filePath, fileBuffer);

                const publicUrl = `/api/photos/${fileBase}`;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  key: fileBase,
                  url: publicUrl,
                  fullUrl: `http://localhost:3000${publicUrl}`,
                  size: fileBuffer.length,
                }));
                return;
              }

              // Parse JSON for other POST routes
              const payload = JSON.parse(totalBuffer.toString('utf8') || '{}');

              if (parsedUrl === '/api/committee/save-photo') {
                const { memberId, imageUrl, dataUrl } = payload;
                if (!memberId) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ success: false, error: 'Missing memberId' }));
                  return;
                }

                let finalUrl = imageUrl;
                if (!finalUrl && dataUrl) {
                  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                  const ext = matches && matches[1].includes('png') ? '.png' : '.jpg';
                  const fileName = `${memberId}${ext}`;
                  const filePath = path.join(photosDir, fileName);

                  if (matches && matches[2]) {
                    fs.writeFileSync(filePath, Buffer.from(matches[2], 'base64'));
                  }
                  finalUrl = `/api/photos/${fileName}`;
                }

                const map = readSavedMap();
                map[memberId] = finalUrl || `/api/photos/${memberId}.jpg`;
                writeSavedMap(map);

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, url: map[memberId], map }));
                return;
              }

              if (parsedUrl === '/api/committee/remove-photo') {
                const { memberId } = payload;
                const map = readSavedMap();
                if (memberId) {
                  delete map[memberId];
                  writeSavedMap(map);
                  const jpgFile = path.join(photosDir, `${memberId}.jpg`);
                  const pngFile = path.join(photosDir, `${memberId}.png`);
                  if (fs.existsSync(jpgFile)) fs.unlinkSync(jpgFile);
                  if (fs.existsSync(pngFile)) fs.unlinkSync(pngFile);
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, map }));
                return;
              }

              if (parsedUrl === '/api/posts') {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, post: payload }));
                return;
              }

              if (parsedUrl === '/api/donations') {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, donation: payload }));
                return;
              }

              if (parsedUrl === '/api/volunteers') {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, volunteer: payload }));
                return;
              }

              res.statusCode = 404;
              res.end(JSON.stringify({ success: false, error: 'Endpoint not found' }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err?.message || 'Server error' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), aistudioMediaPlugin(), committeePhotosPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

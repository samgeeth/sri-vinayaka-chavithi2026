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
        if (!req.url || !req.url.startsWith('/api/committee/')) {
          return next();
        }

        const parsedUrl = req.url.split('?')[0];
        const photosDir = path.resolve(__dirname, 'public', 'committee-photos');
        const jsonPath = path.resolve(__dirname, 'src', 'data', 'committeePhotosCustom.json');

        if (!fs.existsSync(photosDir)) {
          fs.mkdirSync(photosDir, { recursive: true });
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

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });

          req.on('end', () => {
            try {
              const payload = JSON.parse(body || '{}');

              if (parsedUrl === '/api/committee/save-photo') {
                const { memberId, dataUrl } = payload;
                if (!memberId || !dataUrl) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ success: false, error: 'Missing memberId or dataUrl' }));
                  return;
                }

                const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                const ext = matches && matches[1].includes('png') ? '.png' : '.jpg';
                const fileName = `${memberId}${ext}`;
                const filePath = path.join(photosDir, fileName);

                if (matches && matches[2]) {
                  const buffer = Buffer.from(matches[2], 'base64');
                  fs.writeFileSync(filePath, buffer);
                }

                const map = readSavedMap();
                const publicUrl = `/committee-photos/${fileName}`;
                map[memberId] = publicUrl;
                writeSavedMap(map);

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, url: publicUrl, map }));
                return;
              }

              if (parsedUrl === '/api/committee/sync-all') {
                const { photos } = payload;
                if (photos && typeof photos === 'object') {
                  const map = readSavedMap();
                  for (const [memberId, dataUrl] of Object.entries(photos)) {
                    if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
                      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                      const ext = matches && matches[1].includes('png') ? '.png' : '.jpg';
                      const fileName = `${memberId}${ext}`;
                      const filePath = path.join(photosDir, fileName);

                      if (matches && matches[2]) {
                        fs.writeFileSync(filePath, Buffer.from(matches[2], 'base64'));
                        map[memberId] = `/committee-photos/${fileName}`;
                      }
                    } else if (typeof dataUrl === 'string' && dataUrl.startsWith('/committee-photos/')) {
                      map[memberId] = dataUrl;
                    }
                  }
                  writeSavedMap(map);
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, count: Object.keys(photos).length, map }));
                  return;
                }
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

              res.statusCode = 404;
              res.end(JSON.stringify({ success: false, error: 'Not found' }));
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

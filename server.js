import { createServer } from 'http';
import { stat } from 'fs/promises';
import { createReadStream } from 'fs';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = __filename.substring(0, __filename.lastIndexOf('/'));
const publicDir = join(__dirname, 'public');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = createServer(async (req, res) => {
  const urlPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const filePath = join(publicDir, urlPath);

  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      res.writeHead(403);
      res.end('Diretório não permitido');
      return;
    }

    const contentType = mimeTypes[extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    createReadStream(filePath).pipe(res);
  } catch (error) {
    res.writeHead(404);
    res.end('Arquivo não encontrado');
  }
});

const port = process.env.PORT || 4173;
server.listen(port, '0.0.0.0', () => {
  console.log(`Servidor iniciado em http://localhost:${port}`);
});

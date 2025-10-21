import { WebApp } from 'meteor/webapp';
import { swaggerDefinition } from '/imports/api/items/infra/swagger.js';
import path from 'path';

export function mountSwaggerUI() {
    // Preflight e CORS para /api/docs e /api/docs/swagger.json
    WebApp.connectHandlers.use('/api/docs', (req, res, next) => {
        if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            res.setHeader('Access-Control-Max-Age', '86400');
            res.writeHead(204);
            res.end();
            return;
        }
        next();
    });

    // Servir o swagger.json
    WebApp.connectHandlers.use('/api/docs/swagger.json', (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        res.setHeader('Access-Control-Max-Age', '86400');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.writeHead(200);
        res.end(JSON.stringify(swaggerDefinition, null, 2));
    });

    // Servir Swagger UI (via CDN)
    const swaggerUiPath = path.dirname(require.resolve('swagger-ui-dist'));

    // Servir HTML do Swagger UI
    WebApp.connectHandlers.use('/api/docs', (req, res, next) => {
        if (req.url === '' || req.url === '/') {
            // Página principal do Swagger UI
            const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lucas API - Documentacao</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.5/swagger-ui.min.css">
  <style>
    body {
      margin: 0;
      padding: 0;
    }
    .topbar {
      display: none;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.5/swagger-ui-bundle.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.5/swagger-ui-standalone-preset.min.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: '/api/docs/swagger.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        docExpansion: 'list',
        filter: true,
        tryItOutEnabled: true
      });
    };
  </script>
</body>
</html>
      `;

            res.setHeader('Content-Type', 'text/html');
            res.writeHead(200);
            res.end(html);
            return;
        }

        next();
    });
}
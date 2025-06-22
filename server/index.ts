import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import path from "path";
import fs from "fs";

const app = express();

// CORS middleware for production
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Production'da basit bir mesaj göster
  if (process.env.NODE_ENV === "production") {
    app.use("*", (_req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>VoiceCommunity API</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 10px;
              backdrop-filter: blur(10px);
              max-width: 600px;
            }
            h1 {
              margin-bottom: 1rem;
            }
            p {
              margin-bottom: 0.5rem;
            }
            .api-info {
              background: rgba(255, 255, 255, 0.1);
              padding: 1rem;
              border-radius: 5px;
              margin: 1rem 0;
            }
            .dev-link {
              color: #ffd700;
              text-decoration: none;
            }
            .dev-link:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎵 VoiceCommunity</h1>
            <p>Modern sesli sohbet ve senkronize müzik çalar uygulaması</p>
            <div class="api-info">
              <p><strong>API çalışıyor! 🚀</strong></p>
              <p>Bu production API sunucusudur.</p>
              <p>Tam uygulamayı görmek için development modunda çalıştırın:</p>
              <p><code>npm run dev</code></p>
            </div>
            <p>API Endpoints:</p>
            <p>• /api/health - Sağlık kontrolü</p>
            <p>• /api/voice - Sesli sohbet API'si</p>
            <p>• /api/music - Müzik API'si</p>
          </div>
        </body>
        </html>
      `);
    });
  } else {
    // Development mode
    app.use("*", (_req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>VoiceCommunity - Development</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 10px;
              backdrop-filter: blur(10px);
            }
            h1 {
              margin-bottom: 1rem;
            }
            p {
              margin-bottom: 0.5rem;
            }
            .dev-link {
              color: #ffd700;
              text-decoration: none;
            }
            .dev-link:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎵 VoiceCommunity</h1>
            <p>Development modu aktif</p>
            <p>Tam uygulamayı görmek için:</p>
            <p><a href="http://localhost:5173" class="dev-link">http://localhost:5173</a></p>
            <p>Veya ayrı bir terminal'de: <code>cd client && npm run dev</code></p>
          </div>
        </body>
        </html>
      `);
    });
  }

  // Render'da port 10000 kullan, development'ta 5050
  const port = parseInt(process.env.PORT || '5050');
  server.listen(port, "0.0.0.0", () => {
    console.log(`serving on port ${port}`);
  });
})();

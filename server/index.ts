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

  // Production'da React uygulamasını serve et
  if (process.env.NODE_ENV === "production") {
    const clientDistPath = path.resolve(import.meta.dirname, "..", "dist", "client");
    
    if (fs.existsSync(clientDistPath)) {
      // Static dosyaları serve et
      app.use(express.static(clientDistPath));
      
      // SPA için fallback - tüm route'ları index.html'e yönlendir
      app.use("*", (_req, res) => {
        res.sendFile(path.resolve(clientDistPath, "index.html"));
      });
    } else {
      console.error("Client dist folder not found:", clientDistPath);
      app.use("*", (_req, res) => {
        res.status(500).send("Error: Client build not found. Please run npm run build first.");
      });
    }
  } else {
    // Development mode - Vite dev server'a yönlendir
    app.use("*", (_req, res) => {
      res.redirect("http://localhost:5173");
    });
  }

  // Render'da port 10000 kullan, development'ta 5050
  const port = parseInt(process.env.PORT || '5050');
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port} (${process.env.NODE_ENV} mode)`);
  });
})();

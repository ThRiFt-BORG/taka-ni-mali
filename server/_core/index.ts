import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Configure CORS to allow requests from your Vercel frontend
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      // Allow if the origin is in our configured list
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      // Otherwise, deny the request
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    },
    credentials: true,
  }));
  
  // OAuth callback under /api/oauth/callback (Note: this is likely legacy and not used)
  registerOAuthRoutes(app);

  // tRPC API endpoint
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // In development, serve the frontend via Vite's middleware
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } 
  // In production, only serve static files if NOT in API-only mode
  else if (process.env.SERVER_MODE !== 'api') {
    // This block is for monolith deployments and will be skipped on Railway
    serveStatic(app);
  }
  // If SERVER_MODE is 'api' (on Railway), this block is skipped, 
  // and the server acts as an API-only service.

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
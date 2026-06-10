import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createServer } from "node:net";
import { exec } from "node:child_process";
import { openDb } from "../db/store.js";
import { registerApi } from "./api.js";
import { renderShell } from "./shell.js";

const DEFAULT_PORT = 2847;

interface ServerOpts {
  port?: number;
  db?: string;
  open?: boolean;
}

function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

export async function startDashboardServer(opts: ServerOpts = {}) {
  const port = opts.port ?? DEFAULT_PORT;
  const free = await isPortFree(port);

  if (!free) {
    const url = `http://localhost:${port}`;
    console.log(`Dashboard already running at ${url}`);
    if (opts.open !== false) {
      exec(`open "${url}"`);
    }
    return;
  }

  const app = new Hono();
  const db = openDb(opts.db);

  registerApi(app, db);

  app.get("/", (c) => {
    return c.html(renderShell());
  });

  const url = `http://localhost:${port}`;
  console.log(`Dashboard running at ${url}`);
  console.log(`Press Ctrl+C to stop.`);

  if (opts.open !== false) {
    exec(`open "${url}"`);
  }

  const server = serve({ fetch: app.fetch, port });

  process.on("SIGINT", () => {
    console.log("\nDashboard stopped.");
    db.close();
    server.close();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    db.close();
    server.close();
    process.exit(0);
  });
}

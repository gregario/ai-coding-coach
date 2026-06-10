import { startDashboardServer } from "../../server/index.js";

interface DashboardOpts {
  limit?: string;
  db?: string;
  port?: string;
  stop?: boolean;
}

export async function dashboardCommand(opts: DashboardOpts) {
  if (opts.stop) {
    const port = opts.port ? parseInt(opts.port, 10) : 2847;
    try {
      await fetch(`http://localhost:${port}/api/stats`);
      console.log(`Stopping dashboard on port ${port}...`);
      process.kill(process.pid, "SIGTERM");
    } catch {
      console.log("No dashboard running.");
    }
    return;
  }

  const port = opts.port ? parseInt(opts.port, 10) : undefined;
  await startDashboardServer({ port, db: opts.db });
}

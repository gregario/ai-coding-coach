import { homedir } from "node:os";
import { join } from "node:path";
import { readdirSync, statSync, existsSync } from "node:fs";

export interface TranscriptFile {
  path: string;
  sessionId: string;
  project: string;
  mtime: number;
}

export function discoverTranscripts(
  claudeDir?: string,
  projectFilter?: string
): TranscriptFile[] {
  const baseDir = claudeDir ?? join(homedir(), ".claude", "projects");
  if (!existsSync(baseDir)) return [];

  const results: TranscriptFile[] = [];
  const projects = readdirSync(baseDir, { withFileTypes: true });

  for (const proj of projects) {
    if (!proj.isDirectory()) continue;
    if (projectFilter && !proj.name.includes(projectFilter)) continue;

    const projPath = join(baseDir, proj.name);
    let entries: string[];
    try {
      entries = readdirSync(projPath);
    } catch {
      continue;
    }

    for (const file of entries) {
      if (!file.endsWith(".jsonl")) continue;
      const fullPath = join(projPath, file);
      try {
        const stat = statSync(fullPath);
        results.push({
          path: fullPath,
          sessionId: file.replace(".jsonl", ""),
          project: proj.name,
          mtime: stat.mtimeMs,
        });
      } catch {
        continue;
      }
    }
  }

  return results.sort((a, b) => b.mtime - a.mtime);
}

export function getMostRecent(
  claudeDir?: string,
  projectFilter?: string
): TranscriptFile | null {
  const all = discoverTranscripts(claudeDir, projectFilter);
  return all[0] ?? null;
}

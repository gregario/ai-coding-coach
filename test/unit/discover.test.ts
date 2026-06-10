import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { discoverTranscripts, getMostRecent } from "../../src/cli/discover.js";

describe("discover", () => {
  const testDir = join(tmpdir(), "ai-coach-discover-test-" + process.pid);

  beforeEach(() => {
    mkdirSync(join(testDir, "project-alpha"), { recursive: true });
    mkdirSync(join(testDir, "project-beta"), { recursive: true });

    writeFileSync(join(testDir, "project-alpha", "aaa.jsonl"), "{}");
    writeFileSync(join(testDir, "project-alpha", "bbb.jsonl"), "{}");
    writeFileSync(join(testDir, "project-beta", "ccc.jsonl"), "{}");
    writeFileSync(join(testDir, "project-alpha", "notes.txt"), "not a transcript");
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it("finds all .jsonl files", () => {
    const results = discoverTranscripts(testDir);
    expect(results).toHaveLength(3);
  });

  it("filters by project name", () => {
    const results = discoverTranscripts(testDir, "alpha");
    expect(results).toHaveLength(2);
    expect(results.every((r) => r.project.includes("alpha"))).toBe(true);
  });

  it("sorts by mtime descending", () => {
    const results = discoverTranscripts(testDir);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].mtime).toBeGreaterThanOrEqual(results[i].mtime);
    }
  });

  it("extracts sessionId from filename", () => {
    const results = discoverTranscripts(testDir);
    const ids = results.map((r) => r.sessionId);
    expect(ids).toContain("aaa");
    expect(ids).toContain("bbb");
    expect(ids).toContain("ccc");
  });

  it("ignores non-jsonl files", () => {
    const results = discoverTranscripts(testDir);
    const paths = results.map((r) => r.path);
    expect(paths.some((p) => p.endsWith(".txt"))).toBe(false);
  });

  it("getMostRecent returns the latest transcript", () => {
    const result = getMostRecent(testDir);
    expect(result).not.toBeNull();
    expect(result!.path.endsWith(".jsonl")).toBe(true);
  });

  it("returns empty array for non-existent dir", () => {
    const results = discoverTranscripts("/nonexistent/path");
    expect(results).toEqual([]);
  });

  it("getMostRecent returns null for empty dir", () => {
    const emptyDir = join(tmpdir(), "empty-" + process.pid);
    mkdirSync(emptyDir, { recursive: true });
    expect(getMostRecent(emptyDir)).toBeNull();
    rmSync(emptyDir, { recursive: true, force: true });
  });
});

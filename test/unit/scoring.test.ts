import { describe, it, expect } from "vitest";
import { SCORING_AXES, SCORING_PROMPT, RUBRIC_VERSION } from "../../src/scoring/rubric.js";

describe("rubric", () => {
  it("defines exactly 8 scoring axes", () => {
    expect(SCORING_AXES).toHaveLength(8);
  });

  it("each axis has required fields", () => {
    for (const axis of SCORING_AXES) {
      expect(axis.key).toBeTruthy();
      expect(axis.name).toBeTruthy();
      expect(axis.description).toBeTruthy();
      expect(axis.antiPattern).toBeTruthy();
      expect(axis.signals.high).toBeTruthy();
      expect(axis.signals.low).toBeTruthy();
    }
  });

  it("includes yegge_level as the final axis", () => {
    expect(SCORING_AXES[7].key).toBe("yegge_level");
  });

  it("marks plan_before_code and trust_calibration with confidence notes", () => {
    const planAxis = SCORING_AXES.find((a) => a.key === "plan_before_code");
    const trustAxis = SCORING_AXES.find((a) => a.key === "trust_calibration");
    expect(planAxis).toHaveProperty("confidence_note");
    expect(trustAxis).toHaveProperty("confidence_note");
  });

  it("scoring prompt references all 8 axes", () => {
    for (const axis of SCORING_AXES) {
      expect(SCORING_PROMPT).toContain(axis.key);
      expect(SCORING_PROMPT).toContain(axis.name);
    }
  });

  it("scoring prompt includes Yegge level definitions", () => {
    expect(SCORING_PROMPT).toContain("L1:");
    expect(SCORING_PROMPT).toContain("L8:");
  });

  it("has a valid rubric version", () => {
    expect(RUBRIC_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateGuide, guides } from "../app/data";

describe("OAuth guide library", () => {
  it("ships a diverse set of complete prebuilt guides", () => {
    assert.ok(guides.length >= 4);
    assert.ok(new Set(guides.map(guide => guide.category)).size >= 3);
    for (const guide of guides) {
      assert.ok(guide.id && guide.appName && guide.websiteUrl);
      assert.ok(guide.steps.length >= 4);
      assert.equal(guide.steps[0].stepNumber, 1);
      assert.ok(guide.steps.every((step, index) => step.stepNumber === index + 1));
      assert.ok(guide.frictionScore >= 0 && guide.frictionScore <= 100);
      assert.ok(guide.estimatedDevTimeMinutes > 0);
      assert.ok(Array.isArray(guide.scopes));
    }
  });

  it("uses seeded provider data for known applications", () => {
    const guide = generateGuide("Slack");
    assert.equal(guide.appName, "Slack");
    assert.ok(guide.verificationStatus.verifiedSources.length > 0);
    assert.equal(guide.verificationStatus.testedByAgent, true);
  });

  it("returns a useful, clearly unverified fallback for arbitrary input", () => {
    const guide = generateGuide("https://linear.app");
    assert.equal(guide.appName, "Linear");
    assert.equal(guide.steps.length, 4);
    assert.equal(guide.verificationStatus.testedByAgent, false);
    assert.equal(guide.verificationStatus.verifiedSources.length, 0);
    assert.match(guide.verificationStatus.unverifiedNotes ?? "", /require human verification/i);
  });
});

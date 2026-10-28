import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const html = await readFile(new URL("../preview.html", import.meta.url), "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
const appSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

describe("local OAuth Atlas preview", () => {
  it("contains the investigator, library filters, guide tabs, and export actions", () => {
    assert.ok(html.includes("ATLAS AI INVESTIGATOR"));
    assert.ok(html.includes("id=\"search\""));
    assert.ok(html.includes("Readiness checklist"));
    assert.ok(html.includes("Sources & confidence"));
    assert.ok(html.includes("downloadGuide()"));
    assert.ok(html.includes("downloadJson()"));
  });

  it("includes a diversity of curated providers", () => {
    for (const app of ["Slack", "Notion", "Google Workspace", "Salesforce", "GitHub", "HubSpot"]) {
      assert.ok(html.includes(`name:'${app}'`), `missing ${app}`);
    }
  });

  it("has valid inline JavaScript for browser execution", () => {
    assert.ok(script);
    assert.doesNotThrow(() => new vm.Script(script));
  });

  it("wires every workspace navigation item to its own view", () => {
    for (const section of ["library", "investigator", "checklist", "saved", "activity"]) {
      assert.ok(appSource.includes(`navigate("${section}")`), `missing navigation action for ${section}`);
    }
    assert.ok(appSource.includes("workspaceChecks"), "readiness checklist state is missing");
    assert.ok(appSource.includes("toggleSaved"), "guide save action is missing");
  });

  it("persists saved guides, workspace checks, and generated guides", () => {
    for (const key of ["oauth-atlas-saved-guides", "oauth-atlas-workspace-checks", "oauth-atlas-custom-guides"]) {
      assert.ok(appSource.includes(key), `missing persistence key ${key}`);
    }
  });
});

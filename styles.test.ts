import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const styles = readFileSync("src/styles.css", "utf8");

describe("site background styling", () => {
  test("uses the Luckin Duolingo campaign image with readable overlay masks", () => {
    expect(styles).toContain('--site-background-image: url("/images/luckin-duolingo-background.png")');
    expect(styles).not.toContain("luckin-site-background.jpg");
    expect(styles).toContain("rgb(244 251 248 / 28%)");
    expect(styles).toContain("rgb(217 243 255 / 18%)");
    expect(styles).toContain("rgb(255 225 236 / 30%)");
  });

  test("uses translucent white data boards so the page background can show through", () => {
    expect(styles).toContain("--lacto-mint: #dff8ea");
    expect(styles).toContain("--lacto-aqua: #d9f3ff");
    expect(styles).toContain("--lacto-berry: #ffe1ec");
    expect(styles).toContain("--surface-stage: rgb(255 255 255 / 84%)");
    expect(styles).toContain("--surface-panel: rgb(250 255 252 / 78%)");
    expect(styles).toContain("--surface-card: rgb(255 255 255 / 82%)");
    expect(styles).toContain("--surface-card-strong: rgb(255 255 255 / 88%)");
    expect(styles).toContain("background: var(--surface-stage);");
    expect(styles).toContain("background: var(--surface-panel);");
    expect(styles).toContain("background: var(--surface-card);");
  });
});

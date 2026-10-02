/**
 * Captures a project's <PhoneFrame> or <WatchFrame> as a transparent PNG
 * cutout — chassis, screen, and nubs (side buttons / crown+band), with fully
 * transparent corners (no white square and no gray shadow haze behind the
 * rounded body). Requires the dev server to be running.
 *
 * Usage:
 *   npx tsx scripts/capture-screenshot.ts <category> <project> [screen...]
 *   node --import tsx scripts/capture-screenshot.ts <category> <project>
 *
 * Examples:
 *   npx tsx scripts/capture-screenshot.ts camera filmate
 *   npx tsx scripts/capture-screenshot.ts camera filmate camera films settings
 *   npx tsx scripts/capture-screenshot.ts camera filmate --base-url=http://localhost:3001
 *   npx tsx scripts/capture-screenshot.ts camera filmate --keep-shadow
 *   npx tsx scripts/capture-screenshot.ts monitoring safesense --device=watch status danger sos work-info
 *
 * By default the device's drop shadow is switched off for the capture, so
 * everything outside the chassis is alpha 0. Add --keep-shadow to bake the
 * shadow into the PNG (it lands as a gray haze in the corners).
 *
 * --device=web is for web-preset (responsive site) projects: it requests
 * `?view=mobile`, so components/shared/responsive-site.tsx puts the site in a
 * 393px iframe inside the phone frame, and exports that phone cutout as
 * `mobile-<name>.png`. Desktop shots of a responsive site are plain page
 * screenshots; take them from scripts/visual-check.ts's -desktop.png.
 *
 * --device=phone (default) targets components/shared/phone-frame.tsx's
 * [data-phone-frame] tree. --device=watch targets
 * components/shared/watch-frame.tsx's [data-watch-frame] tree instead, and
 * also appends `&device=watch` to the URL — the convention projects with a
 * phone/watch toggle (e.g. safesense) read via `?device=`. Projects without
 * that toggle simply ignore the unknown query param. --device=ipad targets a
 * project-local `[data-ipad-frame]` tree (e.g. projects/camera/lumicam's
 * components/ipad-frame.tsx) — no query param is appended since a project
 * with an iPad screen puts it on its own URL/project instead of a toggle.
 *
 * Multi-screen capture relies on an opt-in convention: a project's
 * src/index.tsx may read the initial screen from a `?screen=` query param
 * (pattern: getInitialScreen in projects/camera/filmate/src/index.tsx, and for
 * admin consoles projects/b2b/assetflow/components/admin/admin-app.tsx). When one or more screen names are passed on the
 * CLI, each is requested as `?screen=<name>` and saved as `<name>.png`
 * (`watch-<name>.png` when --device=watch, so it can't collide with a phone
 * screen of the same name). Projects that haven't adopted the convention
 * simply ignore the unknown query param and always render their default
 * screen.
 *
 * A screen token may carry extra query params for a screen's own internal
 * sub-state (e.g. a wizard step) using `name:key=value,key2=value2` —
 * everything after the first `:` is split on `,` then `=` and merged into
 * the URL alongside `screen=<name>`. This only works for a component that
 * opts in by reading that param itself (e.g. habitkong's onboarding screen
 * reading `?step=`); components that don't just ignore the extra params.
 * File names sanitize the token (`:`/`=`/`,` -> `-`), e.g.
 * `onboarding:step=2` -> `onboarding-step-2.png`.
 *
 * Example:
 *   npx tsx scripts/capture-screenshot.ts healthcare habitkong \
 *     "onboarding:step=0" "onboarding:step=1" "onboarding:step=2" \
 *     "onboarding:step=3" "onboarding:step=4" "onboarding:step=5"
 */

import { chromium } from "playwright";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

import {
  DEVICE_CONFIG,
  assertDevServerRunning,
  buildScreenQuery,
  type Device,
  type DeviceConfig,
} from "./lib/device";

interface Args {
  category: string;
  project: string;
  screens: string[];
  baseUrl: string;
  keepShadow: boolean;
  device: Device | "web";
}

function parseArgs(argv: string[]): Args {
  const positional: string[] = [];
  let baseUrl = "http://localhost:3000";
  let keepShadow = false;
  let device: Device | "web" = "phone";

  for (const arg of argv) {
    if (arg.startsWith("--base-url=")) {
      baseUrl = arg.slice("--base-url=".length);
    } else if (arg === "--keep-shadow") {
      keepShadow = true;
    } else if (arg.startsWith("--device=")) {
      const value = arg.slice("--device=".length);
      if (value !== "phone" && value !== "watch" && value !== "ipad" && value !== "web") {
        console.error(`Invalid --device value "${value}". Use "phone", "web", "watch", or "ipad".`);
        process.exit(1);
      }
      device = value;
    } else {
      positional.push(arg);
    }
  }

  const [category, project, ...screens] = positional;
  if (!category || !project) {
    console.error(
      "Usage: npx tsx scripts/capture-screenshot.ts <category> <project> [screen...] [--device=phone|web|watch|ipad] [--base-url=http://localhost:3000] [--keep-shadow]",
    );
    process.exit(1);
  }

  return { category, project, screens, baseUrl, keepShadow, device };
}

/**
 * Neutralizes every opaque background between the document root and the
 * phone frame's own chassis paint. The chassis already clips its own
 * background to its rounded corners (border-radius does that regardless of
 * overflow), so once nothing opaque sits behind it, `omitBackground: true`
 * leaves the corners genuinely transparent instead of showing the studio
 * backdrop color (white, or a project's dark override) through them.
 *
 * The chassis drop shadow has to go too. It paints soft black *outside* the
 * rounded body, so with a transparent background it exports as a gray haze
 * filling the corners and edges of the PNG — every pixel of the old output
 * had some alpha, none were truly transparent. Compose a shadow downstream
 * (Figma, slides, CSS) instead of baking a half-clipped one into the asset.
 * Pass --keep-shadow to opt back into the baked-in shadow.
 */
async function neutralizeBackgroundsForCapture(
  page: import("playwright").Page,
  keepShadow: boolean,
  config: DeviceConfig,
) {
  await page.evaluate(
    ({ keepShadow, config }) => {
      document.documentElement.style.background = "transparent";
      document.body.style.background = "transparent";

      const backdrop = document.querySelector<HTMLElement>(config.backdropSelector);
      if (backdrop) backdrop.style.background = "transparent";

      const glow = document.querySelector<HTMLElement>(config.glowSelector);
      if (glow) glow.style.display = "none";

      if (!keepShadow) {
        const chassis = document.querySelector<HTMLElement>(config.chassisSelector);
        // Only the outer layer is overridden; the inset top highlight stays.
        chassis?.style.setProperty(config.shadowVar, "0 0 0 0 transparent");
      }
    },
    { keepShadow, config },
  );
}

/**
 * The device frame's root element (`[data-phone-frame]` / `[data-watch-frame]`)
 * is sized by normal flow — it's always exactly chassis size, regardless of
 * what a given screen renders, because the screen surface scrolls internally
 * instead of growing. So its own getBoundingClientRect() is already stable
 * across every screen/project.
 *
 * The only pixels that legitimately sit outside that box are nubs — the
 * phone's four side buttons (`-left-[2px]` / `-right-[2px]`), or the watch's
 * crown/side button/band stubs — each marked with a `nubSelectors` data
 * attribute. Union with *those specifically* — not with `querySelectorAll("*")`
 * — because screen content can include elements that are visually clipped by
 * `overflow-hidden`/scroll but still report a large, unclipped
 * getBoundingClientRect() (e.g. an unconstrained image, or a long scrollable
 * list). Unioning with every descendant let that leak into the clip rect and
 * made the exported canvas size vary screen to screen; unioning with only the
 * known nubs keeps it constant.
 */
async function getDeviceFrameClipRect(page: import("playwright").Page, config: DeviceConfig) {
  const rect = await page.evaluate((config) => {
    const root = document.querySelector(config.rootSelector);
    if (!root) return null;

    let { left, top, right, bottom } = root.getBoundingClientRect();
    for (const el of root.querySelectorAll(config.nubSelectors)) {
      const r = el.getBoundingClientRect();
      left = Math.min(left, r.left);
      top = Math.min(top, r.top);
      right = Math.max(right, r.right);
      bottom = Math.max(bottom, r.bottom);
    }
    return { x: left, y: top, width: right - left, height: bottom - top };
  }, config);

  if (!rect) {
    throw new Error(config.missingError);
  }
  return rect;
}

async function main() {
  const { category, project, screens, baseUrl, keepShadow, device } = parseArgs(
    process.argv.slice(2),
  );
  await assertDevServerRunning(baseUrl);
  const config = DEVICE_CONFIG[device === "web" ? "phone" : device];

  const outDir = path.join(process.cwd(), "projects", category, project, "screenshots");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const runs = screens.length > 0 ? screens : [null];

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: config.viewport, deviceScaleFactor: 3 });
  await page.emulateMedia({ reducedMotion: "reduce" });

  try {
    for (const screen of runs) {
      const { params, fileToken } = buildScreenQuery(screen, device);
      if (device === "web") params.set("view", "mobile");

      const query = params.toString();
      const url = `${baseUrl}/${category}/${project}${query ? `?${query}` : ""}`;

      console.log(`Navigating to ${url}`);
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForSelector(config.rootSelector, { timeout: 15_000 });
      if (device === "web") {
        const frame = await (await page.waitForSelector("[data-site-frame]")).contentFrame();
        await frame?.waitForLoadState("networkidle");
      }
      await page.waitForTimeout(300); // let entrance transitions/animations settle

      await neutralizeBackgroundsForCapture(page, keepShadow, config);
      const clip = await getDeviceFrameClipRect(page, config);

      const namePrefix = device === "watch" ? "watch-" : device === "web" ? "mobile-" : "";
      const fileName = fileToken ? `${namePrefix}${fileToken}.png` : `${namePrefix}${Date.now()}.png`;
      const outPath = path.join(outDir, fileName);

      await page.screenshot({ path: outPath, clip, omitBackground: true });
      console.log(`Saved ${path.relative(process.cwd(), outPath)}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

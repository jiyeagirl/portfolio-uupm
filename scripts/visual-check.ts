/**
 * Build-time visual verification for a project. Not an export tool: output
 * goes to projects/<category>/<project>/.visual/ (gitignored) for the builder
 * and the reviewer agent to look at, while scripts/capture-screenshot.ts keeps
 * producing the transparent portfolio PNGs in screenshots/.
 *
 * Per screen it writes:
 *   <screen>.png            what the page looks like, white background kept
 *   <screen>-scroll-N.png   the device's inner scroller paged top to bottom,
 *                           so sections below the fold get looked at too
 *   <screen>-corners.png    bottom strip of the device on a magenta backdrop
 *                           (CLAUDE.md "Device edge integrity"), also checked
 *                           pixel by pixel for white leaking past the chassis
 * and merges DOM rule results into .visual/report.json.
 *
 * Exits 1 when any `error` rule fires. `warn` rules are for judgment.
 * Requires the dev server to be running.
 *
 * Devices (match the scaffold preset):
 *   phone (default)  app preset, iPhone frame
 *   web              web preset (customer responsive site). Each screen is
 *                    captured twice: <screen>-desktop.png at 1440 full page,
 *                    and <screen>-mobile*.png through components/shared/
 *                    responsive-site.tsx (?view=mobile, the site in a 393px
 *                    iframe inside the iPhone frame). DOM rules run on both,
 *                    the mobile pass inside the iframe document.
 *   console          console preset and every `-admin` URL, 1440 full page
 *   watch, ipad      as before
 *
 * Usage:
 *   npx tsx scripts/visual-check.ts <category> <project> [screen...] [--device=phone|web|console|watch|ipad]
 *   npm run visual -- camera filmate camera films contactSheet settings
 *   npm run visual -- platform dressday home detail --device=web
 *   npm run visual -- b2b assetflow-admin dashboard members --device=console
 *
 * Screen tokens follow capture-screenshot.ts: `name` becomes `?screen=name`,
 * `name:key=value,key2=value2` adds sub-state params. Re-running with a subset
 * of screens only replaces those screens' files and report entries.
 */

import { chromium, type Frame, type Page } from "playwright";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  DEVICE_CONFIG,
  assertDevServerRunning,
  buildScreenQuery,
  type Device,
} from "./lib/device";

/** One capture pass. "console" is a flat desktop page with no device frame. */
type Target = Device | "console";
type CliDevice = Target | "web";

interface Args {
  category: string;
  project: string;
  screens: string[];
  baseUrl: string;
  device: CliDevice;
}

interface Violation {
  rule: string;
  severity: "error" | "warn";
  message: string;
  text?: string;
  where?: string;
}

interface ScreenReport {
  screen: string;
  url: string;
  files: string[];
  violations: Violation[];
}

const WEB_VIEWPORT = { width: 1440, height: 900 };
const MAX_SCROLL_PAGES = 8;
const MAGENTA = "#ff00ff";

function parseArgs(argv: string[]): Args {
  const positional: string[] = [];
  let baseUrl = "http://localhost:3000";
  let device: CliDevice = "phone";

  for (const arg of argv) {
    if (arg.startsWith("--base-url=")) {
      baseUrl = arg.slice("--base-url=".length);
    } else if (arg.startsWith("--device=")) {
      const value = arg.slice("--device=".length);
      if (!["phone", "watch", "ipad", "web", "console"].includes(value)) {
        console.error(`Invalid --device value "${value}". Use "phone", "web", "console", "watch", or "ipad".`);
        process.exit(1);
      }
      device = value as CliDevice;
    } else {
      positional.push(arg);
    }
  }

  const [category, project, ...screens] = positional;
  if (!category || !project) {
    console.error(
      "Usage: npx tsx scripts/visual-check.ts <category> <project> [screen...] [--device=phone|web|console|watch|ipad] [--base-url=http://localhost:3000]",
    );
    process.exit(1);
  }
  return { category, project, screens, baseUrl, device };
}

/**
 * Tags the elements the rest of the script needs to find again:
 * `data-vc-screen` on the visible screen surface (inside the chassis bezel,
 * or <body> for a flat page) and `data-vc-scroller` on its main vertical
 * scroller. Inside the responsive-site iframe the document itself scrolls, so
 * `documentScroller` falls back to document.scrollingElement.
 * Returns false when the device frame is missing.
 */
async function tagScreen(ctx: Page | Frame, device: Target, documentScroller = false): Promise<boolean> {
  const chassisSelector = device === "console" ? null : DEVICE_CONFIG[device].chassisSelector;
  return ctx.evaluate(({ chassisSelector, documentScroller }) => {
    let screen: HTMLElement | null = document.body;
    if (chassisSelector) {
      const chassis = document.querySelector<HTMLElement>(chassisSelector);
      screen = (chassis?.firstElementChild as HTMLElement | null) ?? chassis;
    }
    if (!screen) return false;
    screen.setAttribute("data-vc-screen", "");

    let best: HTMLElement | null = null;
    let bestRange = 40;
    for (const el of screen.querySelectorAll<HTMLElement>("*")) {
      const style = getComputedStyle(el);
      if (style.overflowY !== "auto" && style.overflowY !== "scroll") continue;
      if (el.clientHeight < 300) continue;
      const range = el.scrollHeight - el.clientHeight;
      if (range > bestRange) {
        best = el;
        bestRange = range;
      }
    }
    if (!best && documentScroller && document.scrollingElement) {
      const root = document.scrollingElement as HTMLElement;
      if (root.scrollHeight - root.clientHeight > 40) best = root;
    }
    best?.setAttribute("data-vc-scroller", "");
    return true;
  }, { chassisSelector, documentScroller });
}

async function getClip(page: Page, device: Target) {
  if (device === "console") return null;
  const config = DEVICE_CONFIG[device];
  return page.evaluate((config) => {
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
    const pad = 8;
    return { x: left - pad, y: top - pad, width: right - left + pad * 2, height: bottom - top + pad * 2 };
  }, config);
}

/**
 * Deterministic rules from CLAUDE.md and the workspace feedback memories.
 * Everything here is something the user has had to fix by hand before.
 */
/**
 * Rule set per surface. "web-desktop" / "web-mobile" are the two passes of a
 * responsive site: flat pages like "console", but judged like an app (inline
 * units are a warning, not an error), and the mobile pass also checks
 * backdrop-filter on edge bars because it is shown inside the phone frame.
 */
type AuditMode = Target | "web-desktop" | "web-mobile";

async function auditDom(ctx: Page | Frame, device: AuditMode): Promise<Violation[]> {
  return ctx.evaluate((device) => {
    const out: Violation[] = [];
    const screen = document.querySelector<HTMLElement>("[data-vc-screen]");
    if (!screen) return out;
    const screenRect = screen.getBoundingClientRect();
    const scrollerTop = document.querySelector<HTMLElement>("[data-vc-scroller]")?.scrollTop ?? 0;
    const hangul = /[가-힣]/;

    const where = (el: Element) => {
      const r = el.getBoundingClientRect();
      const cls = (el.getAttribute("class") ?? "").split(/\s+/).filter(Boolean).slice(0, 3).join(".");
      const y = Math.round(r.top - screenRect.top + scrollerTop);
      return `${el.tagName.toLowerCase()}${cls ? "." + cls : ""} @y=${y}`;
    };
    const ownText = (el: Element) =>
      Array.from(el.childNodes)
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent ?? "")
        .join("")
        .replace(/\s+/g, " ")
        .trim();
    const visible = (el: Element) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      return el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
    };

    const picsum = new Map<string, number>();
    const notePicsum = (src: string) => {
      for (const m of src.matchAll(/picsum\.photos\/id\/(\d+)/g)) {
        picsum.set(m[1], (picsum.get(m[1]) ?? 0) + 1);
      }
    };

    for (const el of screen.querySelectorAll<HTMLElement>("*")) {
      const style = getComputedStyle(el);

      const webkitBackdrop = style.getPropertyValue("-webkit-backdrop-filter");
      if (device !== "console" && device !== "web-desktop" && (style.backdropFilter !== "none" || (webkitBackdrop && webkitBackdrop !== "none"))) {
        // The clip escape only shows on bars that reach the screen edge;
        // a small floating chip is a judgment call, not a leak.
        const r = el.getBoundingClientRect();
        const edgeBar =
          r.width >= screenRect.width * 0.9 &&
          (r.bottom >= screenRect.bottom - 2 || r.top <= screenRect.top + 2);
        out.push({
          rule: "backdrop-filter",
          severity: edgeBar ? "error" : "warn",
          message: edgeBar
            ? "backdrop-filter on an edge-anchored bar escapes the rounded screen clip. Use an opaque surface."
            : "backdrop-filter on a floating element. Fine if it never touches the screen edge.",
          where: where(el),
        });
      }

      if (el instanceof HTMLImageElement) {
        notePicsum(el.currentSrc || el.src);
        if (visible(el) && (!el.complete || el.naturalWidth === 0)) {
          out.push({ rule: "broken-image", severity: "error", message: "Image failed to load.", text: el.src, where: where(el) });
        }
      }
      if (style.backgroundImage.includes("picsum")) notePicsum(style.backgroundImage);

      if (!visible(el)) continue;

      const placeholder = el.getAttribute("placeholder") ?? "";
      const text = ownText(el);
      for (const candidate of [text, placeholder]) {
        if (/[—·]/.test(candidate)) {
          out.push({
            rule: "forbidden-char",
            severity: "error",
            message: "Em dash or interpunct in rendered text. Use comma, slash, or pipe.",
            text: candidate.slice(0, 80),
            where: where(el),
          });
        }
      }
      if (!text) continue;

      if (!/pretendard/i.test(style.fontFamily) && !/mono|courier|menlo/i.test(style.fontFamily)) {
        out.push({
          rule: "font-family",
          severity: "error",
          message: `Text is not set in Pretendard (${style.fontFamily.slice(0, 60)}).`,
          text: text.slice(0, 40),
          where: where(el),
        });
      }

      // English uppercase eyebrow stacked over a larger Korean heading.
      const latinOnly = /^[A-Za-z][A-Za-z &/'-]{2,40}$/.test(text) && /[A-Za-z]{4,}/.test(text);
      const upper = text === text.toUpperCase() || style.textTransform === "uppercase";
      if (latinOnly && upper) {
        const next = el.nextElementSibling ?? el.parentElement?.nextElementSibling ?? null;
        if (next && hangul.test(next.textContent ?? "")) {
          const size = parseFloat(style.fontSize);
          const nextSize = parseFloat(getComputedStyle(next).fontSize);
          if (nextSize >= size * 1.15) {
            out.push({
              rule: "english-eyebrow",
              severity: "error",
              message: "English uppercase label stacked over a Korean heading. Drop it or write it in Korean.",
              text,
              where: where(el),
            });
          }
        }
      }

      // Heavy big number with the unit glued on (1,234건).
      if (/^[+\-−]?[\d,.]+\s?(건|만원|억원|원|명|개|회|곳|대|점|%)$/.test(text)) {
        const weight = parseInt(style.fontWeight, 10);
        const size = parseFloat(style.fontSize);
        if (weight >= 700 && size >= 22) {
          out.push({
            rule: "inline-unit-stat",
            severity: device === "console" ? "error" : "warn",
            message: "Big bold number with inline unit. Move the unit into the label, e.g. `정산 건수 (건)`, weight ~600.",
            text,
            where: where(el),
          });
        }
      }

      const clipsX = style.overflowX === "hidden" || style.overflowX === "clip";
      if (clipsX && el.scrollWidth > el.clientWidth + 1) {
        out.push({
          rule: style.textOverflow === "ellipsis" ? "truncated-text" : "clipped-text",
          severity: "warn",
          message: style.textOverflow === "ellipsis" ? "Text is truncated with an ellipsis in the screenshot." : "Text is cut off without an ellipsis.",
          text: text.slice(0, 60),
          where: where(el),
        });
      }
    }

    // Content wider than the screen and not inside a horizontal scroller/clip.
    if (device === "console" || device === "web-desktop" || device === "web-mobile") {
      if (document.documentElement.scrollWidth > window.innerWidth + 1) {
        out.push({ rule: "horizontal-overflow", severity: "error", message: `Page scrolls horizontally (${document.documentElement.scrollWidth}px > ${window.innerWidth}px).` });
      }
    } else {
      for (const el of screen.querySelectorAll<HTMLElement>("*")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || (r.right <= screenRect.right + 1 && r.left >= screenRect.left - 1)) continue;
        let contained = false;
        for (let p = el.parentElement; p && p !== screen; p = p.parentElement) {
          const ox = getComputedStyle(p).overflowX;
          if (ox !== "visible") {
            contained = true;
            break;
          }
        }
        if (!contained && visible(el)) {
          out.push({
            rule: "horizontal-overflow",
            severity: "error",
            message: "Element extends past the screen edge.",
            text: ownText(el).slice(0, 40) || undefined,
            where: where(el),
          });
        }
      }
    }

    for (const [id, count] of picsum) {
      if (count > 1) {
        out.push({ rule: "picsum-duplicate", severity: "warn", message: `picsum id ${id} is used ${count} times on this screen.` });
      }
    }

    // One entry per rule+text+where.
    const seen = new Set<string>();
    return out.filter((v) => {
      const key = `${v.rule}|${v.text ?? ""}|${v.where ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, device);
}

async function captureScrollPages(
  ctx: Page | Frame,
  page: Page,
  clip: Awaited<ReturnType<typeof getClip>>,
  base: string,
) {
  const files: string[] = [];
  const pages = await ctx.evaluate((max) => {
    const s = document.querySelector<HTMLElement>("[data-vc-scroller]");
    if (!s) return 0;
    return Math.min(max, Math.ceil((s.scrollHeight - s.clientHeight) / (s.clientHeight * 0.85)));
  }, MAX_SCROLL_PAGES);

  for (let n = 1; n <= pages; n++) {
    await ctx.evaluate((n) => {
      const s = document.querySelector<HTMLElement>("[data-vc-scroller]");
      if (s) s.scrollTop = Math.round(s.clientHeight * 0.85 * n);
    }, n);
    await page.waitForTimeout(250);
    const file = `${base}-scroll-${n}.png`;
    await page.screenshot({ path: file, ...(clip ? { clip } : {}) });
    files.push(file);
  }
  await ctx.evaluate(() => {
    const s = document.querySelector<HTMLElement>("[data-vc-scroller]");
    if (s) s.scrollTop = 0;
  });
  return files;
}

/**
 * Paints everything behind the device magenta and screenshots the bottom
 * strip. Near-white pixels touching magenta can only be screen content
 * leaking past the black chassis, so that is what gets counted.
 */
async function checkCorners(page: Page, device: Device, file: string, checker: Page): Promise<Violation[]> {
  const config = DEVICE_CONFIG[device];
  const clip = await page.evaluate(
    ({ config, magenta }) => {
      document.documentElement.style.background = magenta;
      document.body.style.background = magenta;
      const backdrop = document.querySelector<HTMLElement>(config.backdropSelector);
      if (backdrop) backdrop.style.background = magenta;
      const glow = document.querySelector<HTMLElement>(config.glowSelector);
      if (glow) glow.style.display = "none";
      document.querySelector<HTMLElement>(config.chassisSelector)?.style.setProperty(config.shadowVar, "0 0 0 0 transparent");

      const chassis = document.querySelector(config.chassisSelector);
      if (!chassis) return null;
      const r = chassis.getBoundingClientRect();
      const h = 110;
      return { x: r.left - 6, y: r.bottom - h, width: r.width + 12, height: h + 6 };
    },
    { config, magenta: MAGENTA },
  );
  if (!clip) return [];

  // Runs last for the screen; the next goto() resets the magenta paint.
  const png = await page.screenshot({ path: file, clip });

  const leaks = await checker.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const { data, width, height } = ctx.getImageData(0, 0, img.width, img.height);
    const at = (x: number, y: number) => (y * width + x) * 4;
    const isWhite = (i: number) => data[i] > 225 && data[i + 1] > 225 && data[i + 2] > 225;
    const isMagenta = (i: number) => data[i] > 200 && data[i + 1] < 80 && data[i + 2] > 200;
    let count = 0;
    let side = "";
    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        if (!isWhite(at(x, y))) continue;
        if (isMagenta(at(x - 2, y)) || isMagenta(at(x + 2, y)) || isMagenta(at(x, y - 2)) || isMagenta(at(x, y + 2))) {
          count++;
          side = x < width / 2 ? "left" : "right";
        }
      }
    }
    return { count, side };
  }, png.toString("base64"));

  if (leaks.count === 0) return [];
  return [
    {
      rule: "edge-leak",
      severity: "error",
      message: `${leaks.count} white pixels leak past the chassis at the bottom ${leaks.side} corner. Look for backdrop-blur or elements positioned outside the screen box.`,
      where: path.basename(file),
    },
  ];
}

interface Pass {
  /** Suffix after the screen token in file names ("" | "-desktop" | "-mobile"). */
  suffix: string;
  device: Target;
  /** Extra query params for this pass (the mobile view of a responsive site). */
  extra?: Record<string, string>;
  /** Run DOM rules and scroll paging inside the responsive-site iframe. */
  inFrame?: boolean;
  /** DOM rule set, when it differs from `device`. */
  audit?: AuditMode;
}

function passesFor(device: CliDevice): Pass[] {
  if (device === "web") {
    return [
      { suffix: "-desktop", device: "console", audit: "web-desktop" },
      { suffix: "-mobile", device: "phone", extra: { view: "mobile" }, inFrame: true, audit: "web-mobile" },
    ];
  }
  return [{ suffix: "", device }];
}

async function main() {
  const { category, project, screens, baseUrl, device } = parseArgs(process.argv.slice(2));
  await assertDevServerRunning(baseUrl);

  const projectDir = path.join(process.cwd(), "projects", category, project);
  if (!existsSync(projectDir)) {
    console.error(`No project at ${path.relative(process.cwd(), projectDir)}.`);
    process.exit(1);
  }
  const outDir = path.join(projectDir, ".visual");
  mkdirSync(outDir, { recursive: true });

  const reportPath = path.join(outDir, "report.json");
  const report: Record<string, ScreenReport> = existsSync(reportPath)
    ? JSON.parse(readFileSync(reportPath, "utf8"))
    : {};

  const browser = await chromium.launch();
  const consoleErrors: string[] = [];

  // One context per viewport. The phone viewport also hosts the mobile pass of
  // a responsive site (the iframe inside the frame is what sets 393px).
  const contexts = new Map<string, Page>();
  async function pageFor(target: Target) {
    const viewport = target === "console" ? WEB_VIEWPORT : DEVICE_CONFIG[target].viewport;
    const key = `${viewport.width}x${viewport.height}`;
    const existing = contexts.get(key);
    if (existing) return existing;
    const context = await browser.newContext({ viewport, deviceScaleFactor: 2, reducedMotion: "reduce" });
    // tsx (esbuild keepNames) wraps nested functions in __name(), which does not
    // exist in the page when a function body is serialized for page.evaluate.
    await context.addInitScript("window.__name = (fn) => fn;");
    // Next's dev indicator bubble is not part of the design (applies inside iframes too).
    await context.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        const style = document.createElement("style");
        style.textContent = "nextjs-portal { display: none !important; }";
        document.head.appendChild(style);
      });
    });
    const page = await context.newPage();
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const text = msg.text();
      if (/\[HMR\]|\[Fast Refresh\]|React DevTools/.test(text)) return;
      consoleErrors.push(text);
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));
    contexts.set(key, page);
    return page;
  }
  const checkerContext = await browser.newContext();
  await checkerContext.addInitScript("window.__name = (fn) => fn;");
  const checker = await checkerContext.newPage();

  const runs = screens.length > 0 ? screens : [null];
  const passes = passesFor(device);
  let errorCount = 0;

  try {
    for (const screen of runs) {
      const { params, fileToken } = buildScreenQuery(screen, device === "watch" ? "watch" : "phone");
      const token = fileToken ?? "default";

      // Only this screen's own files; `home` must not delete `home-detail-*.png`.
      const own = new RegExp(`^${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(-desktop|-mobile)?(-scroll-\\d+|-corners)?\\.png$`);
      for (const f of readdirSync(outDir)) {
        if (own.test(f)) rmSync(path.join(outDir, f));
      }

      const violations: Violation[] = [];
      const files: string[] = [];
      let firstUrl = "";

      for (const pass of passes) {
        const query = new URLSearchParams(params);
        for (const [k, v] of Object.entries(pass.extra ?? {})) query.set(k, v);
        const qs = query.toString();
        const url = `${baseUrl}/${category}/${project}${qs ? `?${qs}` : ""}`;
        firstUrl ||= url;
        consoleErrors.length = 0;

        const page = await pageFor(pass.device);
        console.log(`\n${token}${pass.suffix}  ${url}`);
        await page.goto(url, { waitUntil: "networkidle" });
        if (pass.device !== "console") {
          await page.waitForSelector(DEVICE_CONFIG[pass.device].rootSelector, { timeout: 15_000 });
        }

        let ctx: Page | Frame = page;
        if (pass.inFrame) {
          const handle = await page.waitForSelector("[data-site-frame]", { timeout: 15_000 }).catch(() => null);
          const frame = await handle?.contentFrame();
          if (!frame) {
            throw new Error(
              "No [data-site-frame] iframe for ?view=mobile. Wrap the site in <ResponsiveSite> (components/shared/responsive-site.tsx).",
            );
          }
          await frame.waitForLoadState("networkidle");
          ctx = frame;
        }
        await ctx.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(400);

        const passViolations: Violation[] = [];
        const tagged = await tagScreen(page, pass.device);
        if (!tagged && pass.device !== "console") throw new Error(DEVICE_CONFIG[pass.device].missingError);
        if (pass.inFrame) await tagScreen(ctx, "console", true);

        const clip = await getClip(page, pass.device);
        const base = path.join(outDir, `${token}${pass.suffix}`);
        await page.screenshot({ path: `${base}.png`, ...(clip ? { clip } : { fullPage: true }) });
        files.push(`${base}.png`);

        passViolations.push(...(await auditDom(ctx, pass.audit ?? pass.device)));
        files.push(...(await captureScrollPages(ctx, page, clip, base)));

        if (pass.device !== "console") {
          passViolations.push(...(await checkCorners(page, pass.device, `${base}-corners.png`, checker)));
          files.push(`${base}-corners.png`);
        }
        for (const text of consoleErrors) {
          passViolations.push({ rule: "console-error", severity: "error", message: text.slice(0, 300) });
        }
        const label = pass.suffix ? `[${pass.suffix.slice(1)}] ` : "";
        violations.push(...passViolations.map((v) => ({ ...v, message: `${label}${v.message}` })));
      }

      report[token] = {
        screen: token,
        url: firstUrl,
        files: files.map((f) => path.relative(process.cwd(), f)),
        violations,
      };

      const errors = violations.filter((v) => v.severity === "error");
      const warns = violations.filter((v) => v.severity === "warn");
      errorCount += errors.length;
      console.log(`  ${files.length} images, ${errors.length} errors, ${warns.length} warnings`);
      for (const v of violations) {
        console.log(`  [${v.severity}] ${v.rule}: ${v.message}${v.text ? `  "${v.text}"` : ""}${v.where ? `  (${v.where})` : ""}`);
      }
    }
  } finally {
    await browser.close();
  }

  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport: ${path.relative(process.cwd(), reportPath)}`);
  if (errorCount > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

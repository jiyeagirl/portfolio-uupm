/**
 * Device-frame selectors and URL helpers shared by
 * scripts/capture-screenshot.ts (export PNGs) and scripts/visual-check.ts
 * (build-time visual verification).
 */

export type Device = "phone" | "watch" | "ipad";

export interface DeviceConfig {
  rootSelector: string;
  backdropSelector: string;
  glowSelector: string;
  chassisSelector: string;
  /** Selectors for nubs that sit outside the root's own bounding box (side
   *  buttons, crown, band stubs) and must be unioned into the clip rect. */
  nubSelectors: string;
  shadowVar: string;
  missingError: string;
  /** Browser viewport for this device. Must be wider/taller than the
   *  backdrop's centered content — the backdrop has `overflow-hidden`, so a
   *  viewport narrower than the frame causes the flex-centered content to
   *  get clipped asymmetrically by the backdrop itself (not just the
   *  frame's own rounded corners), which corrupts the bottom/side corners
   *  of the transparent cutout even though the frame renders fine on a
   *  wide-enough viewport. Phone/watch fit comfortably in the original
   *  900x1200; the iPad frame (~1280x950 backdrop content) needs more room.
   */
  viewport: { width: number; height: number };
}

export const DEVICE_CONFIG: Record<Device, DeviceConfig> = {
  phone: {
    rootSelector: "[data-phone-frame]",
    backdropSelector: "[data-phone-frame-backdrop]",
    glowSelector: "[data-phone-frame-glow]",
    chassisSelector: "[data-phone-frame-chassis]",
    nubSelectors: "[data-phone-frame-button]",
    viewport: { width: 900, height: 1200 },
    shadowVar: "--phone-drop-shadow",
    missingError:
      "No [data-phone-frame] element found on the page. Is this project built on components/shared/phone-frame.tsx?",
  },
  watch: {
    rootSelector: "[data-watch-frame]",
    backdropSelector: "[data-watch-frame-backdrop]",
    glowSelector: "[data-watch-frame-glow]",
    chassisSelector: "[data-watch-frame-chassis]",
    nubSelectors: "[data-watch-frame-crown], [data-watch-frame-button], [data-watch-frame-band]",
    viewport: { width: 900, height: 1200 },
    shadowVar: "--watch-drop-shadow",
    missingError:
      "No [data-watch-frame] element found on the page. Is this project built on components/shared/watch-frame.tsx?",
  },
  ipad: {
    rootSelector: "[data-ipad-frame]",
    backdropSelector: "[data-ipad-frame-backdrop]",
    glowSelector: "[data-ipad-frame-glow]",
    chassisSelector: "[data-ipad-frame-chassis]",
    nubSelectors: "[data-ipad-frame-button]",
    viewport: { width: 1600, height: 1300 },
    shadowVar: "--ipad-drop-shadow",
    missingError:
      "No [data-ipad-frame] element found on the page. Is this project built on a project-local ipad-frame.tsx (e.g. projects/camera/lumicam/components/ipad-frame.tsx)?",
  },
};

export async function assertDevServerRunning(baseUrl: string) {
  try {
    await fetch(baseUrl, { method: "HEAD" });
  } catch {
    console.error(
      `Could not reach ${baseUrl}. Start the dev server first (npm run dev) and try again.`,
    );
    process.exit(1);
  }
}

/**
 * Turns a CLI screen token (`name` or `name:key=value,key2=value2`) into the
 * query params for the project URL and a filesystem-safe file token
 * (`onboarding:step=2` -> `onboarding-step-2`).
 */
export function buildScreenQuery(
  screen: string | null,
  device: Device | "web" | "console",
): { params: URLSearchParams; fileToken: string | null } {
  const params = new URLSearchParams();
  if (device === "watch") params.set("device", "watch");
  if (!screen) return { params, fileToken: null };

  const colonIndex = screen.indexOf(":");
  const name = colonIndex === -1 ? screen : screen.slice(0, colonIndex);
  const extra = colonIndex === -1 ? "" : screen.slice(colonIndex + 1);
  params.set("screen", name);
  let fileToken = name;
  if (extra) {
    for (const pair of extra.split(",")) {
      const [key, value] = pair.split("=");
      if (key && value) {
        params.set(key, value);
        fileToken += `-${key}-${value}`;
      }
    }
  }
  return { params, fileToken };
}

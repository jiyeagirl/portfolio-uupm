"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { PhoneFrame } from "./phone-frame";

/**
 * Display wrapper for `web`-preset projects (customer-facing responsive sites).
 *
 * - Default (and `?embed=1`): renders the site as a normal full-width page.
 * - `?view=mobile`: renders the same URL inside a 393px iframe in the iPhone
 *   frame. The iframe has its own viewport, so the site's ordinary Tailwind
 *   breakpoints (`md:`, `lg:`) switch to the mobile layout exactly as they
 *   would on a phone. Every other query param (`screen`, sub-state) is kept.
 *
 * The iframe sits between the status bar (59px) and the home indicator (34px),
 * the way a mobile browser viewport does. scripts/visual-check.ts finds it by
 * `data-site-frame`.
 */
export function ResponsiveSite({
  children,
  screenClassName = "bg-white text-neutral-900",
}: {
  children: React.ReactNode;
  /** Background behind the status bar and home indicator in the mobile view. */
  screenClassName?: string;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  if (searchParams.get("view") !== "mobile") return <>{children}</>;

  const inner = new URLSearchParams(searchParams.toString());
  inner.delete("view");
  inner.set("embed", "1");

  return (
    <PhoneFrame screenClassName={screenClassName}>
      <div className="flex h-full flex-col pb-[34px] pt-[59px]">
        <iframe
          data-site-frame
          src={`${pathname}?${inner.toString()}`}
          title="모바일 화면"
          className="block w-full flex-1 border-0"
        />
      </div>
    </PhoneFrame>
  );
}

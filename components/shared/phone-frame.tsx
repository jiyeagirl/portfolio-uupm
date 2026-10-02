import { StatusBar } from "./status-bar";
import { HomeIndicator } from "./home-indicator";

export function PhoneFrame({
  children,
  backdropClassName = "bg-white",
  backdropGlow = false,
  screenClassName = "bg-white text-neutral-900",
  statusBarClassName,
  homeIndicatorClassName,
}: {
  children: React.ReactNode;
  /** Outer studio page background. CLAUDE.md's mobile-output rule defaults this to plain white. */
  backdropClassName?: string;
  /** Opt-in only — most projects should leave this off per the plain-white-backdrop rule. */
  backdropGlow?: boolean;
  /** Background/text of the phone screen surface itself. */
  screenClassName?: string;
  statusBarClassName?: string;
  homeIndicatorClassName?: string;
}) {
  return (
    <div
      data-phone-frame-backdrop
      className={`relative flex min-h-dvh items-center justify-center overflow-hidden px-6 py-10 ${backdropClassName}`}
    >
      {backdropGlow && (
        <div
          data-phone-frame-glow
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 45% at 50% 38%, rgba(232,163,61,0.07), transparent 70%), radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,0,0,0.45), transparent)",
          }}
        />
      )}

      {/* True top-level "device" element: chassis + screen + side buttons. This is
          what screenshot tooling should target — see scripts/capture-screenshot.ts. */}
      <div data-phone-frame className="relative">
        <div data-phone-frame-button className="absolute -left-[2px] top-[130px] h-8 w-[3px] rounded-l-sm bg-[#0a0a09]" />
        <div data-phone-frame-button className="absolute -left-[2px] top-[180px] h-14 w-[3px] rounded-l-sm bg-[#0a0a09]" />
        <div data-phone-frame-button className="absolute -left-[2px] top-[240px] h-14 w-[3px] rounded-l-sm bg-[#0a0a09]" />
        <div data-phone-frame-button className="absolute -right-[2px] top-[200px] h-20 w-[3px] rounded-r-sm bg-[#0a0a09]" />

        <div
          data-phone-frame-chassis
          className="overflow-hidden rounded-[62px] bg-gradient-to-b from-[#2b2925] to-[#131211] p-[12px]"
          style={{
            /* The outer drop shadow is kept in its own custom property so the
               screenshot script can switch it off without touching the inset
               highlight. A drop shadow has nowhere to land in a transparent
               export — it just prints a gray halo into the corners.
               See scripts/capture-screenshot.ts. */
            boxShadow:
              "var(--phone-drop-shadow, 0 40px 100px -20px rgba(0,0,0,0.65)), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <div
            className={`relative h-[852px] w-[393px] overflow-hidden rounded-[50px] ${screenClassName}`}
          >
            <StatusBar className={statusBarClassName} />
            <div className="h-full w-full overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {children}
            </div>
            <HomeIndicator className={homeIndicatorClassName} />
            <div className="pointer-events-none absolute left-1/2 top-[11px] z-40 h-[37px] w-[126px] -translate-x-1/2 rounded-full bg-black" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* True top-level "device" element for smartwatch mockups, siblings with
   PhoneFrame. Represents an Apple Watch–style rounded-square case; Wear OS
   is covered in copy only — building a second circular frame doubles the
   scope for one portfolio project's worth of screenshots. Same prop
   contract as PhoneFrame (className-only theming, no baked-in colors) so a
   project can drop it in without inventing a new pattern. */
export function WatchFrame({
  children,
  backdropClassName = "bg-white",
  backdropGlow = false,
  screenClassName = "bg-white text-neutral-900",
  crownClassName = "bg-[#0a0a09]",
}: {
  children: React.ReactNode;
  backdropClassName?: string;
  backdropGlow?: boolean;
  screenClassName?: string;
  crownClassName?: string;
}) {
  return (
    <div
      data-watch-frame-backdrop
      className={`relative flex min-h-dvh items-center justify-center overflow-hidden px-6 py-10 ${backdropClassName}`}
    >
      {backdropGlow && (
        <div
          data-watch-frame-glow
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 50% 45%, rgba(255,42,42,0.08), transparent 70%)",
          }}
        />
      )}

      <div data-watch-frame className="relative">
        {/* Digital crown + side button, right edge */}
        <div
          data-watch-frame-crown
          className={`absolute -right-[3px] top-[92px] h-[22px] w-[5px] rounded-r-sm ${crownClassName}`}
        />
        <div
          data-watch-frame-button
          className={`absolute -right-[3px] top-[130px] h-[34px] w-[4px] rounded-r-sm ${crownClassName}`}
        />

        {/* Band stubs, top and bottom, so the silhouette reads as a watch.
            Tagged data-watch-frame-band so scripts/capture-screenshot.ts can
            union its clip rect with them, same pattern as the phone's
            data-phone-frame-button nubs. */}
        <div data-watch-frame-band className="absolute left-1/2 -top-[22px] h-[24px] w-[104px] -translate-x-1/2 rounded-t-[16px] bg-[#131211]" />
        <div data-watch-frame-band className="absolute left-1/2 -bottom-[22px] h-[24px] w-[104px] -translate-x-1/2 rounded-b-[16px] bg-[#131211]" />

        <div
          data-watch-frame-chassis
          className="overflow-hidden rounded-[64px] bg-gradient-to-b from-[#2b2925] to-[#131211] p-[14px]"
          style={{
            boxShadow:
              "var(--watch-drop-shadow, 0 30px 80px -16px rgba(0,0,0,0.6)), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <div
            className={`relative h-[308px] w-[252px] overflow-hidden rounded-[52px] ${screenClassName}`}
          >
            <div className="h-full w-full overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

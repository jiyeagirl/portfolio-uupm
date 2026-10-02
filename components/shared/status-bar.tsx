import { BatteryFull, CellSignalFull, WifiHigh } from "@phosphor-icons/react/ssr";

export function StatusBar({ className = "text-neutral-900" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-0 z-30 flex h-[59px] items-end justify-between px-7 pb-2 ${className}`}
    >
      <span className="text-[15px] font-semibold tabular-nums tracking-tight">9:41</span>
      <div className="flex items-center gap-1.5">
        <CellSignalFull size={16} weight="fill" />
        <WifiHigh size={16} weight="fill" />
        <BatteryFull size={20} weight="fill" />
      </div>
    </div>
  );
}

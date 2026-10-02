"use client";

/* iOS-style switch. Structural shape only — each project supplies its own
   on/off surface colors via className props so the control still matches
   that project's design system. */

const SIZE = {
  sm: { track: "h-[22px] w-[38px]", knob: "h-4 w-4", top: "top-[3px]", onLeft: 19, offLeft: 3 },
  md: { track: "h-[26px] w-[44px]", knob: "h-5 w-5", top: "top-[3px]", onLeft: 21, offLeft: 3 },
  lg: { track: "h-[31px] w-[51px]", knob: "h-[27px] w-[27px]", top: "top-[2px]", onLeft: 22, offLeft: 2 },
} as const;

export function Toggle({
  checked,
  onChange,
  label,
  size = "md",
  onClassName = "bg-neutral-900",
  offClassName = "bg-neutral-200",
  className = "",
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  size?: keyof typeof SIZE;
  onClassName?: string;
  offClassName?: string;
  /** Extra classes that don't conflict with the structural ones above — e.g. a project's focus-ring utility. */
  className?: string;
}) {
  const dims = SIZE[size];
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative shrink-0 rounded-full transition-colors duration-200 ${dims.track} ${
        checked ? onClassName : offClassName
      } ${className}`}
    >
      <span
        className={`absolute rounded-full bg-white transition-all duration-200 ${dims.top} ${dims.knob}`}
        style={{ left: checked ? dims.onLeft : dims.offLeft }}
      />
    </button>
  );
}

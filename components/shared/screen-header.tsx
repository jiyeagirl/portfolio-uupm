"use client";

import type { ReactNode } from "react";
import { CaretLeft } from "@phosphor-icons/react";

/* Mobile in-app header that sits under the phone status bar. `pt-[59px]`
   clears the status bar/notch and `h-[52px]` is the actual bar height — both
   are load-bearing, don't change them per project. Every color/typography
   choice is passed in via className props so each project keeps its own
   look; this only shares the structure that's easy to get wrong. */

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
  className = "bg-white border-neutral-200",
  backButtonClassName = "text-neutral-900 hover:bg-neutral-100",
  titleClassName = "text-[15.5px] font-semibold text-neutral-900",
  subtitleClassName = "text-[11px] text-neutral-500",
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
  className?: string;
  backButtonClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}) {
  return (
    <header className={`sticky top-0 z-20 border-b pt-[59px] ${className}`}>
      <div className="flex h-[52px] items-center gap-2 px-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="뒤로"
            className={`-ml-2 flex h-9 w-9 items-center justify-center rounded-full transition-colors ${backButtonClassName}`}
          >
            <CaretLeft size={20} weight="bold" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className={`truncate ${titleClassName}`}>{title}</h1>
          {subtitle && <p className={`truncate ${subtitleClassName}`}>{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}

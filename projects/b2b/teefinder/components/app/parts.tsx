"use client";

import type { ReactNode } from "react";
import { cx } from "../ui";
import { dayNum, weekdayIdx, weekdayName } from "../../lib/format";

export type Tab = "home" | "courses" | "alerts" | "profile";

export interface AlertPrefill {
  courseId: string;
  date: string;
}

export interface AppNav {
  setTab: (t: Tab) => void;
  openCourse: (courseId: string, date?: string, slotId?: string) => void;
  openWebview: (slotId: string) => void;
  addAlertFor: (p: AlertPrefill) => void;
  toast: (text: string) => void;
}

/** 탭 화면 상단의 ink 면. 상태바 영역(59px)을 포함함 */
export function InkHeader({ title, sub, right, children, className }: { title?: string; sub?: string; right?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <header className={cx("relative overflow-hidden rounded-b-[32px] bg-(--tf-ink) pt-[59px] text-white", className)}>
      <Contour />
      <div className="relative px-5 pb-5 pt-3">
        {(title || right) && (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {title && <h1 className="tf-heading text-[28px] leading-[1.2]">{title}</h1>}
              {sub && <p className="mt-1 text-[13px] text-white/70">{sub}</p>}
            </div>
            {right}
          </div>
        )}
        {children}
      </div>
    </header>
  );
}

/** 페어웨이 등고선 모티프 */
export function Contour() {
  return (
    <svg className="pointer-events-none absolute -right-10 -top-6 h-[220px] w-[300px] opacity-60" viewBox="0 0 300 220" fill="none" aria-hidden>
      <path d="M20 190C70 120 110 150 160 100S250 70 300 20" stroke="#24493D" strokeWidth="1.5" />
      <path d="M0 175C60 100 105 135 158 82S250 52 300 4" stroke="#24493D" strokeWidth="1.5" />
      <path d="M40 205C85 140 120 168 168 120S255 92 300 40" stroke="#24493D" strokeWidth="1.5" />
      <path d="M70 215C105 165 135 188 178 142S258 116 300 62" stroke="#24493D" strokeWidth="1.5" />
      <ellipse cx="236" cy="62" rx="22" ry="14" stroke="#B58532" strokeWidth="1.5" opacity="0.8" />
      <path d="M236 62V30L252 37L236 44" stroke="#B58532" strokeWidth="1.5" strokeLinejoin="round" opacity="0.8" />
    </svg>
  );
}

/** 날짜 스트립. 요일이 위, 날짜가 아래, 선택일은 반전 */
export function DateStrip({
  dates,
  value,
  onChange,
  count,
  tone = "ink",
}: {
  dates: string[];
  value: string;
  onChange: (d: string) => void;
  count?: (d: string) => number;
  tone?: "ink" | "light";
}) {
  return (
    <div role="tablist" aria-label="날짜 선택" className="tf-scroll-x -mx-5 flex gap-1 px-5">
      {dates.map((d) => {
        const sel = d === value;
        const w = weekdayIdx(d);
        const n = count?.(d);
        const wk = tone === "ink" ? (w === 0 ? "text-[#FF9E96]" : w === 6 ? "text-[#9DBBFF]" : "text-white/70") : w === 0 ? "text-[#B42318]" : w === 6 ? "text-[#1D4ED8]" : "text-(--tf-sub)";
        return (
          <button
            key={d}
            role="tab"
            aria-selected={sel}
            aria-label={`${d.slice(5, 7)}월 ${dayNum(d)}일 ${weekdayName(d)}요일${n !== undefined ? `, 빈 티타임 ${n}개` : ""}`}
            type="button"
            onClick={() => onChange(d)}
            className={cx(
              "flex min-h-[72px] w-[50px] shrink-0 flex-col items-center justify-center rounded-2xl transition-colors duration-150",
              sel ? (tone === "ink" ? "bg-(--tf-paper)" : "bg-(--tf-ink)") : "bg-transparent",
            )}
          >
            <span className={cx("text-[12px] font-medium", sel ? (tone === "ink" ? "text-(--tf-sub)" : "text-white/70") : wk)}>{weekdayName(d)}</span>
            <span className={cx("tf-num mt-0.5 text-[19px] font-bold", sel ? (tone === "ink" ? "text-(--tf-ink)" : "text-white") : tone === "ink" ? "text-white" : "text-(--tf-text)")}>{dayNum(d)}</span>
            {n !== undefined && (
              <span className={cx("tf-num mt-0.5 text-[11px] font-semibold", sel ? (tone === "ink" ? "text-(--tf-brass-ink)" : "text-[#E7C98B]") : tone === "ink" ? "text-[#E7C98B]" : "text-(--tf-sub)")}>{n}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-end justify-between px-5">
      <h2 className="tf-heading text-[20px] text-(--tf-ink)">{children}</h2>
      {right}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="mx-5 flex flex-col items-center rounded-3xl border border-dashed border-(--tf-ink)/25 px-6 py-10 text-center">
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden>
        <ellipse cx="28" cy="44" rx="20" ry="6" stroke="#0E2A22" strokeWidth="1.5" opacity="0.35" />
        <circle cx="28" cy="44" r="3.5" fill="#0E2A22" opacity="0.7" />
        <path d="M28 44V12l14 6-14 6" stroke="#B58532" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <p className="tf-heading mt-3 text-[18px] text-(--tf-ink)">{title}</p>
      <p className="mt-1 text-[14px] leading-[21px] text-(--tf-sub)">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

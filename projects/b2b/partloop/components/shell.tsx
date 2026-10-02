import type { ReactNode } from "react";
import { ClipboardText, FilePlus, Gear, Buildings, Question } from "@phosphor-icons/react";
import type { Screen } from "../lib/types";
import { BUYER } from "../lib/mock-data";

const NAV: { key: Screen; label: string; Icon: typeof ClipboardText }[] = [
  { key: "orders", label: "발주 현황", Icon: ClipboardText },
  { key: "new-order", label: "발주 작성", Icon: FilePlus },
];

export function Shell({ screen, onNavigate, pendingCount, children }: { screen: Screen; onNavigate: (s: Screen) => void; pendingCount: number; children: ReactNode }) {
  const active: Screen = screen === "order-detail" ? "orders" : screen;
  return (
    <div className="flex min-h-dvh">
      <aside className="w-[232px] shrink-0 border-r border-(--pl-line) bg-(--pl-surface)">
        <div className="sticky top-0 flex h-dvh flex-col">
        <div className="flex h-16 items-center gap-2.5 px-5">
          <LogoMark />
          <span className="font-(family-name:--pl-font-display) text-[17px] font-bold tracking-[-0.02em] text-(--pl-ink)">PartLoop</span>
        </div>

        <div className="mx-3 mb-4 flex items-center gap-2.5 rounded-lg bg-(--pl-muted) px-3 py-2.5">
          <span className="grid size-7 place-items-center rounded-md bg-(--pl-ink) text-white">
            <Buildings size={15} weight="bold" aria-hidden />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="text-[13px] font-semibold text-(--pl-ink)">{BUYER.company}</p>
            <p className="text-[12px] text-(--pl-ink-3)">구매사 워크스페이스</p>
          </div>
        </div>

        <nav aria-label="주 메뉴" className="flex flex-col gap-0.5 px-3">
          <p className="px-2.5 pb-1.5 text-[12px] font-medium text-(--pl-ink-4)">발주</p>
          {NAV.map(({ key, label, Icon }) => {
            const on = active === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onNavigate(key)}
                aria-current={on ? "page" : undefined}
                className={`relative flex h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-[14px] transition-colors duration-150 ${
                  on ? "bg-(--pl-accent-soft) font-semibold text-(--pl-accent-hover)" : "text-(--pl-ink-2) hover:bg-(--pl-muted)"
                }`}
              >
                <Icon size={18} weight={on ? "fill" : "regular"} aria-hidden />
                {label}
                {key === "orders" && pendingCount > 0 && (
                  <span className="num ml-auto rounded-full bg-[#FEF3C7] px-1.5 text-[11.5px] font-semibold leading-5 text-[#92400E]" aria-label={`승인 대기 ${pendingCount}건`} title={`승인 대기 ${pendingCount}건`}>
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-0.5 px-3 pb-2">
          <button type="button" className="flex h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-[14px] text-(--pl-ink-3) hover:bg-(--pl-muted)">
            <Question size={18} aria-hidden /> 도움말
          </button>
          <button type="button" className="flex h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-[14px] text-(--pl-ink-3) hover:bg-(--pl-muted)">
            <Gear size={18} aria-hidden /> 설정
          </button>
        </div>
        <div className="flex items-center gap-2.5 border-t border-(--pl-line) px-5 py-4">
          <span className="grid size-8 place-items-center rounded-full bg-[#DCE7F3] text-[13px] font-semibold text-(--pl-accent-hover)">다은</span>
          <div className="leading-tight">
            <p className="text-[13px] font-semibold text-(--pl-ink)">
              {BUYER.name} {BUYER.role}
            </p>
            <p className="text-[12px] text-(--pl-ink-3)">
              {BUYER.company} {BUYER.team}
            </p>
          </div>
        </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

function LogoMark() {
  // 두 개의 맞물린 고리: 발주와 납품이 한 바퀴 도는 흐름
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
      <rect width="26" height="26" rx="7" fill="#0F172A" />
      <circle cx="10.5" cy="13" r="4.6" fill="none" stroke="#fff" strokeWidth="2.2" />
      <circle cx="15.5" cy="13" r="4.6" fill="none" stroke="#38BDF8" strokeWidth="2.2" />
    </svg>
  );
}

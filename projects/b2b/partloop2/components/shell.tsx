import type { ReactNode } from "react";
import { ClipboardText, NotePencil } from "@phosphor-icons/react";
import type { Screen } from "../lib/types";
import { BUYER } from "../lib/mock-data";

const NAV: { key: Screen; label: string; Icon: typeof ClipboardText }[] = [
  { key: "orders", label: "발주 현황", Icon: ClipboardText },
  { key: "new-order", label: "발주 작성", Icon: NotePencil },
];

export function Shell({ screen, onNavigate, children }: { screen: Screen; onNavigate: (s: Screen) => void; children: ReactNode }) {
  // 상세 화면은 메뉴에 없으므로 발주 현황을 활성으로 유지
  const active: Screen = screen === "order-detail" ? "orders" : screen;
  return (
    <div className="flex min-h-dvh">
      <div className="w-56 shrink-0 self-stretch border-r border-(--pl2-line) bg-(--pl2-surface)">
        <nav aria-label="주 메뉴" className="sticky top-0 flex h-dvh flex-col px-3 py-4">
          <div className="flex items-center gap-2.5 px-2">
            <div className="font-(family-name:--pl2-font-display) flex h-8 w-8 items-center justify-center rounded-lg bg-(--pl2-ink) text-[14px] font-bold text-white">A</div>
            <div className="leading-tight">
              <div className="text-[14px] font-semibold">{BUYER.company}</div>
              <div className="text-[12.5px] text-(--pl2-ink-4)">{BUYER.team}</div>
            </div>
          </div>
          <ul className="mt-6 flex flex-col gap-1">
            {NAV.map(({ key, label, Icon }) => {
              const on = key === active;
              return (
                <li key={key}>
                  <button
                    type="button"
                    aria-current={on ? "page" : undefined}
                    onClick={() => onNavigate(key)}
                    className={`flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 text-[14px] font-semibold transition-colors duration-150 ${
                      on ? "bg-(--pl2-accent-soft) text-(--pl2-accent-hover)" : "text-(--pl2-ink-3) hover:bg-(--pl2-muted) hover:text-(--pl2-ink)"
                    }`}
                  >
                    <Icon size={20} weight={on ? "fill" : "regular"} aria-hidden />
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-auto flex items-center gap-2.5 border-t border-(--pl2-line) px-2 pt-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--pl2-muted) text-[12px] font-semibold text-(--pl2-ink-2)">{BUYER.name.slice(0, 1)}</div>
            <div className="leading-tight">
              <div className="text-[13.5px] font-semibold">{BUYER.name}</div>
              <div className="text-[12.5px] text-(--pl2-ink-4)">{BUYER.role}</div>
            </div>
          </div>
        </nav>
      </div>
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1240px] px-10 py-8">{children}</div>
      </main>
    </div>
  );
}

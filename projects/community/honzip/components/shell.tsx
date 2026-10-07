import { useState, type ReactNode } from "react";
import { CaretDown, List, MapPin, MagnifyingGlass, PencilSimple, X } from "@phosphor-icons/react";
import type { Screen } from "../lib/types";
import { DONGS } from "../lib/mock-data";
import { HonzipMark, inputCls } from "./ui";

function DongPicker({ dong, onDong }: { dong: string; onDong: (d: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 cursor-pointer items-center gap-1 rounded-lg bg-(--hz-primary-soft) pl-2.5 pr-2 text-[14px] font-semibold text-(--hz-primary-hover) transition-colors hover:bg-[#d3ecdf]"
      >
        <MapPin size={16} weight="fill" aria-hidden />
        {dong}
        <CaretDown size={13} weight="bold" aria-hidden />
      </button>
      {open && (
        <ul role="listbox" aria-label="동네 변경" className="absolute left-0 top-12 z-40 w-36 overflow-hidden rounded-lg border border-(--hz-line) bg-(--hz-surface) py-1 shadow-[0_6px_12px_rgba(31,42,36,0.1)]">
          {DONGS.map((d) => (
            <li key={d} role="option" aria-selected={d === dong}>
              <button
                type="button"
                onClick={() => {
                  onDong(d);
                  setOpen(false);
                }}
                className={`flex h-10 w-full cursor-pointer items-center px-3 text-left text-[14px] hover:bg-(--hz-muted) ${d === dong ? "font-semibold text-(--hz-primary-hover)" : ""}`}
              >
                {d}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Shell({
  screen, onNavigate, dong, onDong, query, onQuery, children,
}: {
  screen: Screen;
  onNavigate: (s: Screen) => void;
  dong: string;
  onDong: (d: string) => void;
  query: string;
  onQuery: (q: string) => void;
  children: ReactNode;
}) {
  const [menu, setMenu] = useState(false);
  const active: Screen = screen === "post" ? "home" : screen;
  const go = (s: Screen) => {
    setMenu(false);
    onNavigate(s);
  };
  const search = (
    <div className="relative w-full">
      <MagnifyingGlass size={18} aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--hz-ink-4)" />
      <input value={query} onChange={(e) => onQuery(e.target.value)} aria-label="글 검색" placeholder={`${dong} 이웃에게 궁금한 것을 검색해 보세요`} className={`${inputCls} h-10 bg-(--hz-muted) pl-10 text-[14px]`} />
    </div>
  );
  return (
    <div>
      <header className="sticky top-0 z-30 border-b border-(--hz-line) bg-(--hz-surface)">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-3 px-4 md:h-16 md:gap-5 md:px-6">
          <button type="button" onClick={() => go("home")} className="inline-flex cursor-pointer items-center gap-1.5 text-[22px] font-extrabold tracking-[-0.03em] text-(--hz-primary)" aria-label="혼집 홈">
            <HonzipMark size={30} />
            혼집
          </button>
          <DongPicker dong={dong} onDong={onDong} />
          {screen === "home" && <div className="ml-2 hidden max-w-[460px] flex-1 md:block">{search}</div>}
          <nav aria-label="주 메뉴" className="ml-auto hidden items-center gap-3 md:flex">
            <button
              type="button"
              aria-current={screen === "home" ? "page" : undefined}
              onClick={() => go("home")}
              className={`h-10 cursor-pointer rounded-lg px-3.5 text-[15px] font-semibold transition-colors ${screen === "home" ? "bg-(--hz-primary-soft) text-(--hz-primary-hover)" : "text-(--hz-ink-3) hover:bg-(--hz-muted) hover:text-(--hz-ink)"}`}
            >
              홈
            </button>
            <button
              type="button"
              aria-current={active === "write" ? "page" : undefined}
              onClick={() => go("write")}
              className={`inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-lg px-4 text-[15px] font-semibold transition-colors ${screen === "write" ? "hidden" : "bg-(--hz-accent) text-white hover:bg-(--hz-accent-hover)"}`}
            >
              <PencilSimple size={17} weight="bold" aria-hidden />
              글쓰기
            </button>
          </nav>
          <button type="button" aria-label={menu ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={menu} onClick={() => setMenu((m) => !m)} className="ml-auto -mr-1 flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-(--hz-ink-2) hover:bg-(--hz-muted) md:hidden">
            {menu ? <X size={22} aria-hidden /> : <List size={22} aria-hidden />}
          </button>
        </div>
        {menu && (
          <nav aria-label="모바일 메뉴" className="border-t border-(--hz-line) bg-(--hz-surface) px-4 py-2 md:hidden">
            {([["home", "홈"], ["write", "글쓰기"]] as const).map(([k, label]) => (
              <button key={k} type="button" onClick={() => go(k)} aria-current={active === k ? "page" : undefined} className={`flex h-12 w-full cursor-pointer items-center text-left text-[16px] font-semibold ${active === k ? "text-(--hz-primary-hover)" : "text-(--hz-ink-2)"}`}>
                {label}
              </button>
            ))}
          </nav>
        )}
      </header>
      {screen === "home" && <div className="border-b border-(--hz-line) bg-(--hz-surface) px-4 py-2.5 md:hidden">{search}</div>}
      <main className="mx-auto max-w-[1200px] px-4 pb-24 pt-6 md:px-6 md:py-8">{children}</main>
    </div>
  );
}

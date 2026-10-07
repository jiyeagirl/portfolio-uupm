"use client";

import { useState } from "react";
import { Heart, MagnifyingGlass } from "@phosphor-icons/react";
import { useTee } from "../../lib/store";
import { TODAY, TOTAL_COURSES, openCount } from "../../lib/mock-data";
import { REGIONS, type Region } from "../../lib/types";
import { Badge, Chip, Segmented, type StatusKey, cx } from "../ui";
import { EmptyState, InkHeader, type AppNav } from "./parts";

export function CoursesScreen({ nav, q }: { nav: AppNav; q: Record<string, string> }) {
  const { courses, favorites, toggleFavorite, accounts } = useTee();
  const [query, setQuery] = useState(q.query ?? "");
  const [region, setRegion] = useState<"all" | Region>((REGIONS as string[]).includes(q.region ?? "") ? (q.region as Region) : "all");
  const [view, setView] = useState<"all" | "fav">(q.view === "fav" ? "fav" : "all");

  const list = courses.filter(
    (c) =>
      (region === "all" || c.region === region) &&
      (view === "all" || favorites.includes(c.id)) &&
      (query.trim() === "" || c.name.includes(query.trim()) || c.area.includes(query.trim())),
  );

  return (
    <div className="min-h-full bg-(--tf-paper) pb-8">
      <InkHeader title="골프장" sub={`총 ${TOTAL_COURSES}곳`}>
        <label className="mt-4 flex h-12 items-center gap-2 rounded-2xl bg-white px-4">
          <MagnifyingGlass size={20} className="shrink-0 text-(--tf-sub)" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="골프장 이름이나 지역 검색"
            aria-label="골프장 검색"
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-(--tf-text) placeholder:text-[#8A938E] focus:outline-none"
          />
        </label>
        <div className="tf-scroll-x -mx-5 mt-3 flex gap-2 px-5">
          <Chip tone="ink" active={region === "all"} onClick={() => setRegion("all")}>전체 지역</Chip>
          {REGIONS.map((r) => (
            <Chip key={r} tone="ink" active={region === r} onClick={() => setRegion(r)}>{r}</Chip>
          ))}
        </div>
      </InkHeader>

      <div className="px-5 pt-4">
        <Segmented
          items={[
            { key: "all", label: "전체" },
            { key: "fav", label: `즐겨찾기 ${favorites.length}` },
          ]}
          value={view}
          onChange={setView}
        />
      </div>

      <ul className="mt-4 flex flex-col gap-2.5 px-5">
        {list.map((c) => {
          const acc = accounts.find((a) => a.courseId === c.id);
          const accKey: StatusKey = acc ? (`account:${acc.status}` as StatusKey) : "account:none";
          const left = openCount(c.id, TODAY);
          const down = c.status === "error";
          const fav = favorites.includes(c.id);
          return (
            <li key={c.id} className="relative">
              <button
                type="button"
                onClick={() => nav.openCourse(c.id)}
                className="tf-press flex min-h-[88px] w-full items-center gap-3 rounded-2xl border border-(--tf-line) bg-white py-3 pl-4 pr-3 text-left"
              >
                <span className="min-w-0 flex-1 pr-11">
                  <span className="block truncate text-[16px] font-bold text-(--tf-text)">{c.name}</span>
                  <span className="mt-0.5 block text-[12.5px] text-(--tf-sub)">
                    {c.area} | {c.layouts.join(", ")}
                  </span>
                  <span className="mt-2 block">
                    <Badge kind={accKey} size="sm" />
                  </span>
                </span>
                <span className="flex w-[64px] shrink-0 flex-col items-end">
                  {down ? (
                    <span className="text-right text-[12px] font-semibold leading-4 text-(--tf-danger)">수집 점검 중</span>
                  ) : (
                    <>
                      <span className={cx("tf-num text-[26px] font-bold leading-8", left > 0 ? "text-(--tf-ink)" : "text-(--tf-sub)")}>{left}</span>
                      <span className="text-[11px] text-(--tf-sub)">오늘 잔여</span>
                    </>
                  )}
                </span>
              </button>
              <button
                type="button"
                aria-pressed={fav}
                aria-label={`${c.name} 즐겨찾기 ${fav ? "해제" : "추가"}`}
                onClick={() => toggleFavorite(c.id)}
                className="absolute right-[76px] top-1 flex h-11 w-11 items-center justify-center rounded-full"
              >
                <Heart size={22} weight={fav ? "fill" : "regular"} className={fav ? "text-(--tf-brass)" : "text-(--tf-sub)"} />
              </button>
            </li>
          );
        })}
      </ul>

      {list.length === 0 && (
        <div className="mt-2">
          <EmptyState
            title={view === "fav" ? "즐겨찾기한 골프장이 없어요" : "검색 결과가 없어요"}
            body={view === "fav" ? "목록에서 하트를 눌러 자주 가는 골프장을 모아 보세요." : "이름이나 지역을 다시 확인해 주세요."}
          />
        </div>
      )}

      {view === "all" && region === "all" && query === "" && (
        <p className="mx-5 mt-4 rounded-2xl bg-(--tf-ink)/6 px-4 py-3 text-center text-[13px] text-(--tf-sub)">
          나머지 {TOTAL_COURSES - courses.length}곳은 연동 준비 중이에요.
        </p>
      )}
    </div>
  );
}

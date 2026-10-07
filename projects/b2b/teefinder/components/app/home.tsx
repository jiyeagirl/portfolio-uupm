"use client";

import { useMemo, useState } from "react";
import { Bell, Heart, Lightning, SlidersHorizontal } from "@phosphor-icons/react";
import { useTee } from "../../lib/store";
import { DATES, slotsFor } from "../../lib/mock-data";
import { REGIONS, type Region, type Slot } from "../../lib/types";
import { fmtDate, fmtNum, fmtWon } from "../../lib/format";
import { Badge, Button, Chip, Sheet, Wordmark, cx } from "../ui";
import { DateStrip, EmptyState, InkHeader, SectionTitle, type AppNav } from "./parts";

type RegionSel = "all" | Region;
const PRICES = [0, 150000, 200000, 250000] as const;

const priceLabel = (p: number) => (p === 0 ? "가격 무관" : `${p / 10000}만 원 이하`);

export function HomeScreen({ nav, q }: { nav: AppNav; q: Record<string, string> }) {
  const { courses, favorites, toggleFavorite, inbox } = useTee();
  const [date, setDate] = useState(q.date && DATES.includes(q.date) ? q.date : DATES[0]);
  const [region, setRegion] = useState<RegionSel>((REGIONS as string[]).includes(q.region ?? "") ? (q.region as Region) : "all");
  const [maxFee, setMaxFee] = useState<number>(q.maxFee ? Number(q.maxFee) : 0);
  const [sheet, setSheet] = useState(q.sheet === "1");
  const unread = inbox.filter((n) => !n.read).length;

  const pick = (courseId: string, d: string): Slot[] => {
    const list = slotsFor(courseId, d).filter((s) => s.status !== "closed");
    return maxFee ? list.filter((s) => s.fee <= maxFee) : list;
  };

  const targets = useMemo(() => courses.filter((c) => region === "all" || c.region === region), [courses, region]);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const d of DATES) m[d] = targets.reduce((sum, c) => sum + pick(c.id, d).length, 0);
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targets, maxFee]);

  const rows = targets
    .map((c) => ({ course: c, slots: pick(c.id, date) }))
    .filter((r) => r.slots.length > 0)
    .sort((a, b) => a.slots[0].time.localeCompare(b.slots[0].time));

  const cancels = rows.flatMap((r) => r.slots.filter((s) => s.status === "cancel")).slice(0, 4);
  const nameOf = (id: string) => courses.find((c) => c.id === id)?.name ?? "";

  return (
    <div className="min-h-full bg-(--tf-paper) pb-8">
      <InkHeader className="rounded-b-[32px]">
        <div className="flex items-center justify-between">
          <Wordmark size={20} />
          <button
            type="button"
            aria-label={`알림함, 안 읽은 알림 ${unread}건`}
            onClick={() => nav.setTab("alerts")}
            className="relative flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10"
          >
            <Bell size={24} />
            {unread > 0 && <span className="tf-num absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-(--tf-brass) px-1 text-[11px] font-bold text-(--tf-ink)">{unread}</span>}
          </button>
        </div>

        <p className="tf-heading mt-5 text-[26px] leading-[1.3]">
          김회원 님,
          <br />
          비어 있는 자리를 모았어요
        </p>

        <button
          type="button"
          onClick={() => setSheet(true)}
          className="mt-5 flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl bg-(--tf-ink-2) px-4 text-left"
        >
          <span className="tf-heading text-[16px] leading-[24px]">
            <u className="decoration-(--tf-brass) decoration-2 underline-offset-4">{fmtDate(date)}</u>
            {", "}
            <u className="decoration-(--tf-brass) decoration-2 underline-offset-4">{region === "all" ? "전국" : region}</u>
            {", "}
            <u className="decoration-(--tf-brass) decoration-2 underline-offset-4">{priceLabel(maxFee)}</u>
          </span>
          <SlidersHorizontal size={20} className="shrink-0 text-(--tf-brass)" aria-label="조건 바꾸기" />
        </button>

        <div className="mt-4">
          <DateStrip dates={DATES} value={date} onChange={setDate} count={(d) => counts[d]} />
        </div>
      </InkHeader>

      {cancels.length > 0 && (
        <section aria-label="취소티" className="tf-rise mx-5 mt-5 rounded-3xl bg-(--tf-cancel) p-4 text-white">
          <p className="flex items-center gap-1.5 text-[14px] font-bold">
            <Lightning size={16} weight="fill" aria-hidden />
            {fmtDate(date)} 취소티 {cancels.length}건이 나왔어요
          </p>
          <div className="tf-scroll-x -mx-4 mt-3 flex gap-2 px-4">
            {cancels.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => nav.openCourse(s.courseId, s.date, s.id)}
                className="flex min-h-14 shrink-0 flex-col items-start justify-center rounded-2xl bg-white px-4 text-left text-(--tf-cancel)"
              >
                <span className="tf-num text-[20px] font-bold leading-6">{s.time}</span>
                <span className="text-[12px] font-semibold text-(--tf-text)">{nameOf(s.courseId)}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="mt-6">
        <SectionTitle right={<span className="tf-num text-[13px] font-semibold text-(--tf-sub)">총 {fmtNum(rows.length)}곳</span>}>빈 티타임이 있는 골프장</SectionTitle>
      </div>

      <div className="mt-3 flex flex-col gap-3 px-5">
        {rows.map(({ course, slots }, i) => {
          const first = slots[0];
          const rest = slots.slice(1);
          const fav = favorites.includes(course.id);
          const lowest = Math.min(...slots.map((s) => s.fee));
          return (
            <article key={course.id} className="tf-rise overflow-hidden rounded-3xl border border-(--tf-line) bg-white" style={{ animationDelay: `${Math.min(i, 5) * 30}ms` }}>
              <div className="relative flex">
                <button
                  type="button"
                  onClick={() => nav.openCourse(course.id, date, first.id)}
                  className="tf-press flex min-h-[96px] flex-1 items-stretch text-left"
                  aria-label={`${course.name}, ${first.time} 외 빈 자리 ${slots.length}개`}
                >
                  <span className="flex w-[104px] shrink-0 flex-col justify-center border-r border-dashed border-(--tf-ink)/25 bg-[#EFEADB] px-4">
                    <span className="text-[11px] font-medium text-(--tf-sub)">가장 이른 자리</span>
                    <span className="tf-num text-[28px] font-bold leading-9 text-(--tf-ink)">{first.time}</span>
                    {first.status === "cancel" && <Badge kind="slot:cancel" size="sm" />}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col justify-center py-3 pl-4 pr-14">
                    <span className="truncate text-[16px] font-bold text-(--tf-text)">{course.name}</span>
                    <span className="mt-0.5 truncate text-[12.5px] text-(--tf-sub)">
                      {course.area} | {first.layout} 코스
                    </span>
                    <span className="tf-num mt-1.5 text-[15px] font-bold text-(--tf-text)">
                      {fmtWon(lowest)}
                      <span className="ml-1 text-[12px] font-medium text-(--tf-sub)">부터, 빈 자리 {slots.length}개</span>
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  aria-pressed={fav}
                  aria-label={`${course.name} 즐겨찾기 ${fav ? "해제" : "추가"}`}
                  onClick={() => toggleFavorite(course.id)}
                  className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full"
                >
                  <Heart size={22} weight={fav ? "fill" : "regular"} className={fav ? "text-(--tf-brass)" : "text-(--tf-sub)"} />
                </button>
              </div>
              {rest.length > 0 && (
                <div className="tf-scroll-x flex gap-2 border-t border-(--tf-line) px-4 py-3">
                  {rest.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => nav.openCourse(course.id, date, s.id)}
                      className={cx(
                        "tf-num inline-flex min-h-11 shrink-0 items-center gap-1 rounded-xl px-3.5 text-[15px] font-bold",
                        s.status === "cancel" ? "bg-(--tf-cancel) text-white" : "bg-(--tf-ink)/6 text-(--tf-ink)",
                      )}
                    >
                      {s.status === "cancel" && <Lightning size={13} weight="fill" aria-label="취소티" />}
                      {s.time}
                    </button>
                  ))}
                </div>
              )}
            </article>
          );
        })}
        {rows.length === 0 && (
          <EmptyState
            title="조건에 맞는 자리가 없어요"
            body="날짜를 바꾸거나 지역과 가격 조건을 넓혀 보세요."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setRegion("all");
                  setMaxFee(0);
                }}
              >
                조건 초기화
              </Button>
            }
          />
        )}
      </div>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="조건 바꾸기">
        <p className="mb-2 text-[13px] font-semibold text-(--tf-sub)">지역</p>
        <div className="flex flex-wrap gap-2">
          <Chip active={region === "all"} onClick={() => setRegion("all")}>전국</Chip>
          {REGIONS.map((r) => (
            <Chip key={r} active={region === r} onClick={() => setRegion(r)}>{r}</Chip>
          ))}
        </div>
        <p className="mb-2 mt-5 text-[13px] font-semibold text-(--tf-sub)">그린피</p>
        <div className="flex flex-wrap gap-2">
          {PRICES.map((p) => (
            <Chip key={p} active={maxFee === p} onClick={() => setMaxFee(p)}>{priceLabel(p)}</Chip>
          ))}
        </div>
        <Button full className="mt-7" onClick={() => setSheet(false)}>
          {fmtDate(date)} 자리 {rows.length}곳 보기
        </Button>
      </Sheet>
    </div>
  );
}

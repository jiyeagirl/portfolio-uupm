"use client";

import { useState } from "react";
import { BellRinging, CaretLeft, Heart, Lightning } from "@phosphor-icons/react";
import { useTee } from "../../lib/store";
import { DATES, slotsFor } from "../../lib/mock-data";
import { fmtDate, fmtWon } from "../../lib/format";
import { Badge, Button, cx, type StatusKey } from "../ui";
import { Contour, DateStrip, EmptyState, type AppNav } from "./parts";

export function CourseDetailScreen({
  nav,
  courseId,
  initialDate,
  initialSlotId,
  onBack,
}: {
  nav: AppNav;
  courseId: string;
  initialDate?: string;
  initialSlotId?: string;
  onBack: () => void;
}) {
  const { courses, favorites, toggleFavorite, accounts } = useTee();
  const course = courses.find((c) => c.id === courseId);
  const [date, setDate] = useState(initialDate && DATES.includes(initialDate) ? initialDate : DATES[0]);
  const [picked, setPicked] = useState<string | undefined>(initialSlotId);

  if (!course) return null;
  const slots = slotsFor(course.id, date);
  const fav = favorites.includes(course.id);
  const acc = accounts.find((a) => a.courseId === course.id);
  const accKey: StatusKey = acc ? (`account:${acc.status}` as StatusKey) : "account:none";
  const target = slots.find((s) => s.id === picked && s.status !== "closed") ?? slots.find((s) => s.status !== "closed");
  const down = course.status === "error";

  return (
    <div className="flex h-full flex-col bg-(--tf-paper)">
      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none]">
        <header className="relative overflow-hidden rounded-b-[32px] bg-(--tf-ink) pt-[59px] text-white">
          <Contour />
          <div className="relative px-5 pb-5 pt-1">
            <div className="flex items-center justify-between">
              <button type="button" onClick={onBack} aria-label="뒤로" className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10">
                <CaretLeft size={22} weight="bold" />
              </button>
              <button
                type="button"
                aria-pressed={fav}
                aria-label={`즐겨찾기 ${fav ? "해제" : "추가"}`}
                onClick={() => toggleFavorite(course.id)}
                className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10"
              >
                <Heart size={24} weight={fav ? "fill" : "regular"} className={fav ? "text-(--tf-brass)" : "text-white"} />
              </button>
            </div>
            <h1 className="tf-heading mt-1 text-[30px] leading-[1.2]">{course.name}</h1>
            <p className="mt-1 text-[13px] text-white/70">
              {course.area} | {course.layouts.map((l) => `${l} 코스`).join(", ")}
            </p>
            <div className="mt-3 flex items-center gap-2 text-[12px] text-white/80">
              <span>내 계정</span>
              <Badge kind={accKey} size="sm" />
            </div>
            <div className="mt-4">
              <DateStrip dates={DATES} value={date} onChange={setDate} count={(d) => slotsFor(course.id, d).filter((s) => s.status !== "closed").length} />
            </div>
          </div>
        </header>

        <section className="px-5 pb-6 pt-5">
          <div className="flex items-baseline justify-between">
            <h2 className="tf-heading text-[20px] text-(--tf-ink)">{fmtDate(date)} 티타임</h2>
            <span className="text-[12px] text-(--tf-sub)">자리를 눌러 선택</span>
          </div>

          {slots.length === 0 ? (
            <div className="-mx-5 mt-3">
              <EmptyState
                title={down ? "수집 점검 중이에요" : "이 날은 등록된 티타임이 없어요"}
                body={down ? "운영자가 수집 설정을 확인하고 있어요. 잠시 후 다시 확인해 주세요." : "다른 날짜를 선택해 보세요."}
              />
            </div>
          ) : (
            <div className="mt-3 overflow-hidden rounded-2xl border border-(--tf-line) bg-white">
              <div className="grid grid-cols-[64px_1fr_92px_88px] items-center gap-x-2 border-b border-(--tf-line) bg-[#EFEADB] px-4 py-2 text-[12px] font-semibold text-(--tf-sub)">
                <span>시간</span>
                <span>코스</span>
                <span className="text-right">그린피</span>
                <span className="text-right">상태</span>
              </div>
              <ul>
                {slots.map((s) => {
                  const closed = s.status === "closed";
                  const sel = target?.id === s.id;
                  return (
                    <li key={s.id} className="border-b border-(--tf-line) last:border-b-0">
                      <button
                        type="button"
                        disabled={closed}
                        onClick={() => setPicked(s.id)}
                        aria-pressed={sel}
                        className={cx(
                          "grid min-h-[52px] w-full grid-cols-[64px_1fr_92px_88px] items-center gap-x-2 px-4 text-left disabled:cursor-not-allowed",
                          sel && "bg-(--tf-ink)/7 shadow-[inset_3px_0_0_var(--tf-ink)]",
                        )}
                      >
                        <span className={cx("tf-num text-[17px] font-bold", closed ? "text-[#8A938E]" : "text-(--tf-ink)")}>{s.time}</span>
                        <span className={cx("text-[14px]", closed ? "text-[#8A938E]" : "text-(--tf-text)")}>{s.layout}</span>
                        <span className={cx("tf-num text-right text-[14px] font-semibold", closed ? "text-[#8A938E]" : "text-(--tf-text)")}>{fmtWon(s.fee)}</span>
                        <span className="flex justify-end">
                          <Badge kind={`slot:${s.status}` as StatusKey} size="sm" />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      </div>

      <footer className="shrink-0 border-t border-(--tf-line) bg-white px-5 pb-9 pt-3">
        <p className="mb-2 text-center text-[12.5px] text-(--tf-sub)">
          {target ? (
            <>
              선택한 자리 <span className="tf-num font-bold text-(--tf-ink)">{fmtDate(target.date)} {target.time}</span>
              {target.status === "cancel" && (
                <span className="ml-1 inline-flex items-center gap-0.5 font-bold text-(--tf-cancel)">
                  <Lightning size={12} weight="fill" aria-hidden />
                  취소티
                </span>
              )}
            </>
          ) : (
            "예약 가능한 자리가 없어요. 알림을 받아 보세요"
          )}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => nav.addAlertFor({ courseId: course.id, date })}>
            <BellRinging size={18} weight="bold" aria-hidden />
            이 자리 알림 받기
          </Button>
          <Button className="flex-1" disabled={!target} onClick={() => target && nav.openWebview(target.id)}>
            예약하러 가기
          </Button>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState } from "react";
import { BellRinging, Lightning, Megaphone, Plus, Trash } from "@phosphor-icons/react";
import { Toggle } from "@/components/shared/toggle";
import { useTee } from "../../lib/store";
import { DATES } from "../../lib/mock-data";
import { BAND_LABEL, fmtDate, fmtWon } from "../../lib/format";
import type { TimeBand } from "../../lib/types";
import { Button, Chip, Field, Sheet, cx, inputCls } from "../ui";
import { EmptyState, InkHeader, type AlertPrefill, type AppNav } from "./parts";

const FEES = [150000, 200000, 250000, 300000];
const BANDS: TimeBand[] = ["all", "dawn", "am", "pm"];

export function AlertsScreen({ nav, q, prefill, onPrefillUsed }: { nav: AppNav; q: Record<string, string>; prefill: AlertPrefill | null; onPrefillUsed: () => void }) {
  const { courses, conditions, toggleCondition, deleteCondition, addCondition, inbox, markRead, markAllRead, triggerDemoPush, demoPushLeft } = useTee();
  const [sub, setSub] = useState<"conditions" | "inbox">(q.sub === "inbox" ? "inbox" : "conditions");
  const [sheet, setSheet] = useState(prefill !== null || q.sheet === "1");
  const [courseId, setCourseId] = useState(prefill?.courseId ?? "c01");
  const [date, setDate] = useState(prefill?.date ?? DATES[3]);
  const [band, setBand] = useState<TimeBand>("all");
  const [fee, setFee] = useState(250000);

  const unread = inbox.filter((n) => !n.read).length;
  const nameOf = (id: string) => courses.find((c) => c.id === id)?.name ?? "";

  const close = () => {
    setSheet(false);
    onPrefillUsed();
  };

  return (
    <div className="min-h-full bg-(--tf-paper) pb-8">
      <InkHeader title="취소티 알림" sub="조건에 맞는 자리가 나면 바로 알려드려요">
        <div className="mt-4">
          <div role="tablist" className="flex rounded-xl bg-white/12 p-1">
            {(
              [
                ["conditions", `내 조건 ${conditions.length}`],
                ["inbox", `알림함${unread ? ` ${unread}` : ""}`],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                role="tab"
                type="button"
                aria-selected={sub === k}
                onClick={() => setSub(k)}
                className={cx("min-h-10 flex-1 rounded-lg text-[14px] font-semibold transition-colors duration-150", sub === k ? "bg-(--tf-paper) text-(--tf-ink)" : "text-white/80")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </InkHeader>

      {sub === "conditions" ? (
        <div className="px-5 pt-5">
          <Button full onClick={() => setSheet(true)}>
            <Plus size={18} weight="bold" aria-hidden />
            조건 추가
          </Button>
          <ul className="mt-4 flex flex-col gap-3">
            {conditions.map((c) => (
              <li key={c.id} className={cx("rounded-2xl border border-(--tf-line) bg-white p-4", !c.on && "bg-white/70")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={cx("truncate text-[16px] font-bold", c.on ? "text-(--tf-text)" : "text-(--tf-sub)")}>{nameOf(c.courseId)}</p>
                    <p className="tf-num mt-1 text-[14px] text-(--tf-text)">{fmtDate(c.date)}</p>
                    <p className="mt-0.5 text-[13px] text-(--tf-sub)">
                      {BAND_LABEL[c.band]} | <span className="tf-num">{fmtWon(c.maxFee)}</span> 이하
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Toggle checked={c.on} onChange={() => toggleCondition(c.id)} label={`${nameOf(c.courseId)} 알림 ${c.on ? "끄기" : "켜기"}`} onClassName="bg-(--tf-ink)" offClassName="bg-[#C9CFCB]" />
                    <span className={cx("text-[11px] font-semibold", c.on ? "text-[#166534]" : "text-(--tf-sub)")}>{c.on ? "켜짐" : "꺼짐"}</span>
                  </div>
                </div>
                <div className="mt-3 flex justify-end border-t border-(--tf-line) pt-2">
                  <button type="button" onClick={() => deleteCondition(c.id)} className="flex min-h-11 items-center gap-1 rounded-lg px-2 text-[13px] font-semibold text-(--tf-danger)">
                    <Trash size={16} aria-hidden />
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {conditions.length === 0 && <EmptyState title="알림 조건이 없어요" body="골프장과 날짜, 가격을 정해 두면 취소티가 나는 즉시 알려드려요." />}
        </div>
      ) : (
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-(--tf-sub)">같은 자리는 한 번만 알려드려요</span>
            <button type="button" onClick={markAllRead} disabled={unread === 0} className="min-h-11 px-1 text-[13px] font-semibold text-(--tf-ink) disabled:text-[#8A938E]">
              모두 읽음
            </button>
          </div>
          <ul className="flex flex-col gap-2.5">
            {inbox.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    markRead(n.id);
                    if (n.kind === "cancel" && n.slotId) nav.openWebview(n.slotId);
                  }}
                  className={cx("tf-press flex w-full items-start gap-3 rounded-2xl border p-4 text-left", n.read ? "border-(--tf-line) bg-white/70" : "border-(--tf-ink)/20 bg-white")}
                >
                  <span
                    className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", n.kind === "cancel" ? "bg-(--tf-cancel) text-white" : "bg-(--tf-brass)/20 text-(--tf-brass-ink)")}
                    aria-hidden
                  >
                    {n.kind === "cancel" ? <Lightning size={20} weight="fill" /> : <Megaphone size={20} weight="fill" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className={cx("text-[12px] font-bold", n.kind === "cancel" ? "text-(--tf-cancel)" : "text-(--tf-brass-ink)")}>{n.kind === "cancel" ? "취소티" : "운영자 공지"}</span>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-(--tf-danger)" aria-label="안 읽음" />}
                      <span className="ml-auto text-[12px] text-(--tf-sub)">{n.at}</span>
                    </span>
                    <span className="mt-0.5 block text-[15px] font-bold text-(--tf-text)">{n.title}</span>
                    <span className={cx("mt-0.5 block text-[13.5px] leading-[20px]", n.kind === "cancel" ? "tf-num text-(--tf-text)" : "text-(--tf-sub)")}>{n.body}</span>
                    {n.kind === "cancel" && <span className="mt-2 inline-block text-[12.5px] font-semibold text-(--tf-ink)">눌러서 예약하러 가기</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={triggerDemoPush}
            disabled={demoPushLeft <= 0}
            className="mx-auto mt-5 flex min-h-11 items-center gap-1.5 rounded-full border border-dashed border-(--tf-ink)/35 px-4 text-[12.5px] font-semibold text-(--tf-sub) disabled:opacity-50"
          >
            <BellRinging size={15} aria-hidden />
            {demoPushLeft > 0 ? "(시연) 취소티 푸시 도착" : "(시연) 새로 올 취소티가 없어요"}
          </button>
        </div>
      )}

      <Sheet open={sheet} onClose={close} title="알림 조건 추가">
        <div className="space-y-4">
          <Field label="골프장">
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className={inputCls}>
              {courses
                .filter((c) => c.status !== "error")
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
          </Field>
          <Field label="날짜">
            <select value={date} onChange={(e) => setDate(e.target.value)} className={inputCls}>
              {DATES.map((d) => (
                <option key={d} value={d}>{fmtDate(d)}</option>
              ))}
            </select>
          </Field>
          <div>
            <p className="mb-1.5 text-[13px] font-semibold">시간대</p>
            <div className="flex flex-wrap gap-2">
              {BANDS.map((b) => (
                <Chip key={b} active={band === b} onClick={() => setBand(b)}>{BAND_LABEL[b]}</Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[13px] font-semibold">최대 그린피</p>
            <div className="flex flex-wrap gap-2">
              {FEES.map((f) => (
                <Chip key={f} active={fee === f} onClick={() => setFee(f)}>{fmtWon(f)}</Chip>
              ))}
            </div>
          </div>
        </div>
        <Button
          full
          className="mt-6"
          onClick={() => {
            addCondition({ courseId, date, band, maxFee: fee });
            setSub("conditions");
            close();
            nav.toast("알림 조건을 추가했어요");
          }}
        >
          조건 저장
        </Button>
      </Sheet>
    </div>
  );
}

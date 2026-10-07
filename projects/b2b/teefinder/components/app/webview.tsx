"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowClockwise, CheckCircle, Lock, SpinnerGap, X } from "@phosphor-icons/react";
import { useTee } from "../../lib/store";
import { slotById } from "../../lib/mock-data";
import { fmtDate, fmtWon, maskPw } from "../../lib/format";
import { Button, cx } from "../ui";

const STEPS = ["아이디, 비밀번호 자동 입력", "로그인 완료", "선택한 날짜, 시간의 예약 페이지로 이동"];

export function WebviewScreen({ slotId, onClose, q }: { slotId: string; onClose: () => void; q: Record<string, string> }) {
  const { courses, accounts } = useTee();
  const slot = slotById(slotId);
  const course = courses.find((c) => c.id === slot?.courseId);
  const frozen = q.step !== undefined;
  const [done, setDone] = useState(frozen ? Number(q.step) : 0);
  const [solved, setSolved] = useState(false);
  const [code, setCode] = useState("");
  const [typed, setTyped] = useState(frozen && Number(q.step) >= 1 ? 99 : 0);
  const [cheer, setCheer] = useState(frozen && Number(q.step) === 3 && q.cheer === "1");

  const captcha = course?.loginType === "captcha";
  const waiting = captcha && done === 1 && !solved;
  const loginId = accounts.find((a) => a.courseId === course?.id)?.loginId ?? "kim_member01";

  useEffect(() => {
    if (frozen || waiting || done >= 3) return;
    const t = window.setTimeout(() => setDone((d) => d + 1), done === 0 ? 1500 : 1400);
    return () => window.clearTimeout(t);
  }, [done, waiting, frozen]);

  useEffect(() => {
    if (done !== 0 || frozen) return;
    const t = window.setInterval(() => setTyped((n) => n + 1), 90);
    return () => window.clearInterval(t);
  }, [done, frozen]);

  useEffect(() => {
    if (done === 3 && !frozen) {
      const a = window.setTimeout(() => setCheer(true), 0);
      const b = window.setTimeout(() => setCheer(false), 2000);
      return () => {
        window.clearTimeout(a);
        window.clearTimeout(b);
      };
    }
  }, [done, frozen]);

  if (!slot || !course) return null;
  const host = course.domain.replace("https://", "");
  const idShown = loginId.slice(0, Math.min(typed, loginId.length));
  const pwShown = maskPw(Math.min(Math.max(typed - 2, 0), 8));

  return (
    <div className="relative flex h-full flex-col bg-white">
      <header className="shrink-0 border-b border-[#E3E5E3] bg-[#F4F5F4] pt-[59px]">
        <div className="flex h-[52px] items-center gap-2 px-3">
          <button type="button" onClick={onClose} aria-label="닫기" className="flex h-11 w-11 items-center justify-center rounded-full text-(--tf-ink) hover:bg-black/5">
            <X size={22} weight="bold" />
          </button>
          <div className="flex h-9 min-w-0 flex-1 items-center gap-1.5 rounded-xl bg-white px-3 text-[13px] text-(--tf-text)">
            <Lock size={13} weight="fill" className="shrink-0 text-(--tf-sub)" aria-hidden />
            <span className="truncate">{host}</span>
          </div>
          <span className="flex h-11 w-11 items-center justify-center text-(--tf-sub)">
            <ArrowClockwise size={20} aria-hidden />
          </span>
        </div>
      </header>

      {/* 목업 골프장 예약 사이트 */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-white pb-[250px] [scrollbar-width:none]">
        <div className="flex h-12 items-center justify-between bg-[#3A4A66] px-4 text-white">
          <span className="text-[15px] font-bold">{course.name}</span>
          <span className="text-[11px] text-white/70">온라인 예약</span>
        </div>

        {done < 2 && (
          <div className="px-6 pt-8">
            <h2 className="text-[19px] font-bold text-[#222]">회원 로그인</h2>
            <div className="mt-5 space-y-3">
              <div>
                <p className="mb-1 text-[12px] text-[#666]">아이디</p>
                <div className="tf-num flex h-11 items-center rounded border border-[#CCC] px-3 text-[14px] text-[#222]">
                  {idShown}
                  {done === 0 && <span className="ml-px h-4 w-px animate-pulse bg-[#222]" />}
                </div>
              </div>
              <div>
                <p className="mb-1 text-[12px] text-[#666]">비밀번호</p>
                <div className="tf-num flex h-11 items-center rounded border border-[#CCC] px-3 text-[14px] tracking-widest text-[#222]">{pwShown}</div>
              </div>

              {captcha && done >= 1 && (
                <div className="rounded border border-[#CCC] bg-[#FAFAFA] p-3">
                  <p className="mb-2 text-[12px] font-bold text-[#222]">보안문자</p>
                  <svg width="140" height="44" viewBox="0 0 140 44" className="rounded bg-[#E9ECEF]" role="img" aria-label="보안문자 이미지">
                    <path d="M0 12L140 30M0 34L140 10M20 0L60 44" stroke="#9AA5B1" strokeWidth="1.2" />
                    <text x="14" y="31" fontSize="26" fontWeight="700" fill="#33415C" letterSpacing="6" transform="rotate(-4 70 22)">
                      7K2P9
                    </text>
                  </svg>
                  {waiting ? (
                    <>
                      <p className="mt-2 text-[13px] font-semibold text-(--tf-cancel)">보안문자를 직접 입력해 주세요</p>
                      <div className="mt-2 flex gap-2">
                        <input
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          placeholder="문자 5자리"
                          aria-label="보안문자 입력"
                          className="tf-num h-11 min-w-0 flex-1 rounded border border-[#999] bg-white px-3 text-[15px] text-[#222] focus:border-(--tf-ink) focus:outline-none"
                        />
                        <Button size="sm" className="min-h-11" disabled={code.trim().length < 4} onClick={() => setSolved(true)}>
                          확인
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="mt-2 text-[12px] text-[#666]">입력이 확인되었습니다</p>
                  )}
                </div>
              )}

              <div className={cx("flex h-11 items-center justify-center rounded bg-[#3A4A66] text-[14px] font-bold text-white", waiting && "opacity-50")}>로그인</div>
            </div>
          </div>
        )}

        {done === 2 && (
          <div className="px-6 pt-8">
            <p className="text-[17px] font-bold text-[#222]">김회원 님 환영합니다</p>
            <p className="mt-1 text-[13px] text-[#666]">예약 페이지로 이동하고 있습니다...</p>
            <div className="mt-5 h-1.5 overflow-hidden rounded bg-[#E3E5E3]">
              <motion.div className="h-full bg-[#3A4A66]" initial={{ width: "10%" }} animate={{ width: "92%" }} transition={{ duration: 1.3, ease: "easeInOut" }} />
            </div>
          </div>
        )}

        {done >= 3 && (
          <div className="px-6 pt-6">
            <h2 className="text-[19px] font-bold text-[#222]">예약 정보 확인</h2>
            <dl className="mt-4 divide-y divide-[#E3E5E3] rounded border border-[#CCC] text-[14px]">
              {[
                ["골프장", course.name],
                ["날짜", fmtDate(slot.date)],
                ["시간", slot.time],
                ["코스", `${slot.layout} 코스`],
                ["그린피", fmtWon(slot.fee)],
              ].map(([k, v]) => (
                <div key={k} className="flex h-11 items-center justify-between px-3">
                  <dt className="text-[#666]">{k}</dt>
                  <dd className="tf-num font-semibold text-[#222]">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex h-11 items-center justify-center rounded bg-[#3A4A66] text-[14px] font-bold text-white">예약 신청</div>
            <p className="mt-2 text-center text-[12px] text-[#888]">예약 완료 처리는 이 목업에 포함되지 않습니다</p>
          </div>
        )}
      </div>

      {/* 자동화 진행 패널 */}
      <aside aria-label="자동 로그인 진행 상황" className="absolute inset-x-0 bottom-0 z-10 rounded-t-[28px] bg-(--tf-ink) px-5 pb-10 pt-5 text-white">
        <p className="tf-heading text-[18px]">TeeFinder가 대신 진행해요</p>
        <ol className="mt-3 space-y-2.5">
          {STEPS.map((label, i) => {
            const complete = done > i && !(i === 0 && waiting);
            const active = !waiting && done === i;
            const holding = i === 0 && waiting;
            return (
              <li key={label} className="flex items-center gap-3 text-[14px]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                  {complete ? (
                    <CheckCircle size={22} weight="fill" className="text-[#7FD6A0]" aria-label="완료" />
                  ) : active && !holding ? (
                    <SpinnerGap size={20} className="animate-spin text-(--tf-brass)" aria-label="진행 중" />
                  ) : holding ? (
                    <span className="h-3 w-3 rounded-full bg-(--tf-brass)" aria-label="입력 대기" />
                  ) : (
                    <span className="h-3 w-3 rounded-full border border-white/40" aria-label="대기" />
                  )}
                </span>
                <span className={cx(complete || active ? "font-semibold text-white" : "text-white/55")}>
                  <span className="tf-num mr-1.5 text-white/60">{i + 1}</span>
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
        {waiting && <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-[13px] text-white/90">이 골프장은 보안문자 확인이 필요해 입력 후 이어서 진행해요.</p>}
      </aside>

      {/* 홀인 */}
      {cheer && (
        <motion.div
          role="status"
          className="absolute left-1/2 top-[210px] z-20 flex w-[210px] -translate-x-1/2 flex-col items-center rounded-3xl bg-white px-5 pb-5 pt-4 shadow-[0_12px_40px_rgba(14,42,34,0.3)]"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <svg width="120" height="84" viewBox="0 0 120 84" fill="none" aria-hidden>
            <ellipse cx="60" cy="66" rx="40" ry="10" fill="#0E2A22" />
            <ellipse cx="60" cy="64" rx="40" ry="10" fill="#17382E" stroke="#B58532" strokeWidth="1.5" />
            <ellipse cx="60" cy="66" rx="14" ry="4.5" fill="#05140F" />
            <path d="M94 62V16l16 7-16 7" stroke="#B58532" strokeWidth="2" strokeLinejoin="round" />
            <motion.circle
              cx="60"
              r="8"
              fill="#F5F1E6"
              stroke="#0E2A22"
              strokeWidth="1"
              initial={{ cy: -8, scale: 1 }}
              animate={{ cy: 66, scale: 0.55 }}
              transition={{ duration: 0.6, ease: [0.5, 0, 0.9, 0.6] }}
            />
          </svg>
          <p className="tf-heading mt-1 text-[18px] text-(--tf-ink)">홀인</p>
          <p className="text-[12.5px] text-(--tf-sub)">예약 페이지에 도착했어요</p>
        </motion.div>
      )}
    </div>
  );
}

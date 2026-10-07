"use client";

import { useState } from "react";
import { LockKey, PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { useTee } from "../../lib/store";
import { maskPw } from "../../lib/format";
import { Badge, Button, Dialog, Field, Sheet, cx, inputCls, type StatusKey } from "../ui";
import { InkHeader, type AppNav } from "./parts";

export function ProfileScreen({ nav, q, onWithdrawn }: { nav: AppNav; q: Record<string, string>; onWithdrawn: () => void }) {
  const { sessionMember: me, courses, accounts, upsertAccount, deleteAccount, withdraw } = useTee();
  const [sheet, setSheet] = useState<null | { courseId: string; edit: boolean }>(q.sheet === "1" ? { courseId: "c05", edit: false } : null);
  const [loginId, setLoginId] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState(q.dialog === "withdraw");
  const [destroyed, setDestroyed] = useState<number | null>(q.dialog === "done" ? accounts.length : null);

  if (!me) return null;
  const nameOf = (id: string) => courses.find((c) => c.id === id)?.name ?? "";
  const unregistered = courses.filter((c) => c.status !== "error" && !accounts.some((a) => a.courseId === c.id));

  const openSheet = (courseId: string, edit: boolean) => {
    setLoginId(edit ? (accounts.find((a) => a.courseId === courseId)?.loginId ?? "") : "");
    setPw("");
    setSheet({ courseId, edit });
  };

  return (
    <div className="min-h-full bg-(--tf-paper) pb-8">
      <InkHeader title="내 정보">
        <div className="mt-4 rounded-3xl bg-(--tf-ink-2) p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="tf-heading text-[22px]">{me.name}</p>
              <p className="tf-num mt-1 text-[13px] text-white/70">{me.phone}</p>
            </div>
            <Badge kind="member:approved" />
          </div>
          <div className="mt-4 border-t border-dashed border-white/25 pt-3">
            <p className="text-[11px] text-white/60">회원권</p>
            <p className="mt-0.5 text-[14px] font-semibold">{me.membershipName}</p>
            <p className="tf-num mt-0.5 text-[16px] font-bold tracking-wider text-[#E7C98B]">{me.membershipNo}</p>
          </div>
        </div>
      </InkHeader>

      <section className="px-5 pt-6">
        <div className="flex items-end justify-between">
          <h2 className="tf-heading text-[20px] text-(--tf-ink)">골프장 계정</h2>
          <span className="tf-num text-[13px] font-semibold text-(--tf-sub)">{accounts.length}곳 등록</span>
        </div>
        <p className="mt-1 flex items-center gap-1 text-[12.5px] text-(--tf-sub)">
          <LockKey size={14} weight="fill" aria-hidden />
          암호화되어 보관됩니다
        </p>

        <ul className="mt-3 flex flex-col gap-2.5">
          {accounts.map((a) => (
            <li key={a.courseId} className="rounded-2xl border border-(--tf-line) bg-white px-4 pb-1 pt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold text-(--tf-text)">{nameOf(a.courseId)}</p>
                  <p className="tf-num mt-1 text-[13px] text-(--tf-sub)">
                    {a.loginId} | {maskPw()}
                  </p>
                </div>
                <Badge kind={`account:${a.status}` as StatusKey} size="sm" />
              </div>
              {a.status !== "ok" && (
                <p className={cx("mt-2 text-[12.5px]", a.status === "failed" ? "text-(--tf-danger)" : "text-(--tf-cancel)")}>
                  {a.status === "failed" ? "아이디나 비밀번호가 바뀌었을 수 있어요. 다시 등록해 주세요." : "예약할 때 보안문자를 직접 입력해야 해요."}
                </p>
              )}
              <div className="mt-2 flex justify-end gap-1 border-t border-(--tf-line) pt-1.5">
                <button type="button" onClick={() => openSheet(a.courseId, true)} className="flex min-h-11 items-center gap-1 rounded-lg px-3 text-[13px] font-semibold text-(--tf-ink)">
                  <PencilSimple size={16} aria-hidden />
                  수정
                </button>
                <button type="button" onClick={() => deleteAccount(a.courseId)} className="flex min-h-11 items-center gap-1 rounded-lg px-3 text-[13px] font-semibold text-(--tf-danger)">
                  <Trash size={16} aria-hidden />
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
        {accounts.length === 0 && <p className="mt-3 rounded-2xl border border-dashed border-(--tf-ink)/25 px-4 py-6 text-center text-[13.5px] text-(--tf-sub)">등록된 계정이 없어요. 계정을 등록하면 예약할 때 자동으로 로그인돼요.</p>}

        <Button variant="outline" full className="mt-3" disabled={unregistered.length === 0} onClick={() => openSheet(unregistered[0].id, false)}>
          <Plus size={18} weight="bold" aria-hidden />
          골프장 계정 등록
        </Button>
      </section>

      <section className="mt-8 px-5">
        <button type="button" onClick={() => setConfirm(true)} className="min-h-11 w-full text-center text-[13.5px] font-semibold text-(--tf-sub) underline underline-offset-4">
          회원 탈퇴
        </button>
      </section>

      <Sheet open={sheet !== null} onClose={() => setSheet(null)} title={sheet?.edit ? "계정 수정" : "골프장 계정 등록"}>
        {sheet && (
          <div className="space-y-4">
            <Field label="골프장">
              <select
                value={sheet.courseId}
                disabled={sheet.edit}
                onChange={(e) => setSheet({ ...sheet, courseId: e.target.value })}
                className={cx(inputCls, "disabled:bg-[#EFEADB]")}
              >
                {(sheet.edit ? courses : unregistered.length ? unregistered : courses)
                  .filter((c) => c.status !== "error")
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
            </Field>
            <Field label="아이디">
              <input value={loginId} onChange={(e) => setLoginId(e.target.value)} className={inputCls} autoComplete="off" />
            </Field>
            <Field label="비밀번호" hint="암호화되어 보관됩니다">
              <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className={inputCls} autoComplete="off" placeholder={sheet.edit ? "바꿀 때만 입력" : ""} />
            </Field>
            <Button
              full
              disabled={!loginId.trim() || (!sheet.edit && !pw)}
              onClick={() => {
                upsertAccount(sheet.courseId, loginId.trim());
                setSheet(null);
                nav.toast(sheet.edit ? "계정 정보를 수정했어요" : "골프장 계정을 등록했어요");
              }}
            >
              저장
            </Button>
          </div>
        )}
      </Sheet>

      <Dialog open={confirm && destroyed === null} label="회원 탈퇴 확인">
        <h2 className="tf-heading text-[20px] text-(--tf-ink)">정말 탈퇴할까요?</h2>
        <p className="mt-2 text-[14.5px] leading-[22px] text-(--tf-text)">등록한 골프장 계정 정보가 즉시 파기됩니다. 파기된 정보는 복구할 수 없어요.</p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setConfirm(false)}>취소</Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => {
              setDestroyed(withdraw());
            }}
          >
            탈퇴하기
          </Button>
        </div>
      </Dialog>

      <Dialog open={destroyed !== null} label="탈퇴 완료">
        <h2 className="tf-heading text-[20px] text-(--tf-ink)">탈퇴가 완료되었어요</h2>
        <p className="mt-2 text-[14.5px] leading-[22px] text-(--tf-text)">
          골프장 계정 <span className="tf-num font-bold">{destroyed ?? 0}건</span>이 파기되었습니다.
        </p>
        <Button full className="mt-5" onClick={onWithdrawn}>확인</Button>
      </Dialog>
    </div>
  );
}

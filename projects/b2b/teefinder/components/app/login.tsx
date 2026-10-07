"use client";

import { useState } from "react";
import { AppleLogo, CaretLeft, ChatCircle, Check } from "@phosphor-icons/react";
import { useTee } from "../../lib/store";
import { Badge, Button, Field, Mark, cx, inputCls } from "../ui";
import { Contour, InkHeader } from "./parts";

export function AuthScreen({ q }: { q: Record<string, string> }) {
  const { loginDemo, signup } = useTee();
  const [view, setView] = useState<"welcome" | "signup">(q.view === "signup" ? "signup" : "welcome");

  if (view === "signup") return <SignupForm onBack={() => setView("welcome")} onSubmit={signup} />;

  return (
    <div className="flex h-full flex-col bg-(--tf-ink)">
      <div className="relative flex flex-1 flex-col justify-end overflow-hidden px-7 pb-10 pt-[59px] text-white">
        <Contour />
        <div className="relative">
          <Mark size={64} />
          <p className="tf-display mt-3 text-[18px] text-white/80">TeeFinder</p>
          <h1 className="tf-heading mt-3 text-[34px] leading-[1.25]">
            회원님의 자리,
            <br />
            한 번에 찾아드려요
          </h1>
          <p className="mt-3 text-[14.5px] leading-[22px] text-white/70">골프장 홈페이지를 하나씩 돌지 않아도 돼요. 빈 티타임과 취소티를 앱 하나에서 확인하세요.</p>
        </div>
      </div>

      <div className="rounded-t-[32px] bg-(--tf-paper) px-6 pb-10 pt-6">
        <div className="flex flex-col gap-2.5">
          <button type="button" onClick={loginDemo} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#FEE500] text-[15px] font-bold text-[#191919]">
            <ChatCircle size={20} weight="fill" aria-hidden />
            카카오로 시작하기
          </button>
          <button type="button" onClick={loginDemo} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-black text-[15px] font-bold text-white">
            <AppleLogo size={20} weight="fill" aria-hidden />
            Apple로 시작하기
          </button>
        </div>
        <div className="my-4 flex items-center gap-3 text-[12px] text-(--tf-sub)">
          <span className="h-px flex-1 bg-(--tf-line)" />
          처음이신가요?
          <span className="h-px flex-1 bg-(--tf-line)" />
        </div>
        <Button variant="outline" full onClick={() => setView("signup")}>회원권 번호로 가입 신청</Button>
        <p className="mt-3 text-center text-[12px] text-(--tf-sub)">회원권을 구매한 회원만 이용할 수 있어요</p>
      </div>
    </div>
  );
}

function SignupForm({ onBack, onSubmit }: { onBack: () => void; onSubmit: (f: { name: string; phone: string; membershipNo: string }) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [no, setNo] = useState("");
  const [terms, setTerms] = useState(false);
  const [keep, setKeep] = useState(false);
  const ok = name.trim().length >= 2 && phone.replace(/\D/g, "").length >= 10 && no.trim().length >= 4 && terms && keep;

  return (
    <div className="min-h-full bg-(--tf-paper) pb-10">
      <InkHeader>
        <div className="flex items-center">
          <button type="button" onClick={onBack} aria-label="뒤로" className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10">
            <CaretLeft size={22} weight="bold" />
          </button>
        </div>
        <h1 className="tf-heading mt-1 text-[28px] leading-[1.2]">가입 신청</h1>
        <p className="mt-1 text-[13px] text-white/70">운영자가 회원권 정보를 확인한 뒤 승인해 드려요</p>
      </InkHeader>

      <form
        className="space-y-4 px-5 pt-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (ok) onSubmit({ name: name.trim(), phone: phone.trim(), membershipNo: no.trim() });
        }}
      >
        <Field label="이름">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="홍길동" autoComplete="off" />
        </Field>
        <Field label="휴대폰 번호">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={cx(inputCls, "tf-num")} placeholder="010-0000-0000" inputMode="tel" autoComplete="off" />
        </Field>
        <Field label="회원권 번호" hint="회원권 카드나 계약서에 적힌 번호예요">
          <input value={no} onChange={(e) => setNo(e.target.value)} className={cx(inputCls, "tf-num")} placeholder="AL-00000" autoComplete="off" />
        </Field>

        <div className="space-y-1 pt-1">
          {(
            [
              [terms, setTerms, "[필수] 이용약관과 개인정보 처리방침에 동의합니다"],
              [keep, setKeep, "[필수] 골프장 계정 정보를 암호화하여 보관하는 데 동의합니다"],
            ] as const
          ).map(([val, set, label]) => (
            <button key={label} type="button" role="checkbox" aria-checked={val} onClick={() => set(!val)} className="flex min-h-11 w-full items-start gap-3 py-2 text-left">
              <span className={cx("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border", val ? "border-(--tf-ink) bg-(--tf-ink) text-white" : "border-[#B9C0BB] bg-white")}>
                {val && <Check size={13} weight="bold" aria-hidden />}
              </span>
              <span className="text-[13.5px] leading-[20px] text-(--tf-text)">{label}</span>
            </button>
          ))}
        </div>

        <div>
          <Button type="submit" full disabled={!ok}>가입 신청하기</Button>
          {!ok && <p className="mt-2 text-center text-[12.5px] text-(--tf-sub)">이름, 휴대폰 번호, 회원권 번호를 입력하고 동의 항목을 모두 선택해 주세요</p>}
        </div>
      </form>
    </div>
  );
}

/** 승인 대기, 반려, 이용 정지 */
export function StatusScreen() {
  const { sessionMember: me, reapply, demoSetStatus, logout } = useTee();
  if (!me) return null;
  const kind = me.status === "pending" ? "member:pending" : me.status === "rejected" ? "member:rejected" : "member:suspended";

  const copy = {
    pending: { title: "승인을 기다리고 있어요", body: "운영자가 회원권 정보를 확인하고 있어요. 승인되면 바로 이용할 수 있어요." },
    rejected: { title: "신청이 반려되었어요", body: "아래 사유를 확인하고 정보를 바로잡아 다시 신청해 주세요." },
    suspended: { title: "이용이 정지된 계정이에요", body: "자세한 내용은 운영자에게 문의해 주세요." },
    approved: { title: "", body: "" },
  }[me.status];

  return (
    <div className="min-h-full bg-(--tf-paper) pb-8">
      <InkHeader className="rounded-b-[32px]">
        <div className="flex items-center justify-between pb-6">
          <Badge kind={kind} />
          <span className="text-[12px] text-white/60">신청일 {me.appliedAt}</span>
        </div>
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden>
          <circle cx="36" cy="36" r="32" stroke="#B58532" strokeWidth="1.5" strokeDasharray="3 5" />
          <circle cx="36" cy="36" r="20" fill="#17382E" />
          <path d="M36 24v12l8 5" stroke="#F5F1E6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1 className="tf-heading mt-4 text-[28px] leading-[1.25]">{copy.title}</h1>
        <p className="mt-2 text-[14px] leading-[21px] text-white/75">{copy.body}</p>
      </InkHeader>

      <div className="px-5 pt-6">
        {me.reason && (
          <section className={cx("mb-4 rounded-2xl p-4", me.status === "rejected" ? "bg-[#FDE2E0]" : "bg-[#E8EAED]")}>
            <p className={cx("text-[12px] font-bold", me.status === "rejected" ? "text-[#B42318]" : "text-[#4B5563]")}>{me.status === "rejected" ? "반려 사유" : "정지 사유"}</p>
            <p className="mt-1 text-[15px] leading-[22px] text-(--tf-text)">{me.reason}</p>
          </section>
        )}

        <section className="rounded-2xl border border-(--tf-line) bg-white p-4">
          <h2 className="text-[13px] font-bold text-(--tf-sub)">신청 정보</h2>
          <dl className="mt-2 divide-y divide-(--tf-line) text-[14.5px]">
            {[
              ["이름", me.name],
              ["휴대폰", me.phone],
              ["회원권 번호", me.membershipNo],
            ].map(([k, v]) => (
              <div key={k} className="flex min-h-11 items-center justify-between">
                <dt className="text-(--tf-sub)">{k}</dt>
                <dd className="tf-num font-semibold text-(--tf-text)">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {me.status === "rejected" && (
          <Button full className="mt-4" onClick={reapply}>재신청</Button>
        )}

        <button type="button" onClick={logout} className="mt-3 min-h-11 w-full text-center text-[13.5px] font-semibold text-(--tf-sub) underline underline-offset-4">
          다른 계정으로 로그인
        </button>

        {me.id === "m-new" && (
          <div className="mt-6 rounded-2xl border border-dashed border-(--tf-ink)/30 p-3">
            <p className="mb-2 text-center text-[11.5px] text-(--tf-sub)">(시연) 승인됨 / 반려로 전환</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => demoSetStatus("approved")} className="min-h-11 flex-1 rounded-xl bg-white text-[13px] font-semibold text-(--tf-ink)">승인됨</button>
              <button type="button" onClick={() => demoSetStatus("rejected")} className="min-h-11 flex-1 rounded-xl bg-white text-[13px] font-semibold text-(--tf-ink)">반려로 전환</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

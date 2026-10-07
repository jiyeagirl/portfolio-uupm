"use client";

import { useState } from "react";
import { CheckCircle, UserCheck } from "@phosphor-icons/react";
import { useTee } from "../../lib/store";
import { Badge, Button, Field, cx } from "../ui";
import { Dl, PageHeader, textareaCls, useToast } from "./parts";

export function ApprovalsScreen({ initialId, initialReject }: { initialId?: string; initialReject?: boolean }) {
  const { members, approve, reject } = useTee();
  const pending = members.filter((m) => m.status === "pending");
  const [selId, setSelId] = useState<string | undefined>(initialId);
  const [rejecting, setRejecting] = useState(initialReject ?? false);
  const [reason, setReason] = useState("");
  const toast = useToast();

  const sel = pending.find((m) => m.id === selId) ?? pending[0];

  const done = (text: string) => {
    toast.show(text);
    setSelId(undefined);
    setRejecting(false);
    setReason("");
  };

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title="가입 승인" desc={`승인 대기 ${pending.length}건`} />

      {pending.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-10">
          <div className="max-w-sm text-center">
            <UserCheck size={40} className="mx-auto text-(--tf-ink)/40" aria-hidden />
            <p className="tf-heading mt-3 text-[20px] text-(--tf-ink)">처리할 가입 신청이 없습니다</p>
            <p className="mt-1 text-[13.5px] text-(--tf-sub)">새 신청이 들어오면 이 목록에 나타납니다. 전체 회원은 회원 관리에서 확인할 수 있습니다.</p>
          </div>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-[420px_1fr]">
          <ul className="overflow-y-auto border-r border-[#E3E7E3]">
            <li className="flex h-10 items-center bg-[#F3F5F3] px-5 text-[12.5px] font-semibold text-(--tf-sub)">이름, 연락처 / 회원권 번호 / 신청일</li>
            {pending.map((m) => {
              const active = sel?.id === m.id;
              return (
                <li key={m.id} className="border-b border-[#EDF0ED]">
                  <button
                    type="button"
                    onClick={() => {
                      setSelId(m.id);
                      setRejecting(false);
                      setReason("");
                    }}
                    aria-pressed={active}
                    className={cx("flex min-h-[64px] w-full items-center justify-between gap-3 px-5 py-2.5 text-left transition-colors duration-150", active ? "bg-(--tf-ink)/6 shadow-[inset_3px_0_0_var(--tf-ink)]" : "hover:bg-[#FAFBFA]")}
                  >
                    <span className="min-w-0">
                      <span className="block text-[14.5px] font-bold text-(--tf-text)">{m.name}</span>
                      <span className="tf-num mt-0.5 block text-[12.5px] text-(--tf-sub)">
                        {m.phone} | {m.membershipNo}
                      </span>
                    </span>
                    <span className="tf-num shrink-0 text-[12.5px] text-(--tf-sub)">{m.appliedAt}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {sel && (
            <div className="overflow-y-auto p-8">
              <div className="max-w-[520px]">
                <div className="flex items-center justify-between">
                  <h2 className="tf-heading text-[22px] text-(--tf-ink)">{sel.name}</h2>
                  <Badge kind="member:pending" />
                </div>
                <div className="mt-4 rounded-lg border border-[#E3E7E3] bg-white px-4">
                  <Dl
                    rows={[
                      ["연락처", <span key="p" className="tf-num">{sel.phone}</span>],
                      ["회원권 번호", <span key="n" className="tf-num">{sel.membershipNo}</span>],
                      ["회원권 종류", sel.membershipName],
                      ["신청일", <span key="a" className="tf-num">{sel.appliedAt}</span>],
                    ]}
                  />
                </div>

                {rejecting ? (
                  <div className="mt-5 rounded-lg border border-[#F1C5C1] bg-[#FDF3F2] p-4">
                    <Field label="반려 사유 (필수)" small hint="입력한 사유는 회원 앱 승인 대기 화면에 그대로 안내됩니다">
                      <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className={textareaCls} placeholder="예: 회원권 번호가 명부와 일치하지 않음" />
                    </Field>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="danger" disabled={reason.trim().length < 2} onClick={() => { reject(sel.id, reason.trim()); done(`${sel.name} 님을 반려했습니다. 회원 앱에 사유가 안내됩니다`); }}>
                        반려 확정
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setRejecting(false)}>취소</Button>
                    </div>
                    {reason.trim().length < 2 && <p className="mt-2 text-[12px] text-(--tf-sub)">사유를 입력하면 반려 확정 버튼이 켜집니다</p>}
                  </div>
                ) : (
                  <div className="mt-5 flex gap-2">
                    <Button size="sm" className="min-h-10 px-5" onClick={() => { approve(sel.id); done(`${sel.name} 님을 승인했습니다. 회원 앱에 즉시 반영됩니다`); }}>
                      <CheckCircle size={16} weight="fill" aria-hidden />
                      승인
                    </Button>
                    <Button size="sm" variant="outline" className="min-h-10 px-5" onClick={() => setRejecting(true)}>반려</Button>
                  </div>
                )}
                <p className="mt-4 text-[12.5px] text-(--tf-sub)">승인하거나 반려하면 목록과 회원 앱 상태가 바로 바뀝니다.</p>
              </div>
            </div>
          )}
        </div>
      )}
      {toast.node}
    </div>
  );
}

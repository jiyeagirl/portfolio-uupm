"use client";

import { useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { useTee } from "../../lib/store";
import type { MemberStatus } from "../../lib/types";
import { Badge, Button, Field, cx, inputSmCls } from "../ui";
import { Dl, PageHeader, textareaCls, thCls, tdCls, useToast } from "./parts";

const TABS: { key: "all" | MemberStatus; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "approved", label: "정상" },
  { key: "pending", label: "승인 대기" },
  { key: "rejected", label: "반려" },
  { key: "suspended", label: "이용 정지" },
];

export function MembersScreen({ initialId, initialStatus }: { initialId?: string; initialStatus?: string }) {
  const { members, suspend, unsuspend } = useTee();
  const [tab, setTab] = useState<"all" | MemberStatus>((TABS.find((t) => t.key === initialStatus)?.key ?? "all") as "all" | MemberStatus);
  const [query, setQuery] = useState("");
  const [selId, setSelId] = useState<string | undefined>(initialId);
  const [reason, setReason] = useState("");
  const toast = useToast();

  const count = (k: "all" | MemberStatus) => (k === "all" ? members.length : members.filter((m) => m.status === k).length);
  const rows = members.filter((m) => (tab === "all" || m.status === tab) && (query.trim() === "" || m.name.includes(query.trim()) || m.phone.includes(query.trim())));
  const sel = members.find((m) => m.id === selId);

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title="회원 관리" desc={`전체 회원 ${members.length}명`} />

      <div className="flex items-center justify-between gap-4 px-8 pt-4">
        <div role="tablist" className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={cx("flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold transition-colors duration-150", tab === t.key ? "bg-(--tf-ink) text-white" : "text-(--tf-sub) hover:bg-(--tf-ink)/6")}
            >
              {t.label}
              <span className="tf-num text-[12px] opacity-80">{count(t.key)}</span>
            </button>
          ))}
        </div>
        <label className="relative w-[280px]">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--tf-sub)" aria-hidden />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="이름 또는 연락처 검색" aria-label="회원 검색" className={cx(inputSmCls, "pl-9")} />
        </label>
      </div>

      <div className={cx("grid min-h-0 flex-1 gap-6 px-8 py-4", sel ? "grid-cols-[1fr_340px]" : "grid-cols-1")}>
        <div className="overflow-x-auto rounded-lg border border-[#E3E7E3] bg-white">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thCls}>이름</th>
                <th className={thCls}>연락처</th>
                <th className={thCls}>회원권</th>
                <th className={thCls}>가입일</th>
                <th className={thCls}>상태</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => {
                    setSelId(m.id);
                    setReason("");
                  }}
                  className={cx("h-[56px] cursor-pointer border-b border-[#EDF0ED] transition-colors duration-150", sel?.id === m.id ? "bg-(--tf-ink)/6" : "hover:bg-[#FAFBFA]")}
                >
                  <td className={cx(tdCls, "font-bold")}>{m.name}</td>
                  <td className={cx(tdCls, "tf-num")}>{m.phone}</td>
                  <td className={tdCls}>
                    <span className="block leading-5">{m.membershipName}</span>
                    <span className="tf-num block text-[12px] leading-4 text-(--tf-sub)">{m.membershipNo}</span>
                  </td>
                  <td className={cx(tdCls, "tf-num")}>{m.joinedAt || "-"}</td>
                  <td className={tdCls}>
                    <Badge kind={`member:${m.status}`} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[13.5px] text-(--tf-sub)">
                    조건에 맞는 회원이 없습니다. 상태 필터나 검색어를 바꿔 보세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {sel && (
          <aside aria-label="회원 상세" className="self-start rounded-lg border border-[#E3E7E3] bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="tf-heading text-[20px] text-(--tf-ink)">{sel.name}</h2>
              <Badge kind={`member:${sel.status}`} />
            </div>
            <div className="mt-3">
              <Dl
                rows={[
                  ["연락처", <span key="p" className="tf-num">{sel.phone}</span>],
                  ["회원권", sel.membershipName],
                  ["회원권 번호", <span key="n" className="tf-num">{sel.membershipNo}</span>],
                  ["신청일", <span key="a" className="tf-num">{sel.appliedAt}</span>],
                  ["가입일", <span key="j" className="tf-num">{sel.joinedAt || "-"}</span>],
                ]}
              />
            </div>
            {sel.reason && (
              <p className="mt-3 rounded-lg bg-[#F3F5F3] px-3 py-2 text-[13px] leading-5 text-(--tf-text)">
                <span className="font-bold text-(--tf-sub)">{sel.status === "rejected" ? "반려 사유 " : "정지 사유 "}</span>
                {sel.reason}
              </p>
            )}

            {(sel.status === "approved" || sel.status === "suspended") && (
              <div className="mt-4 border-t border-[#E3E7E3] pt-4">
                <Field label={sel.status === "approved" ? "이용 정지 사유 (필수)" : "정지 해제 사유 (필수)"} small>
                  <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className={textareaCls} placeholder={sel.status === "approved" ? "예: 회원권 양도 사실 확인 필요" : "예: 소명 자료 확인 완료"} />
                </Field>
                <Button
                  size="sm"
                  variant={sel.status === "approved" ? "danger" : "primary"}
                  className="mt-3 w-full"
                  disabled={reason.trim().length < 2}
                  onClick={() => {
                    if (sel.status === "approved") {
                      suspend(sel.id, reason.trim());
                      toast.show(`${sel.name} 님의 이용을 정지했습니다`);
                    } else {
                      unsuspend(sel.id);
                      toast.show(`${sel.name} 님의 정지를 해제했습니다`);
                    }
                    setReason("");
                  }}
                >
                  {sel.status === "approved" ? "이용 정지" : "정지 해제"}
                </Button>
                {reason.trim().length < 2 && <p className="mt-2 text-[12px] text-(--tf-sub)">사유를 입력하면 버튼이 켜집니다</p>}
              </div>
            )}
            {sel.status === "pending" && <p className="mt-4 text-[12.5px] text-(--tf-sub)">승인 대기 회원은 가입 승인 화면에서 처리합니다.</p>}
            {sel.status === "rejected" && <p className="mt-4 text-[12.5px] text-(--tf-sub)">반려된 회원이 앱에서 재신청하면 가입 승인 목록에 다시 나타납니다.</p>}
          </aside>
        )}
      </div>
      {toast.node}
    </div>
  );
}

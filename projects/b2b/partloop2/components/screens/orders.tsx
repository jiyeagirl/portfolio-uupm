import { useMemo, useState } from "react";
import { CaretRight, MagnifyingGlass, Plus } from "@phosphor-icons/react";
import type { Order } from "../../lib/types";
import { supplierOf } from "../../lib/mock-data";
import { THIS_MONTH, dateWithDay, dayDiff, itemSummary, num, total } from "../../lib/format";
import { Button, PageHeader, StatusBadge, inputCls } from "../ui";

type Tab = "all" | "pending" | "waiting" | "done";

// 탭 이름은 KPI와 같은 "납품 대기"(수락 대기, 진행 중, 지연). 배지 "진행 중"과 겹치지 않게 함
const TABS: { key: Tab; label: string; match: (o: Order) => boolean }[] = [
  { key: "all", label: "전체", match: () => true },
  { key: "pending", label: "승인 대기", match: (o) => o.status === "pending-approval" },
  { key: "waiting", label: "납품 대기", match: (o) => ["awaiting-accept", "in-progress", "delayed"].includes(o.status) },
  { key: "done", label: "납품 완료", match: (o) => o.status === "delivered" },
];

function Due({ order }: { order: Order }) {
  const d = dayDiff(order.dueDate);
  return (
    <div>
      <div className="num">{dateWithDay(order.dueDate)}</div>
      {order.status === "delayed" ? (
        <div className="text-[12.5px] font-semibold text-(--pl2-danger)">{Math.abs(d)}일 지연</div>
      ) : order.status !== "delivered" ? (
        <div className="num text-[12.5px] text-(--pl2-ink-4)">{d === 0 ? "D-day" : `D-${d}`}</div>
      ) : null}
    </div>
  );
}

function Kpi({ label, value, note, danger, onClick }: { label: string; value: string; note?: string; danger?: boolean; onClick?: () => void }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag type={onClick ? "button" : undefined} onClick={onClick} className={`flex-1 px-6 py-4 text-left ${onClick ? "cursor-pointer transition-colors hover:bg-(--pl2-muted) first:rounded-l-lg last:rounded-r-lg" : ""}`}>
      <div className="text-[13px] font-medium text-(--pl2-ink-3)">{label}</div>
      <div className="mt-1 flex items-center justify-between"><span className={`num text-[28px] font-semibold leading-9 ${danger ? "text-(--pl2-danger)" : ""}`}>{value}</span>{onClick && <CaretRight size={16} weight="bold" aria-hidden className="text-(--pl2-ink-4)" />}</div>
      {note && <div className="text-[12.5px] text-(--pl2-ink-4)">{note}</div>}
    </Tag>
  );
}

export function OrdersScreen({ orders, highlightId, onCreate, onOpen }: { orders: Order[]; highlightId?: string; onCreate: () => void; onOpen: (id: string) => void }) {
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");

  const monthOrders = orders.filter((o) => o.requestedAt.startsWith(THIS_MONTH));
  const waiting = orders.filter(TABS[2].match);
  const delayed = orders.filter((o) => o.status === "delayed");
  const monthAmount = monthOrders.reduce((s, o) => s + total(o.items), 0);

  const rows = useMemo(() => {
    const t = TABS.find((x) => x.key === tab)!;
    const needle = q.trim().toLowerCase();
    const list = orders.filter((o) => t.match(o) && (!needle || o.id.toLowerCase().includes(needle) || supplierOf(o.supplierId).name.toLowerCase().includes(needle)));
    // 납품 대기 탭은 지연 건을 맨 위로 (가장 급한 건을 먼저 봄)
    return tab === "waiting" ? [...list].sort((a, b) => Number(b.status === "delayed") - Number(a.status === "delayed")) : list;
  }, [orders, tab, q]);

  return (
    <div>
      <PageHeader title="발주 현황" action={<Button icon={<Plus size={16} weight="bold" aria-hidden />} onClick={onCreate}>발주 작성</Button>} />

      <div className="flex divide-x divide-(--pl2-line) rounded-lg border border-(--pl2-line) bg-(--pl2-surface)">
        <Kpi label="이번 달 발주 건수 (건)" value={String(monthOrders.length)} note="요청일 기준" />
        <Kpi label="납품 대기 (건)" value={String(waiting.length)} note="수락 대기, 진행 중, 지연 포함" />
        <Kpi label="지연 (건)" value={String(delayed.length)} note="납기일이 지난 발주" danger onClick={() => setTab("waiting")} />
        <Kpi label="이번 달 발주 금액 (원, VAT 포함)" value={num(monthAmount)} note="요청일 기준" />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-(--pl2-line) bg-(--pl2-surface)">
        <div className="flex items-center justify-between gap-4 border-b border-(--pl2-line) px-5 pt-1">
          <div role="tablist" aria-label="상태 필터" className="flex gap-1">
            {TABS.map((t) => {
              const on = t.key === tab;
              return (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setTab(t.key)}
                  className={`-mb-px flex h-11 cursor-pointer items-center gap-1.5 border-b-2 px-3 text-[13.5px] font-semibold transition-colors duration-150 ${
                    on ? "border-(--pl2-accent) text-(--pl2-accent-hover)" : "border-transparent text-(--pl2-ink-4) hover:text-(--pl2-ink)"
                  }`}
                >
                  {t.label}
                  <span className={`num rounded px-1.5 text-[12px] ${on ? "bg-(--pl2-accent-soft)" : "bg-(--pl2-muted)"}`}>{orders.filter(t.match).length}</span>
                </button>
              );
            })}
          </div>
          <div className="relative w-72">
            <MagnifyingGlass size={16} aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-(--pl2-ink-4)" />
            <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="발주번호 또는 공급사 검색" placeholder="발주번호, 공급사 검색" className={`${inputCls} pl-9`} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-[13px] leading-[18px]">
            <thead className="bg-(--pl2-muted) text-[12.5px] font-semibold text-(--pl2-ink-3)">
              <tr>
                <th scope="col" className="h-10 w-[170px] px-5">발주번호 / 요청일</th>
                <th scope="col" className="h-10 px-3">공급사 / 품목 요약</th>
                <th scope="col" className="h-10 w-[230px] px-3">납품 장소</th>
                <th scope="col" className="h-10 w-[190px] px-3 text-right">금액 (원, VAT 포함)</th>
                <th scope="col" className="h-10 w-[160px] px-5">납기일</th>
                <th scope="col" className="h-10 w-[120px] px-3">상태</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => onOpen(o.id)}
                  className={`cursor-pointer border-t border-(--pl2-line) transition-colors duration-700 hover:bg-(--pl2-muted) ${highlightId === o.id ? "bg-(--pl2-accent-soft)" : ""}`}
                >
                  <td className="h-14 px-5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpen(o.id);
                      }}
                      className="num cursor-pointer font-semibold text-(--pl2-accent) underline-offset-2 hover:underline"
                    >
                      {o.id}
                    </button>
                    <div className="num text-[12.5px] text-(--pl2-ink-4)">{o.requestedAt.slice(0, 10).replaceAll("-", ".")}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-semibold">{supplierOf(o.supplierId).name}</div>
                    <div className="text-[12.5px] text-(--pl2-ink-4)">{itemSummary(o.items)}</div>
                  </td>
                  <td className="px-3 text-(--pl2-ink-3)">{o.location}</td>
                  <td className="num px-3 text-right font-semibold">{num(total(o.items))}</td>
                  <td className="px-5 py-2">
                    <Due order={o} />
                  </td>
                  <td className="px-3">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="flex flex-col items-center gap-3 border-t border-(--pl2-line) py-14 text-center">
              <p className="text-[14px] font-semibold">조건에 맞는 발주가 없습니다</p>
              <p className="text-[13px] text-(--pl2-ink-4)">검색어를 지우거나 다른 상태 탭을 선택해 보세요.</p>
              <Button
                variant="secondary"
                onClick={() => {
                  setQ("");
                  setTab("all");
                }}
              >
                필터 초기화
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

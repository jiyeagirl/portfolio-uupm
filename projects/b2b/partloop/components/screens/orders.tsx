import { useMemo, useState } from "react";
import { MagnifyingGlass, Plus, CaretRight, FunnelSimple, X } from "@phosphor-icons/react";
import type { Order, OrderStatus } from "../../lib/types";
import { supplierOf } from "../../lib/mock-data";
import { TODAY, dayDiff, itemSummary, num, shortDate, subtotal, vat } from "../../lib/format";
import { Button, StatusBadge, inputCls } from "../ui";

type TabKey = "all" | "pending" | "progress" | "done";
const TABS: { key: TabKey; label: string; match: OrderStatus[] }[] = [
  { key: "all", label: "전체", match: ["pending-approval", "awaiting-accept", "in-progress", "delayed", "delivered"] },
  { key: "pending", label: "승인 대기", match: ["pending-approval"] },
  { key: "progress", label: "진행 중", match: ["awaiting-accept", "in-progress", "delayed"] },
  { key: "done", label: "납품 완료", match: ["delivered"] },
];

const total = (o: Order) => {
  const s = subtotal(o.items);
  return s + vat(s);
};

export function OrdersScreen({ orders, onOpen, onCreate, highlightId }: { orders: Order[]; onOpen: (id: string) => void; onCreate: () => void; highlightId?: string }) {
  const [tab, setTab] = useState<TabKey>("all");
  const [q, setQ] = useState("");

  const month = TODAY.slice(0, 7);
  const kpi = useMemo(() => {
    const thisMonth = orders.filter((o) => o.requestedAt.startsWith(month));
    return {
      count: thisMonth.length,
      waiting: orders.filter((o) => ["awaiting-accept", "in-progress", "delayed"].includes(o.status)).length,
      delayed: orders.filter((o) => o.status === "delayed").length,
      amount: thisMonth.reduce((s, o) => s + total(o), 0),
    };
  }, [orders, month]);

  const rows = useMemo(() => {
    const t = TABS.find((x) => x.key === tab)!;
    const needle = q.trim().toLowerCase();
    return orders.filter(
      (o) => t.match.includes(o.status) && (!needle || o.id.toLowerCase().includes(needle) || supplierOf(o.supplierId).name.toLowerCase().includes(needle)),
    );
  }, [orders, tab, q]);

  const countOf = (k: TabKey) => orders.filter((o) => TABS.find((x) => x.key === k)!.match.includes(o.status)).length;

  return (
    <div className="mx-auto max-w-[1180px] px-8 pb-12 pt-8">
      <header className="mb-6 flex items-end justify-between gap-6">
        <div>
          <p className="mb-1 text-[13px] text-(--pl-ink-3)">2026년 9월 24일 목요일 기준</p>
          <h1 className="text-[24px] font-bold leading-8 tracking-[-0.02em] text-(--pl-ink)">발주 현황</h1>
        </div>
        <Button onClick={onCreate} icon={<Plus size={16} weight="bold" aria-hidden />}>
          발주 작성
        </Button>
      </header>

      {/* KPI: 카드 4장이 아니라 한 덩어리를 구분선으로 나눔 */}
      <section aria-label="이번 달 요약" className="mb-6 grid grid-cols-4 divide-x divide-(--pl-line) rounded-xl border border-(--pl-line) bg-(--pl-surface)">
        <Kpi label="이번 달 발주" value={kpi.count} unit="건" sub="요청일 기준, 승인 대기 포함" />
        <Kpi label="납품 대기" value={kpi.waiting} unit="건" sub="수락 대기, 진행 중, 지연 포함" />
        <Kpi label="지연" value={kpi.delayed} unit="건" tone={kpi.delayed ? "danger" : undefined} sub="납기일이 지났으나 납품 전인 건" />
        <Kpi label="이번 달 발주 금액" value={kpi.amount} unit="원" sub="요청일 기준, 부가세 포함" />
      </section>

      <section className="rounded-xl border border-(--pl-line) bg-(--pl-surface)">
        <div className="flex items-center justify-between gap-4 border-b border-(--pl-line) px-4 py-3">
          <div role="tablist" aria-label="상태 필터" className="flex gap-1">
            {TABS.map((t) => {
              const on = tab === t.key;
              return (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={on}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-3 text-[13.5px] transition-colors duration-150 ${
                    on ? "bg-(--pl-ink) font-semibold text-white" : "text-(--pl-ink-3) hover:bg-(--pl-muted) hover:text-(--pl-ink)"
                  }`}
                >
                  {t.label}
                  <span className={`num text-[12px] ${on ? "text-white/70" : "text-(--pl-ink-4)"}`}>{countOf(t.key)}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-[280px]">
              <MagnifyingGlass size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--pl-ink-4)" aria-hidden />
              <input
                aria-label="발주번호 또는 공급사 검색"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="발주번호, 공급사 검색"
                className={`${inputCls} pl-9 pr-8`}
              />
              {q && (
                <button type="button" aria-label="검색어 지우기" onClick={() => setQ("")} className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 cursor-pointer place-items-center rounded text-(--pl-ink-4) hover:bg-(--pl-muted)">
                  <X size={14} aria-hidden />
                </button>
              )}
            </div>
            <Button variant="secondary" icon={<FunnelSimple size={16} aria-hidden />}>
              기간
            </Button>
          </div>
        </div>

        <table className="w-full table-fixed border-collapse text-[13.5px]">
          <colgroup>
            <col className="w-[156px]" />
            <col />
            <col className="w-[170px]" />
            <col className="w-[150px]" />
            <col className="w-[128px]" />
            <col className="w-[40px]" />
          </colgroup>
          <thead>
            <tr className="h-10 border-b border-(--pl-line) bg-(--pl-canvas) text-left text-[12.5px] font-medium text-(--pl-ink-3)">
              <th className="pl-5 font-medium">발주번호</th>
              <th className="font-medium">공급사 / 품목</th>
              <th className="pr-6 text-right font-medium">금액 (원, VAT 포함)</th>
              <th className="font-medium">납기일</th>
              <th className="font-medium">상태</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => {
              const d = dayDiff(o.dueDate);
              const late = o.status === "delayed";
              return (
                <tr
                  key={o.id}
                  tabIndex={0}
                  onClick={() => onOpen(o.id)}
                  onKeyDown={(e) => e.key === "Enter" && onOpen(o.id)}
                  className={`group h-[56px] cursor-pointer border-b border-(--pl-line) transition-colors duration-150 last:border-b-0 hover:bg-(--pl-canvas) focus-visible:bg-(--pl-canvas) ${
                    o.id === highlightId ? "bg-(--pl-accent-soft)/60" : ""
                  }`}
                >
                  <td className="pl-5 font-mono text-[13px] font-medium text-(--pl-accent) group-hover:underline group-hover:underline-offset-2">{o.id}</td>
                  <td className="truncate py-2.5 pr-4">
                    <p className="font-semibold leading-5 text-(--pl-ink)">{supplierOf(o.supplierId).name}</p>
                    <p className="truncate text-[12.5px] leading-[18px] text-(--pl-ink-3)">{itemSummary(o.items)}</p>
                  </td>
                  <td className="num pr-6 text-right font-semibold text-(--pl-ink)">{num(total(o))}</td>
                  <td>
                    <span className="text-(--pl-ink)">{shortDate(o.dueDate)}</span>
                    {o.status !== "delivered" && (
                      <span className={`ml-1.5 text-[12.5px] ${late ? "font-semibold text-(--pl-danger)" : d <= 3 ? "text-[#92400E]" : "text-(--pl-ink-4)"}`}>
                        {d < 0 ? `${-d}일 지남` : d === 0 ? "오늘" : `D-${d}`}
                      </span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="pr-3 text-(--pl-ink-4)">
                    <CaretRight size={16} className="opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <p className="font-medium text-(--pl-ink)">조건에 맞는 발주가 없음</p>
                  <p className="mt-1 text-[13px] text-(--pl-ink-3)">검색어를 바꾸거나 전체 탭에서 확인</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <footer className="flex h-11 items-center justify-between border-t border-(--pl-line) px-5 text-[12.5px] text-(--pl-ink-3)">
          <span>
            <span className="num">{rows.length}</span>건 표시
          </span>
          <span>{tab === "progress" ? "진행 중 탭은 수락 대기, 진행 중, 지연을 함께 보여줌 | 최근 요청 순" : "최근 요청 순"}</span>
        </footer>
      </section>
    </div>
  );
}

function Kpi({ label, value, unit, prefix, sub, tone }: { label: string; value: number; unit?: string; prefix?: string; sub: string; tone?: "danger" }) {
  return (
    <div className="px-5 py-4">
      <p className="text-[13px] font-medium text-(--pl-ink-3)">{label}</p>
      <p className={`num mt-1.5 text-[28px] font-bold leading-9 tracking-[-0.03em] ${tone === "danger" ? "text-(--pl-danger)" : "text-(--pl-ink)"}`}>
        {prefix && <span className="mr-0.5 text-[20px] font-semibold">{prefix}</span>}
        {num(value)}
        {unit && <span className="ml-1 font-sans text-[16px] font-semibold text-(--pl-ink-3)">{unit}</span>}
      </p>
      <p className="mt-1 truncate text-[12.5px] text-(--pl-ink-3)">{sub}</p>
    </div>
  );
}

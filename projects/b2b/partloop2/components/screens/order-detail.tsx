import { ArrowLeft, Check, Phone, WarningCircle } from "@phosphor-icons/react";
import type { Order, TimelineKey } from "../../lib/types";
import { supplierOf } from "../../lib/mock-data";
import { dateWithDay, dayDiff, num, stamp, subtotal, vat } from "../../lib/format";
import { Button, Panel, StatusBadge } from "../ui";

const STEPS: { key: TimelineKey; label: string }[] = [
  { key: "requested", label: "발주 요청" },
  { key: "accepted", label: "공급사 수락" },
  { key: "shipped", label: "출고" },
  { key: "delivered", label: "납품 완료" },
];

function Timeline({ order }: { order: Order }) {
  // 발주 요청 단계는 승인까지 끝나야 완료로 봄 (승인 대기 건의 현재 위치는 우리 쪽 승인)
  const done = STEPS.map((s) => (s.key === "requested" ? !!order.timeline.approved : !!order.timeline[s.key]));
  const current = done.indexOf(false);
  const overdue = order.status === "delayed" ? Math.abs(dayDiff(order.dueDate)) : 0;
  const waitingLabel = ["승인 대기", "수락 대기", "출고 대기", "납품 대기"];
  return (
    <ol className="p-5">
      {STEPS.map((s, i) => {
        const at = done[i] ? order.timeline[s.key] : undefined;
        const isCurrent = i === current;
        const late = isCurrent && overdue > 0 && s.key === "delivered";
        return (
          <li key={s.key} className="relative flex gap-3 pb-5 last:pb-0">
            {i < STEPS.length - 1 && <span aria-hidden className={`absolute left-[11px] top-6 h-[calc(100%-24px)] w-px ${done[i + 1] ? "bg-(--pl2-accent)" : "bg-(--pl2-line-strong)"}`} />}
            <span
              aria-hidden
              className={`z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                at ? "border-(--pl2-accent) bg-(--pl2-accent) text-white" : isCurrent ? "border-(--pl2-accent) bg-(--pl2-surface)" : "border-(--pl2-line-strong) bg-(--pl2-surface)"
              }`}
            >
              {at ? <Check size={12} weight="bold" /> : isCurrent ? <span className="h-2 w-2 rounded-full bg-(--pl2-accent)" /> : null}
            </span>
            <div className="min-w-0">
              <div className={`text-[13.5px] font-semibold ${at || isCurrent ? "" : "text-(--pl2-ink-4)"}`}>{s.label}</div>
              {at && <div className="num text-[12.5px] text-(--pl2-ink-4)">{stamp(at)}</div>}
              {s.key === "requested" && order.timeline.approved && <div className="num text-[12.5px] text-(--pl2-ink-4)">승인 {stamp(order.timeline.approved)}</div>}
              {s.key === "requested" && isCurrent && <div className="num text-[12.5px] text-(--pl2-ink-4)">요청 {stamp(order.timeline.requested!)}</div>}
              {isCurrent && (
                <div className={`text-[12.5px] font-semibold ${late ? "text-(--pl2-danger)" : "text-(--pl2-accent-hover)"}`}>{late ? `${overdue}일 지연` : waitingLabel[i]}</div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderDetailScreen({ order, onBack, onAdvance, onContact }: { order: Order; onBack: () => void; onAdvance: (id: string) => void; onContact: (id: string) => void }) {
  const supplier = supplierOf(order.supplierId);
  const sub = subtotal(order.items);
  const tax = vat(sub);
  const d = dayDiff(order.dueDate);

  const action =
    order.status === "pending-approval" ? (
      <Button className="h-10" onClick={() => onAdvance(order.id)}>발주 승인</Button>
    ) : order.status === "in-progress" || order.status === "delayed" ? (
      <Button className="h-10" onClick={() => onAdvance(order.id)}>납품 확인</Button>
    ) : order.status === "awaiting-accept" ? (
      <div className="flex items-center gap-3">
        <span className="text-[13px] text-(--pl2-ink-2)">공급사 수락 후 납품 확인이 가능합니다</span>
        <Button variant="secondary" className="h-10" icon={<Phone size={16} aria-hidden />} onClick={() => onContact(order.id)}>공급사 연락</Button>
      </div>
    ) : null;

  return (
    <div>
      <button type="button" onClick={onBack} className="mb-3 -ml-1 inline-flex h-8 cursor-pointer items-center gap-1 rounded-md px-1 text-[13px] font-medium text-(--pl2-ink-3) transition-colors hover:text-(--pl2-ink)">
        <ArrowLeft size={14} weight="bold" aria-hidden />
        발주 현황
      </button>

      <div className="mb-5 flex min-h-10 items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <h1 className="num text-[24px] font-bold leading-8">{order.id}</h1>
          <StatusBadge status={order.status} size="md" />
        </div>
        {action}
      </div>

      {order.status === "delayed" && (
        <div role="alert" className="mb-5 flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-[13.5px] text-[#991B1B]">
          <WarningCircle size={20} weight="fill" aria-hidden className="mt-px shrink-0" />
          <p>
            <span className="font-semibold">납기일이 {Math.abs(d)}일 지났습니다.</span> {supplier.name} {supplier.contact}({supplier.phone})에게 납품 일정을 확인하세요.
          </p>
        </div>
      )}

      <dl className="mb-6 grid grid-cols-4 divide-x divide-(--pl2-line) rounded-lg border border-(--pl2-line) bg-(--pl2-surface)">
        {[
          ["납기일", dateWithDay(order.dueDate)],
          ["납품 장소", order.location],
          ["요청일", dateWithDay(order.requestedAt.slice(0, 10))],
          ["메모", order.memo || "없음"],
        ].map(([k, v]) => (
          <div key={k} className="px-5 py-3.5">
            <dt className="text-[12.5px] text-(--pl2-ink-4)">{k}</dt>
            <dd className={`mt-0.5 text-[13.5px] ${v === "없음" ? "text-(--pl2-ink-4)" : "font-semibold"} ${k === "납기일" || k === "요청일" ? "num" : ""}`}>{v}</dd>
          </div>
        ))}
      </dl>

      <div className="grid grid-cols-[1fr_340px] items-start gap-6">
        <div className="flex flex-col gap-6">
          <Panel title="품목">
          <table className="w-full text-left text-[13px] leading-[18px]">
            <thead className="bg-(--pl2-muted) text-[12.5px] font-semibold text-(--pl2-ink-3)">
              <tr>
                <th scope="col" className="h-10 pl-5">품목명 / 규격</th>
                <th scope="col" className="h-10 w-24 px-3 text-right">수량 (EA)</th>
                <th scope="col" className="h-10 w-32 px-3 text-right">단가 (원)</th>
                <th scope="col" className="h-10 w-36 pl-3 pr-5 text-right">금액 (원)</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((i) => (
                <tr key={i.id} className="border-t border-(--pl2-line)">
                  <td className="h-14 py-2 pl-5">
                    <div className="font-semibold">{i.name}</div>
                    <div className="text-[12.5px] text-(--pl2-ink-4)">{i.spec}</div>
                  </td>
                  <td className="num px-3 text-right">{num(i.qty)}</td>
                  <td className="num px-3 text-right">{num(i.unitPrice)}</td>
                  <td className="num pl-3 pr-5 text-right font-semibold">{num(i.qty * i.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-(--pl2-line)">
          <dl className="ml-auto flex w-80 flex-col gap-2 px-5 py-4 text-[13.5px]">
            <div className="flex justify-between"><dt className="text-(--pl2-ink-3)">공급가액 (원)</dt><dd className="num font-semibold">{num(sub)}</dd></div>
            <div className="flex justify-between"><dt className="text-(--pl2-ink-3)">부가세 (원, 10%)</dt><dd className="num font-semibold">{num(tax)}</dd></div>
            <div className="flex items-baseline justify-between border-t border-(--pl2-line) pt-3"><dt className="font-semibold">총액 (원)</dt><dd className="num text-[20px] font-semibold">{num(sub + tax)}</dd></div>
          </dl>
          </div>
        </Panel>

          <Panel title="공급사">
            <dl className="grid grid-cols-[1fr_1fr_1fr_1.5fr] gap-x-6 px-5 py-4 text-[13.5px]">
              <div><dt className="text-[12.5px] text-(--pl2-ink-4)">공급사</dt><dd className="font-semibold">{supplier.name}</dd><dd className="text-[12.5px] text-(--pl2-ink-4)">{supplier.category}</dd></div>
              <div><dt className="text-[12.5px] text-(--pl2-ink-4)">담당자</dt><dd className="font-semibold">{supplier.contact}</dd></div>
              <div><dt className="text-[12.5px] text-(--pl2-ink-4)">연락처</dt><dd className="num font-semibold">{supplier.phone}</dd></div>
              <div><dt className="text-[12.5px] text-(--pl2-ink-4)">주소</dt><dd>{supplier.address}</dd></div>
            </dl>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="진행 타임라인">
            <Timeline order={order} />
          </Panel>
        </div>
      </div>
    </div>
  );
}

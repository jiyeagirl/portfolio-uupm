import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, CheckCircle, Phone, MapPin, WarningCircle, UserCircle, Info } from "@phosphor-icons/react";
import type { Order, TimelineKey } from "../../lib/types";
import { supplierOf } from "../../lib/mock-data";
import { dateWithDay, dayDiff, num, subtotal, vat, won } from "../../lib/format";
import { Button, Panel, STATUS, StatusBadge } from "../ui";

// done: 완료 후 설명, todo: 아직 오지 않은 단계의 설명 (완료형 금지)
const STEPS: { key: TimelineKey; label: string; done: string; todo: string }[] = [
  { key: "requested", label: "발주 요청", done: "구매 담당자가 발주서를 등록함", todo: "발주서 등록 전" },
  { key: "approved", label: "발주 승인", done: "구매팀장 승인 후 공급사에 전달됨", todo: "구매팀장 승인 전" },
  { key: "accepted", label: "공급사 수락", done: "공급사가 수량과 납기를 확인함", todo: "공급사 확인 전" },
  { key: "shipped", label: "출고", done: "공급사 창고에서 출고됨", todo: "출고 전" },
  { key: "delivered", label: "납품 완료", done: "입고 검수 후 납품 확인함", todo: "입고 검수 전" },
];

export function OrderDetailScreen({ order, onBack, onAdvance }: { order: Order; onBack: () => void; onAdvance: (id: string) => void }) {
  const sup = supplierOf(order.supplierId);
  const supply = subtotal(order.items);
  const tax = vat(supply);
  const late = order.status === "delayed";
  const overdue = -dayDiff(order.dueDate);
  const currentIdx = STEPS.findIndex((s) => !order.timeline[s.key]);

  // 지연 건이 아직 출고 전이면 납품 확인을 막음 (받지 않은 물건을 완료 처리하는 실수 방지)
  const shipped = !!order.timeline.shipped;
  const action =
    order.status === "pending-approval"
      ? { label: "발주 승인", Icon: Check, disabled: false }
      : order.status === "in-progress" || late
        ? { label: "납품 확인", Icon: CheckCircle, disabled: !shipped }
        : null;

  return (
    <div className="mx-auto max-w-[1180px] px-8 pb-12 pt-8">
      <button type="button" onClick={onBack} className="mb-3 inline-flex cursor-pointer items-center gap-1 text-[13px] text-(--pl-ink-3) hover:text-(--pl-ink)">
        <ArrowLeft size={14} aria-hidden /> 발주 현황
      </button>

      <header className="mb-6 flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-[24px] font-semibold leading-9 tracking-[-0.01em] text-(--pl-ink)">{order.id}</h1>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={order.status} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                <StatusBadge status={order.status} size="md" />
              </motion.span>
            </AnimatePresence>
          </div>
          <p className="mt-1 text-[13.5px] text-(--pl-ink-3)">
            {sup.name}에 {order.requestedAt.replace(/-/g, ".")} 요청 | 담당 정다은
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
            {late && (
              <a
                href={`tel:${sup.phone}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-(--pl-line-strong) bg-(--pl-surface) px-3.5 text-[13.5px] font-semibold text-(--pl-ink) transition-colors hover:bg-(--pl-muted)"
              >
                <Phone size={16} aria-hidden /> 공급사 연락
              </a>
            )}
            {action ? (
              <Button onClick={() => onAdvance(order.id)} disabled={action.disabled} icon={<action.Icon size={16} weight="bold" aria-hidden />} className="min-w-[112px]">
                {action.label}
              </Button>
            ) : order.status === "awaiting-accept" ? (
              <span className="text-[13px] text-(--pl-ink-3)">공급사 수락을 기다리는 중</span>
            ) : null}
          </div>
          {action?.disabled && (
            <p className="flex items-center gap-1 text-[12.5px] text-(--pl-ink-3)">
              <Info size={13} aria-hidden /> 출고된 뒤에 납품 확인 가능
            </p>
          )}
        </div>
      </header>

      {late && (
        <div role="alert" className="mb-5 flex items-center gap-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13.5px] text-[#991B1B]">
          <WarningCircle size={20} weight="fill" aria-hidden />
          <p>
            <b className="font-semibold">납기일이 {overdue}일 지났음.</b> 공급사가 아직 출고하지 않음. {sup.contact}에게 출고 일정을 확인 필요.
          </p>
          <a href={`tel:${sup.phone}`} className="ml-auto inline-flex shrink-0 items-center gap-1 font-semibold underline-offset-2 hover:underline">
            <Phone size={14} aria-hidden /> {sup.phone}
          </a>
        </div>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-6">
        <div className="flex flex-col gap-5">
          <dl className="grid grid-cols-3 divide-x divide-(--pl-line) rounded-xl border border-(--pl-line) bg-(--pl-surface)">
            <Meta k="납기일" v={dateWithDay(order.dueDate)} tone={late ? "danger" : undefined} />
            <Meta k="납품 장소" v={order.location} />
            <Meta k="메모" v={order.memo || "없음"} muted={!order.memo} />
          </dl>

          <Panel title={`품목 ${order.items.length}건`} bodyClass="">
            <table className="w-full border-collapse text-[13.5px]">
              <thead>
                <tr className="h-9 border-b border-(--pl-line) bg-(--pl-canvas) text-left text-[12.5px] text-(--pl-ink-3)">
                  <th className="w-10 text-center font-medium">#</th>
                  <th className="font-medium">품목명</th>
                  <th className="font-medium">규격</th>
                  <th className="pr-5 text-right font-medium">수량</th>
                  <th className="pr-5 text-right font-medium">단가 (원)</th>
                  <th className="pr-5 text-right font-medium">금액 (원)</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it, i) => (
                  <tr key={it.id} className="h-12 border-b border-(--pl-line)">
                    <td className="num text-center text-[12.5px] text-(--pl-ink-4)">{i + 1}</td>
                    <td className="font-medium text-(--pl-ink)">{it.name}</td>
                    <td className="text-(--pl-ink-2)">{it.spec}</td>
                    <td className="num pr-5 text-right">{num(it.qty)}</td>
                    <td className="num pr-5 text-right text-(--pl-ink-2)">{num(it.unitPrice)}</td>
                    <td className="num pr-5 text-right font-semibold">{num(it.qty * it.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="ml-auto flex w-[320px] flex-col gap-2 px-5 py-4 text-[13.5px]">
              <div className="flex justify-between">
                <dt className="text-(--pl-ink-3)">공급가액</dt>
                <dd className="num">{won(supply)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-(--pl-ink-3)">부가세 (10%)</dt>
                <dd className="num">{won(tax)}</dd>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-(--pl-line) pt-3">
                <dt className="text-[14px] font-bold">총액</dt>
                <dd className="num text-[22px] font-bold tracking-[-0.03em]">{won(supply + tax)}</dd>
              </div>
            </dl>
          </Panel>
        </div>

        <div className="flex flex-col gap-5">
          <Panel title="진행 상황">
            <ol className="relative">
              {STEPS.map((s, i) => {
                const at = order.timeline[s.key];
                const isCurrent = i === currentIdx;
                const color = isCurrent ? STATUS[order.status].fg : undefined;
                return (
                  <li key={s.key} className="relative flex gap-3 pb-5 last:pb-0">
                    {i < STEPS.length - 1 && <span className={`absolute left-[11px] top-6 h-[calc(100%-16px)] w-0.5 ${at && order.timeline[STEPS[i + 1].key] ? "bg-(--pl-accent)" : "bg-(--pl-line)"}`} aria-hidden />}
                    <span
                      className={`relative z-10 grid size-6 shrink-0 place-items-center rounded-full transition-colors duration-200 ${
                        at ? "bg-(--pl-accent) text-white" : isCurrent ? "border-2 bg-(--pl-surface)" : "border-2 border-(--pl-line) bg-(--pl-surface)"
                      }`}
                      style={isCurrent && !at ? { borderColor: color } : undefined}
                    >
                      {at ? <Check size={13} weight="bold" aria-hidden /> : isCurrent ? <span className="size-2 rounded-full" style={{ background: color }} /> : null}
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <p className={`text-[13.5px] font-semibold ${at || isCurrent ? "text-(--pl-ink)" : "text-(--pl-ink-4)"}`}>
                        {s.label}
                        {isCurrent && (
                          <span className="ml-1.5 text-[12px] font-medium" style={{ color }}>
                            {late ? "지연" : "진행 대기"}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-[12.5px] text-(--pl-ink-3)">
                        {at ? (
                          <span className="num">{at.replace(/-/g, ".")}</span>
                        ) : isCurrent && late ? (
                          `납기 ${order.dueDate.slice(5).replace("-", ".")} 경과, ${s.todo}`
                        ) : (
                          s.todo
                        )}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Panel>

          <Panel title="공급사">
            <p className="text-[15px] font-semibold text-(--pl-ink)">{sup.name}</p>
            <p className="mt-0.5 text-[12.5px] text-(--pl-ink-3)">{sup.category}</p>
            <ul className="mt-4 flex flex-col gap-2.5 text-[13.5px] text-(--pl-ink-2)">
              <li className="flex items-center gap-2">
                <UserCircle size={16} className="text-(--pl-ink-4)" aria-hidden /> {sup.contact}
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-(--pl-ink-4)" aria-hidden /> <span className="num">{sup.phone}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-(--pl-ink-4)" aria-hidden /> {sup.address}
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Meta({ k, v, tone, muted }: { k: string; v: string; tone?: "danger"; muted?: boolean }) {
  return (
    <div className="min-w-0 px-5 py-3.5">
      <dt className="text-[12.5px] text-(--pl-ink-3)">{k}</dt>
      <dd className={`mt-1 truncate text-[14px] font-medium ${tone === "danger" ? "text-(--pl-danger)" : muted ? "text-(--pl-ink-4)" : "text-(--pl-ink)"}`} title={v}>
        {v}
      </dd>
    </div>
  );
}

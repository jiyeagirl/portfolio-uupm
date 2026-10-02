import { useState } from "react";
import { useRef } from "react";
import { ArrowLeft, Plus, Trash, Info, CalendarBlank, CaretDown } from "@phosphor-icons/react";
import type { LineItem } from "../../lib/types";
import { LOCATIONS, SUPPLIERS, supplierOf } from "../../lib/mock-data";
import { dateWithDay, dayDiff, num, subtotal, vat, won } from "../../lib/format";
import { Button, Field, Panel, inputCls } from "../ui";

export type Draft = { supplierId: string; dueDate: string; location: string; memo: string; items: LineItem[] };

let seq = 100;
const newRow = (): LineItem => ({ id: String(++seq), name: "", spec: "", qty: 0, unitPrice: 0 });

export function NewOrderScreen({ onSubmit, onCancel }: { onSubmit: (d: Draft) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<Draft>({
    supplierId: "c",
    dueDate: "2026-10-07",
    location: LOCATIONS[2],
    memo: "",
    items: [
      { id: "a", name: "깊은 홈 볼 베어링", spec: "6203ZZ", qty: 400, unitPrice: 1980 },
      { id: "b", name: "리니어 부시", spec: "LM16UU", qty: 120, unitPrice: 5400 },
      newRow(),
    ],
  });

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const setItem = (id: string, patch: Partial<LineItem>) => set("items", draft.items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const valid = draft.items.filter((i) => i.name.trim() && i.qty > 0);
  const supply = subtotal(valid);
  const tax = vat(supply);
  const missing = !draft.supplierId ? "공급사를 선택해야 함" : !draft.dueDate ? "납기일을 입력해야 함" : valid.length === 0 ? "품목을 1개 이상 입력해야 함" : "";
  const sup = draft.supplierId ? supplierOf(draft.supplierId) : undefined;

  return (
    <div className="mx-auto max-w-[1180px] px-8 pb-12 pt-8">
      <button type="button" onClick={onCancel} className="mb-3 inline-flex cursor-pointer items-center gap-1 text-[13px] text-(--pl-ink-3) hover:text-(--pl-ink)">
        <ArrowLeft size={14} aria-hidden /> 발주 현황
      </button>
      <h1 className="mb-6 text-[24px] font-bold leading-8 tracking-[-0.02em] text-(--pl-ink)">발주 작성</h1>

      <div className="grid grid-cols-[minmax(0,1fr)_336px] items-start gap-6">
        <div className="flex flex-col gap-5">
          <Panel title="기본 정보">
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              <Field label="공급사" required htmlFor="sup" hint={sup ? `${sup.category} | 담당 ${sup.contact}` : undefined}>
                <SelectWrap>
                <select id="sup" className={`${inputCls} cursor-pointer appearance-none pr-9`} value={draft.supplierId} onChange={(e) => set("supplierId", e.target.value)}>
                  <option value="">공급사 선택</option>
                  {SUPPLIERS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                </SelectWrap>
              </Field>
              <Field label="납기일" required htmlFor="due" hint={sup ? `${sup.name} 표준 리드타임 ${sup.leadDays}일 | 납기까지 D-${dayDiff(draft.dueDate)}` : undefined}>
                <DateField id="due" value={draft.dueDate} onChange={(v) => set("dueDate", v)} />
              </Field>
              <Field label="납품 장소" required htmlFor="loc">
                <SelectWrap>
                <select id="loc" className={`${inputCls} cursor-pointer appearance-none pr-9`} value={draft.location} onChange={(e) => set("location", e.target.value)}>
                  {LOCATIONS.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
                </SelectWrap>
              </Field>
              <Field label="메모" htmlFor="memo">
                <input id="memo" className={inputCls} placeholder="포장, 성적서 등 공급사 전달 사항" value={draft.memo} onChange={(e) => set("memo", e.target.value)} />
              </Field>
            </div>
          </Panel>

          <Panel
            title="품목"
            bodyClass=""
            action={<span className="text-[12.5px] text-(--pl-ink-3)">행 금액은 수량 x 단가로 자동 계산</span>}
          >
            <table className="w-full table-fixed border-collapse text-[13.5px]">
              <colgroup>
                <col className="w-[40px]" />
                <col />
                <col className="w-[140px]" />
                <col className="w-[104px]" />
                <col className="w-[120px]" />
                <col className="w-[132px]" />
                <col className="w-[48px]" />
              </colgroup>
              <thead>
                <tr className="h-9 border-b border-(--pl-line) bg-(--pl-canvas) text-left text-[12.5px] text-(--pl-ink-3)">
                  <th className="text-center font-medium">#</th>
                  <th className="px-1.5 font-medium">품목명<span className="ml-0.5 text-(--pl-danger)" aria-hidden>*</span></th>
                  <th className="px-1.5 font-medium">규격</th>
                  <th className="px-1.5 text-right font-medium">수량<span className="ml-0.5 text-(--pl-danger)" aria-hidden>*</span></th>
                  <th className="px-1.5 text-right font-medium">단가 (원)</th>
                  <th className="pr-4 text-right font-medium">금액 (원)</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {draft.items.map((it, idx) => (
                  <tr key={it.id} className="h-[52px] border-b border-(--pl-line)">
                    <td className="num text-center text-[12.5px] text-(--pl-ink-4)">{idx + 1}</td>
                    <td className="px-1.5">
                      <input aria-label={`${idx + 1}행 품목명`} className={inputCls} placeholder="예: 육각 볼트" value={it.name} onChange={(e) => setItem(it.id, { name: e.target.value })} />
                    </td>
                    <td className="px-1.5">
                      <input aria-label={`${idx + 1}행 규격`} className={inputCls} placeholder="예: M8x30" value={it.spec} onChange={(e) => setItem(it.id, { spec: e.target.value })} />
                    </td>
                    <td className="px-1.5">
                      <input
                        aria-label={`${idx + 1}행 수량`}
                        inputMode="numeric"
                        className={`${inputCls} num text-right`}
                        placeholder="0"
                        value={it.qty ? num(it.qty) : ""}
                        onChange={(e) => setItem(it.id, { qty: Number(e.target.value.replace(/\D/g, "")) })}
                      />
                    </td>
                    <td className="px-1.5">
                      <input
                        aria-label={`${idx + 1}행 단가`}
                        inputMode="numeric"
                        className={`${inputCls} num text-right`}
                        placeholder="0"
                        value={it.unitPrice ? num(it.unitPrice) : ""}
                        onChange={(e) => setItem(it.id, { unitPrice: Number(e.target.value.replace(/\D/g, "")) })}
                      />
                    </td>
                    <td className={`num pr-4 text-right font-semibold ${it.qty * it.unitPrice ? "text-(--pl-ink)" : "text-(--pl-ink-4)"}`}>{num(it.qty * it.unitPrice)}</td>
                    <td className="text-center">
                      <button
                        type="button"
                        aria-label={`${idx + 1}행 삭제`}
                        disabled={draft.items.length === 1}
                        onClick={() => set("items", draft.items.filter((x) => x.id !== it.id))}
                        className="grid size-8 cursor-pointer place-items-center rounded-md text-(--pl-ink-4) transition-colors hover:bg-[#FEE2E2] hover:text-(--pl-danger) disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                      >
                        <Trash size={16} aria-hidden />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between py-3 pl-[38px] pr-5">
              <Button variant="ghost" className="px-2" onClick={() => set("items", [...draft.items, newRow()])} icon={<Plus size={15} weight="bold" aria-hidden />}>
                품목 행 추가
              </Button>
              <span className="text-[12.5px] text-(--pl-ink-3)">품목명이나 수량이 빈 행은 요청할 때 제외됨</span>
            </div>
          </Panel>
        </div>

        <aside className="sticky top-6">
          <Panel title="발주 요약" bodyClass="">
            <dl className="flex flex-col gap-3 px-5 py-4 text-[13.5px]">
              <Row k="공급사" v={sup?.name ?? "선택 안 함"} />
              <Row k="품목 수" v={`${valid.length}건`} />
              <Row k="납품 장소" v={draft.location} />
            </dl>
            <dl className="flex flex-col gap-2.5 border-t border-dashed border-(--pl-line) px-5 py-4 text-[13.5px]">
              <Row k="공급가액" v={won(supply)} numeric />
              <Row k="부가세 (10%)" v={won(tax)} numeric />
            </dl>
            <div className="border-t border-(--pl-line) px-5 pb-5 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-(--pl-ink)">총액</span>
                <span className="num text-[26px] font-bold tracking-[-0.03em] text-(--pl-ink)">{won(supply + tax)}</span>
              </div>
              <Button className="mt-4 h-11 w-full text-[14.5px]" disabled={!!missing} onClick={() => onSubmit({ ...draft, items: valid })}>
                발주 요청
              </Button>
              <p className={`mt-2.5 flex items-start gap-1.5 text-[12.5px] ${missing ? "text-(--pl-danger)" : "text-(--pl-ink-3)"}`} role="status">
                <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
                {missing || "승인 대기로 등록되고, 구매팀장 승인 후 공급사에 전달됨"}
              </p>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v, numeric }: { k: string; v: string; numeric?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-(--pl-ink-3)">{k}</dt>
      <dd className={`truncate text-right font-medium text-(--pl-ink) ${numeric ? "num" : ""}`}>{v}</dd>
    </div>
  );
}

// 브라우저 기본 날짜 표시(언어 설정마다 형식이 다름) 대신 워크스페이스 표기로 보여주고, 누르면 기본 달력을 엶
function DateField({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => ref.current?.showPicker?.()}
        className={`${inputCls} flex cursor-pointer items-center justify-between text-left`}
        aria-label={`납기일 ${dateWithDay(value)}, 변경하려면 누름`}
      >
        <span className="num">{dateWithDay(value)}</span>
        <CalendarBlank size={17} className="text-(--pl-ink-3)" aria-hidden />
      </button>
      <input
        ref={ref}
        id={id}
        type="date"
        tabIndex={-1}
        value={value}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className="pointer-events-none absolute inset-0 opacity-0"
      />
    </div>
  );
}

function SelectWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <CaretDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--pl-ink-3)" aria-hidden />
    </div>
  );
}

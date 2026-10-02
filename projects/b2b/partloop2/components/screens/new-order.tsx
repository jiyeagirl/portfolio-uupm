import { useRef, useState } from "react";
import { CalendarBlank, CaretDown, Plus, Trash } from "@phosphor-icons/react";
import type { LineItem } from "../../lib/types";
import { LOCATIONS, SUPPLIERS, supplierOf } from "../../lib/mock-data";
import { TODAY, dateWithDay, num, subtotal, vat } from "../../lib/format";
import { Button, Field, PageHeader, Panel, inputCls } from "../ui";

export type Draft = { supplierId: string; dueDate: string; location: string; memo: string; items: LineItem[] };

export const EMPTY_DRAFT: Draft = { supplierId: "", dueDate: "", location: LOCATIONS[0], memo: "", items: [{ id: "n1", name: "", spec: "", qty: 0, unitPrice: 0 }] };

// 시각 검증용 입력 완료 상태 (?draft=filled)
export const FILLED_DRAFT: Draft = {
  supplierId: "c",
  dueDate: "2026-10-16",
  location: LOCATIONS[0],
  memo: "KC 인증 시험성적서 동봉 요청",
  items: [
    { id: "n1", name: "볼 베어링", spec: "6204ZZ", qty: 400, unitPrice: 2350 },
    { id: "n2", name: "리니어 가이드 레일", spec: "HGR15 L500", qty: 40, unitPrice: 38000 },
  ],
};

const digits = (v: string) => Number(v.replace(/\D/g, "")) || 0;
const th = "h-10 px-3 text-[12.5px] font-semibold text-(--pl2-ink-3)";

function DateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  // 브라우저 기본 날짜 표기는 언어 설정마다 달라지므로 워크스페이스 표기로 보여주고, 누를 때만 기본 달력을 엶
  return (
    <div className="relative">
      <button type="button" id="due-date" onClick={() => ref.current?.showPicker()} className={`${inputCls} flex cursor-pointer items-center justify-between text-left`}>
        <span className={value ? "num" : "text-(--pl2-ink-4)"}>{value ? dateWithDay(value) : "납기일 선택"}</span>
        <CalendarBlank size={16} aria-hidden className="text-(--pl2-ink-4)" />
      </button>
      <input ref={ref} type="date" tabIndex={-1} aria-hidden min={TODAY} value={value} onChange={(e) => onChange(e.target.value)} className="pointer-events-none absolute inset-0 h-full w-full opacity-0" />
    </div>
  );
}

export function NewOrderScreen({ initial, onSubmit, onCancel }: { initial: Draft; onSubmit: (d: Draft) => void; onCancel: () => void }) {
  const [d, setD] = useState<Draft>(initial);
  const [seq, setSeq] = useState(10);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));
  const setItem = (id: string, patch: Partial<LineItem>) => set("items", d.items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const sub = subtotal(d.items);
  const tax = vat(sub);
  const supplier = d.supplierId ? supplierOf(d.supplierId) : null;

  const missing = [!d.supplierId && "공급사", !d.dueDate && "납기일", d.items.some((i) => !i.name.trim() || i.qty <= 0 || i.unitPrice <= 0) && "품목"].filter(Boolean);
  const reason = missing.length ? `입력 필요: ${missing.join(", ")}` : null;

  return (
    <div>
      <PageHeader title="발주 작성" sub="공급사에 보낼 발주를 작성합니다. 요청하면 승인 대기 상태로 등록됩니다." />
      <div className="grid grid-cols-[1fr_340px] items-start gap-6">
        <div className="flex flex-col gap-6">
          <Panel title="기본 정보">
            <div className="grid grid-cols-2 gap-x-5 gap-y-4 p-5">
              <Field label="공급사" required htmlFor="supplier">
                <div className="relative">
                  <select id="supplier" value={d.supplierId} onChange={(e) => set("supplierId", e.target.value)} className={`${inputCls} cursor-pointer appearance-none pr-9 ${d.supplierId ? "" : "text-(--pl2-ink-4)"}`}>
                    <option value="">공급사 선택</option>
                    {SUPPLIERS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} | {s.category}
                      </option>
                    ))}
                  </select>
                  <CaretDown size={14} aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--pl2-ink-4)" />
                </div>
              </Field>
              <Field label="납기일" required htmlFor="due-date">
                <DateField value={d.dueDate} onChange={(v) => set("dueDate", v)} />
              </Field>
              <Field label="납품 장소" required htmlFor="location">
                <div className="relative">
                  <select id="location" value={d.location} onChange={(e) => set("location", e.target.value)} className={`${inputCls} cursor-pointer appearance-none pr-9`}>
                    {LOCATIONS.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                  <CaretDown size={14} aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--pl2-ink-4)" />
                </div>
              </Field>
              <Field label="메모" htmlFor="memo">
                <input id="memo" value={d.memo} onChange={(e) => set("memo", e.target.value)} placeholder="공급사에 전달할 요청 사항" className={inputCls} />
              </Field>
            </div>
          </Panel>

          <Panel title="품목" aside={<span className="text-[12.5px] text-(--pl2-ink-4)">행 금액은 수량 x 단가로 자동 계산</span>}>
            <table className="w-full text-left text-[13px]">
              <thead className="bg-(--pl2-muted)">
                <tr>
                  <th scope="col" className={`${th} pl-5`}>품목명</th>
                  <th scope="col" className={`${th} w-[170px]`}>규격</th>
                  <th scope="col" className={`${th} w-[90px] text-right`}>수량 (EA)</th>
                  <th scope="col" className={`${th} w-[120px] text-right`}>단가 (원)</th>
                  <th scope="col" className={`${th} w-[120px] text-right`}>금액 (원)</th>
                  <th scope="col" aria-label="삭제" className="w-12" />
                </tr>
              </thead>
              <tbody>
                {d.items.map((i, idx) => (
                  <tr key={i.id} className="border-t border-(--pl2-line)">
                    <td className="py-2 pl-5 pr-1.5"><input aria-label={`품목 ${idx + 1} 품목명`} value={i.name} onChange={(e) => setItem(i.id, { name: e.target.value })} placeholder="예: 볼 베어링" className={inputCls} /></td>
                    <td className="px-1.5 py-2"><input aria-label={`품목 ${idx + 1} 규격`} value={i.spec} onChange={(e) => setItem(i.id, { spec: e.target.value })} placeholder="예: 6204ZZ" className={inputCls} /></td>
                    <td className="px-1.5 py-2"><input aria-label={`품목 ${idx + 1} 수량`} inputMode="numeric" value={i.qty ? num(i.qty) : ""} onChange={(e) => setItem(i.id, { qty: digits(e.target.value) })} placeholder="수량" className={`${inputCls} num text-right`} /></td>
                    <td className="px-1.5 py-2"><input aria-label={`품목 ${idx + 1} 단가`} inputMode="numeric" value={i.unitPrice ? num(i.unitPrice) : ""} onChange={(e) => setItem(i.id, { unitPrice: digits(e.target.value) })} placeholder="단가" className={`${inputCls} num text-right`} /></td>
                    <td className="num px-3 text-right font-semibold">{num(i.qty * i.unitPrice)}</td>
                    <td className="pr-3">
                      <button type="button" aria-label={`품목 ${idx + 1} 삭제`} disabled={d.items.length === 1} onClick={() => set("items", d.items.filter((x) => x.id !== i.id))} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-(--pl2-ink-4) transition-colors hover:bg-(--pl2-muted) hover:text-(--pl2-danger) disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-(--pl2-ink-4)">
                        <Trash size={16} aria-hidden />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-(--pl2-line) p-3">
              <Button
                variant="ghost"
                icon={<Plus size={15} weight="bold" aria-hidden />}
                onClick={() => {
                  set("items", [...d.items, { id: `n${seq}`, name: "", spec: "", qty: 0, unitPrice: 0 }]);
                  setSeq(seq + 1);
                }}
              >
                품목 추가
              </Button>
            </div>
          </Panel>
        </div>

        <Panel title="발주 요약" className="sticky top-8">
          <dl className="flex flex-col gap-2.5 p-5 text-[13.5px]">
            <div className="flex justify-between gap-4"><dt className="text-(--pl2-ink-3)">공급사</dt><dd className="font-semibold">{supplier ? supplier.name : <span className="font-normal text-(--pl2-ink-4)">미선택</span>}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-(--pl2-ink-3)">품목 수</dt><dd className="num font-semibold">{d.items.filter((i) => i.name.trim()).length}개</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-(--pl2-ink-3)">공급가액 (원)</dt><dd className="num font-semibold">{num(sub)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-(--pl2-ink-3)">부가세 (원, 10%)</dt><dd className="num font-semibold">{num(tax)}</dd></div>
            <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-(--pl2-line) pt-4">
              <dt className="font-semibold">총액 (원)</dt>
              <dd className="num text-[24px] font-semibold leading-8">{num(sub + tax)}</dd>
            </div>
          </dl>
          <div className="flex flex-col gap-2 border-t border-(--pl2-line) p-5">
            <Button disabled={!!reason} onClick={() => onSubmit(d)} className="h-10 w-full">발주 요청</Button>
            <p className="min-h-[19px] text-center text-[12.5px] text-(--pl2-ink-3)">{reason}</p>
            <Button variant="secondary" onClick={onCancel} className="w-full">취소</Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

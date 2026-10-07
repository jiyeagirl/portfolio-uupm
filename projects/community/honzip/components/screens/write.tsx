import { useState } from "react";
import { Check, Plus, X } from "@phosphor-icons/react";
import type { PostKind, Scope, Topic } from "../../lib/types";
import { TOPICS } from "../../lib/mock-data";
import { Button, Field, PhotoTile, WindowGrid, inputCls } from "../ui";

export type Draft = { topic: Topic | ""; kind: PostKind; title: string; body: string; photos: number; scope: Scope; anonymous: boolean };

export const EMPTY_DRAFT: Draft = { topic: "", kind: "question", title: "", body: "", photos: 0, scope: "우리 동네만", anonymous: false };

// 시각 검증용 입력 완료 상태 (?draft=filled)
export const FILLED_DRAFT: Draft = {
  topic: "집 관리",
  kind: "question",
  title: "욕실 환풍기 소음이 갑자기 커졌어요",
  body: "어제부터 환풍기를 켜면 덜덜거리는 소리가 나요. 직접 분리해서 청소해 봐도 되는지, 아니면 관리실에 먼저 말해야 하는지 궁금해요.",
  photos: 1,
  scope: "인근 동네까지",
  anonymous: false,
};

const KINDS: { key: PostKind; label: string }[] = [
  { key: "question", label: "질문" },
  { key: "info", label: "정보 공유" },
];
const SCOPES: Scope[] = ["우리 동네만", "인근 동네까지"];

function Segment<T extends string>({ value, options, onChange, label }: { value: T; options: { key: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          role="radio"
          aria-checked={value === o.key}
          onClick={() => onChange(o.key)}
          className={`inline-flex h-11 cursor-pointer items-center gap-1 rounded-lg border px-3.5 text-[15px] font-semibold transition-colors ${value === o.key ? "border-2 border-(--hz-primary) bg-(--hz-primary-soft) text-(--hz-primary-hover)" : "border-(--hz-line-strong) hover:bg-(--hz-muted)"}`}
        >
          {value === o.key && <Check size={15} weight="bold" aria-hidden />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function WriteScreen({ initial, dong, onSubmit, onCancel }: { initial: Draft; dong: string; onSubmit: (d: Draft) => void; onCancel: () => void }) {
  const [d, setD] = useState<Draft>(initial);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));

  const missing = [!d.topic && "주제", !d.title.trim() && "제목", !d.body.trim() && "본문"].filter(Boolean);

  return (
    <div className="mx-auto max-w-[720px]">
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-(--hz-primary) px-5 py-5 text-white md:px-7 md:py-6">
        <WindowGrid className="pointer-events-none absolute -right-3 -top-5 h-32 w-32 text-white/15" />
        <h1 className="heading text-[24px] font-bold leading-8 md:text-[30px] md:leading-10">글쓰기</h1>
        <p className="mt-1 text-[14.5px] text-white/90">{dong} 이웃들에게 묻거나 알려 주고 싶은 것을 적어 주세요.</p>
      </div>

      <form
        className="flex flex-col gap-6 rounded-xl border border-(--hz-line) bg-(--hz-surface) p-5 md:p-7"
        onSubmit={(e) => {
          e.preventDefault();
          if (!missing.length) onSubmit(d);
        }}
      >
        <Field label="주제" required>
          <div role="radiogroup" aria-label="주제" className="flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={d.topic === t}
                onClick={() => set("topic", t)}
                className={`inline-flex h-11 cursor-pointer items-center gap-1 rounded-lg border px-3.5 text-[15px] font-semibold transition-colors ${d.topic === t ? "border-2 border-(--hz-primary) bg-(--hz-primary-soft) text-(--hz-primary-hover)" : "border-(--hz-line-strong) hover:bg-(--hz-muted)"}`}
              >
                {d.topic === t && <Check size={15} weight="bold" aria-hidden />}
                {t}
              </button>
            ))}
          </div>
        </Field>

        <Field label="글 종류" required>
          <Segment label="글 종류" value={d.kind} options={KINDS} onChange={(v) => set("kind", v)} />
        </Field>

        <Field label="제목" required htmlFor="title">
          <input id="title" value={d.title} maxLength={60} onChange={(e) => set("title", e.target.value)} placeholder={d.kind === "question" ? "무엇이 궁금한가요?" : "이웃에게 알려 주고 싶은 것은 무엇인가요?"} className={`${inputCls} h-14 text-[18px] font-bold placeholder:font-normal`} />
        </Field>

        <Field label="본문" required htmlFor="body">
          <textarea id="body" value={d.body} onChange={(e) => set("body", e.target.value)} rows={7} placeholder="상황을 자세히 적을수록 이웃이 더 정확하게 답해 줄 수 있어요" className={`${inputCls} resize-y py-3 leading-[26px]`} />
        </Field>

        <Field label="사진" hint={`${d.photos}/3장 첨부`}>
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: d.photos }).map((_, i) => (
              <div key={i} className="relative h-24 w-32 overflow-hidden rounded-2xl">
                <PhotoTile className="h-full w-full" />
                <button type="button" aria-label={`사진 ${i + 1} 삭제`} onClick={() => set("photos", d.photos - 1)} className="absolute right-0 top-0 flex h-11 w-11 cursor-pointer items-start justify-end p-1.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-(--hz-ink) text-white"><X size={14} weight="bold" aria-hidden /></span>
                </button>
              </div>
            ))}
            {d.photos < 3 && (
              <button type="button" onClick={() => set("photos", d.photos + 1)} className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-(--hz-primary)/40 bg-(--hz-primary-soft)/50 text-[13px] font-semibold text-(--hz-primary-hover) transition-colors hover:bg-(--hz-primary-soft)">
                <span className="flex items-center gap-1"><WindowGrid className="h-6 w-6" /><Plus size={16} weight="bold" aria-hidden /></span>
                사진 추가
              </button>
            )}
          </div>
        </Field>

        <Field label="공개 범위">
          <Segment label="공개 범위" value={d.scope} options={SCOPES.map((s) => ({ key: s, label: s }))} onChange={(v) => set("scope", v)} />
        </Field>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-(--hz-canvas) px-4 py-3.5">
          <input type="checkbox" checked={d.anonymous} onChange={(e) => set("anonymous", e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-(--hz-primary)" />
          <span>
            <span className="block text-[15px] font-semibold">익명으로 올리기</span>
            <span className="block text-[13px] text-(--hz-ink-4)">닉네임 대신 익명으로 표시돼요. 동네는 그대로 보여요.</span>
          </span>
        </label>

        <div className="flex flex-col gap-3 border-t border-(--hz-line) pt-5">
          <p className="min-h-6 text-[14px] font-medium text-(--hz-ink-2) md:text-right">{missing.length ? `등록하려면 ${missing.join(", ")} 입력이 필요해요` : ""}</p>
          <div className="flex flex-col gap-2 md:flex-row-reverse">
            <Button variant="cta" type="submit" disabled={missing.length > 0} className="h-12 md:min-w-32">등록</Button>
            <Button variant="secondary" className="h-12" onClick={onCancel}>취소</Button>
          </div>
        </div>
      </form>
    </div>
  );
}

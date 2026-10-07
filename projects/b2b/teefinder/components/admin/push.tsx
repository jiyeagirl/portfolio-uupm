"use client";

import { useState } from "react";
import { PaperPlaneTilt } from "@phosphor-icons/react";
import { groupTargets, useTee } from "../../lib/store";
import { Button, Field, Mark, cx, inputSmCls } from "../ui";
import { PageHeader, Panel, selectCls, textareaCls, thCls, tdCls, useToast } from "./parts";

export function PushScreen({ initialTitle, initialBody }: { initialTitle?: string; initialBody?: string }) {
  const { pushes, sendPush, recipientCount } = useTee();
  const targets = groupTargets();
  const [target, setTarget] = useState(targets[0].label);
  const [title, setTitle] = useState(initialTitle ?? "");
  const [body, setBody] = useState(initialBody ?? "");
  const [freshId, setFreshId] = useState<string | null>(null);
  const toast = useToast();

  const count = recipientCount(target);
  const canSend = title.trim() !== "" && body.trim() !== "" && count > 0;

  const send = () => {
    sendPush(target, title.trim(), body.trim());
    setFreshId("latest");
    toast.show(`${count}명에게 발송했습니다. 회원 앱 알림함에 공지로 표시됩니다`);
    setTitle("");
    setBody("");
  };

  return (
    <div className="min-h-full">
      <PageHeader title="푸시 발송" desc="회원 그룹을 골라 공지를 보내면 회원 앱 알림함에도 공지로 나타납니다" />

      <div className="space-y-5 px-8 py-5">
        <div className="grid grid-cols-[1fr_320px] items-start gap-5">
          <Panel title="발송 내용">
            <div className="space-y-4 p-5">
              <Field label="대상" small>
                <select value={target} onChange={(e) => setTarget(e.target.value)} className={selectCls}>
                  {targets.map((t) => (
                    <option key={t.label}>{t.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="제목" small>
                <input value={title} onChange={(e) => setTitle(e.target.value.slice(0, 30))} className={inputSmCls} placeholder="예: 11월 티타임 오픈 안내" />
              </Field>
              <Field label="본문" small>
                <textarea value={body} onChange={(e) => setBody(e.target.value.slice(0, 120))} rows={4} className={textareaCls} placeholder="회원에게 전할 내용을 입력하세요" />
                <span className="tf-num mt-1 block text-right text-[12px] text-(--tf-sub)">{body.length} / 120</span>
              </Field>
              <div className="flex items-center justify-between border-t border-[#E3E7E3] pt-4">
                <p className="text-[13px] text-(--tf-text)">
                  수신 대상 <span className="tf-num text-[18px] font-bold text-(--tf-ink)">{count}</span>명
                </p>
                <Button size="sm" className="min-h-10 px-5" disabled={!canSend} onClick={send}>
                  <PaperPlaneTilt size={15} weight="fill" aria-hidden />
                  발송
                </Button>
              </div>
              {!canSend && <p className="-mt-2 text-right text-[12px] text-(--tf-sub)">{count === 0 ? "수신 대상이 없는 그룹입니다" : "제목과 본문을 입력하면 발송할 수 있습니다"}</p>}
            </div>
          </Panel>

          <Panel title="미리보기">
            <div className="flex justify-center bg-[#EEF1EE] px-5 py-6">
              <div className="w-[240px] rounded-[34px] border-[6px] border-[#1B1F1D] bg-(--tf-ink) px-3 pb-8 pt-4">
                <div className="mx-auto mb-4 h-4 w-16 rounded-full bg-black" />
                <p className="tf-num text-center text-[34px] font-light leading-10 text-white/90">9:41</p>
                <p className="mb-5 text-center text-[11px] text-white/60">10월 7일 수요일</p>
                <div className="rounded-2xl bg-white/95 p-3">
                  <div className="flex items-center gap-1.5 text-[10.5px] text-(--tf-sub)">
                    <span className="flex h-4 w-4 items-center justify-center rounded bg-(--tf-ink)"><Mark size={12} /></span>
                    TeeFinder
                    <span className="ml-auto">지금</span>
                  </div>
                  <p className={cx("mt-1 text-[12.5px] font-bold leading-4", title ? "text-(--tf-text)" : "text-[#8A938E]")}>{title || "제목이 여기에 표시됩니다"}</p>
                  <p className={cx("mt-0.5 line-clamp-3 text-[11.5px] leading-[15px]", body ? "text-(--tf-sub)" : "text-[#8A938E]")}>{body || "본문 미리보기"}</p>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <Panel title="발송 이력">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thCls}>발송 일시</th>
                <th className={thCls}>대상</th>
                <th className={thCls}>제목</th>
                <th className={cx(thCls, "text-right")}>수신 (명)</th>
              </tr>
            </thead>
            <tbody>
              {pushes.map((p, i) => (
                <tr key={p.id} className={cx("h-[52px] border-b border-[#EDF0ED] last:border-b-0", i === 0 && freshId && "bg-[#F3FBF6]")}>
                  <td className={cx(tdCls, "tf-num")}>{p.sentAt}</td>
                  <td className={tdCls}>{p.target}</td>
                  <td className={tdCls}>
                    <span className="block font-semibold leading-5">{p.title}</span>
                    <span className="block max-w-[520px] truncate text-[12px] leading-4 text-(--tf-sub)">{p.body}</span>
                  </td>
                  <td className={cx(tdCls, "tf-num text-right font-semibold")}>{p.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
      {toast.node}
    </div>
  );
}

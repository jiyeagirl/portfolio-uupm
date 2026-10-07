"use client";

import { useState } from "react";
import { Wrench } from "@phosphor-icons/react";
import { useTee } from "../../lib/store";
import { INTERVAL_COST, PROXY } from "../../lib/mock-data";
import { fmtWon } from "../../lib/format";
import { Badge, Button, cx } from "../ui";
import { PageHeader, Panel, selectCls, thCls, tdCls, useToast } from "./parts";

export function MonitoringScreen({ onFix }: { onFix: (courseId: string) => void }) {
  const { courses, logs, interval, setIntervalMin, failN, setFailN } = useTee();
  const [n, setN] = useState(failN);
  const toast = useToast();

  const measured = courses.filter((c) => c.lastSuccess !== "-");
  const avg = measured.reduce((s, c) => s + c.rate24h, 0) / Math.max(measured.length, 1);
  const errors = courses.filter((c) => c.status === "error").length;
  const nameOf = (id: string) => courses.find((c) => c.id === id)?.name ?? id;
  const order = { error: 0, warn: 1, captcha: 2, ok: 3 } as const;
  const sorted = [...courses].sort((a, b) => order[a.status] - order[b.status] || a.rate24h - b.rate24h);

  const kpis: [string, string, boolean][] = [
    ["전체 수집 성공률 (%)", avg.toFixed(1), false],
    ["오류 골프장 수 (곳)", String(errors), errors > 0],
    ["프록시 가용률 (%)", PROXY.rate.toFixed(1), false],
    ["마지막 수집 시각", "11:50", false],
  ];

  return (
    <div className="min-h-full">
      <PageHeader title="수집 모니터링" desc="골프장별 수집 상태를 확인하고 오류는 설정 화면에서 바로 고칩니다" />

      <div className="space-y-5 px-8 py-5">
        <div className="grid grid-cols-4 divide-x divide-[#E3E7E3] rounded-lg border border-[#E3E7E3] bg-white">
          {kpis.map(([label, value, bad]) => (
            <div key={label} className="px-5 py-4">
              <p className="text-[12.5px] font-semibold text-(--tf-sub)">{label}</p>
              <p className={cx("tf-num mt-1 text-[28px] font-semibold leading-9", bad ? "text-[#B42318]" : "text-(--tf-ink)")}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_340px] items-start gap-5">
          <Panel title="골프장별 수집 상태" right={<span className="text-[12.5px] text-(--tf-sub)">오류, 점검 필요 순</span>}>
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full">
                <thead className="sticky top-0">
                  <tr>
                    <th className={thCls}>골프장</th>
                    <th className={cx(thCls, "text-right")}>24시간 성공률 (%)</th>
                    <th className={thCls}>마지막 성공</th>
                    <th className={thCls}>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((c) => (
                    <tr key={c.id} className={cx("h-[52px] border-b border-[#EDF0ED]", c.status === "error" && "bg-[#FDF3F2]")}>
                      <td className={tdCls}>
                        <span className={cx("block font-bold leading-5", c.status === "error" && "text-[#B42318]")}>{c.name}</span>
                        <span className="block text-[12px] leading-4 text-(--tf-sub)">{c.area}</span>
                      </td>
                      <td className={cx(tdCls, "tf-num text-right font-semibold", c.status === "error" ? "text-[#B42318]" : c.status === "warn" ? "text-[#9A4A00]" : "")}>{c.rate24h.toFixed(1)}</td>
                      <td className={cx(tdCls, "tf-num")}>{c.lastSuccess}</td>
                      <td className={tdCls}>
                        <Badge kind={`course:${c.status}`} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <div className="space-y-5">
            <Panel title="수집 간격">
              <div className="p-4">
                <div role="radiogroup" aria-label="수집 간격" className="grid grid-cols-3 gap-2">
                  {INTERVAL_COST.map(({ minutes, cost }) => (
                    <button
                      key={minutes}
                      type="button"
                      role="radio"
                      aria-checked={interval === minutes}
                      onClick={() => setIntervalMin(minutes)}
                      className={cx("rounded-lg border px-2 py-3 text-center transition-colors duration-150", interval === minutes ? "border-(--tf-ink) bg-(--tf-ink)/6" : "border-[#D9DDD9] hover:bg-[#FAFBFA]")}
                    >
                      <span className="block text-[14px] font-bold text-(--tf-text)">{minutes}분</span>
                      <span className="tf-num mt-1 block text-[12.5px] text-(--tf-sub)">{fmtWon(cost)}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-[12.5px] leading-[18px] text-(--tf-text)">
                  선택한 {interval}분 간격의 예상 월 운영비는 <span className="tf-num font-bold">{fmtWon(INTERVAL_COST.find((i) => i.minutes === interval)?.cost ?? 0)}</span>입니다.
                </p>
                <p className="mt-1 text-[11.5px] leading-4 text-(--tf-sub)">예시 수치입니다. 실제는 견적 확정 후 안내</p>
              </div>
            </Panel>

            <Panel title="프록시 상태">
              <div className="p-4 text-[13px]">
                <div className="flex items-baseline justify-between">
                  <span className="text-(--tf-sub)">가용 프록시</span>
                  <span className="tf-num font-bold text-(--tf-text)">{PROXY.active} / {PROXY.total}개</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E3E7E3]" role="img" aria-label={`프록시 가용률 ${PROXY.rate}%`}>
                  <div className="h-full rounded-full bg-[#2E8B57]" style={{ width: `${PROXY.rate}%` }} />
                </div>
                <p className="mt-2 text-[12px] text-(--tf-sub)">연결이 끊긴 프록시는 자동으로 다른 프록시로 전환됩니다.</p>
              </div>
            </Panel>

            <Panel title="수집 실패 알림 기준">
              <div className="p-4">
                <p className="mb-2 text-[13px] text-(--tf-text)">연속 실패 횟수가 기준에 닿으면 운영자에게 알립니다</p>
                <select value={n} onChange={(e) => setN(Number(e.target.value))} aria-label="연속 실패 횟수" className={cx(selectCls, "tf-num")}>
                  {[2, 3, 5, 10].map((v) => (
                    <option key={v} value={v}>연속 {v}회 실패 시</option>
                  ))}
                </select>
                <Button
                  size="sm"
                  className="mt-3"
                  disabled={n === failN}
                  onClick={() => {
                    setFailN(n);
                    toast.show(`연속 ${n}회 실패 시 알림으로 저장했습니다`);
                  }}
                >
                  기준 저장
                </Button>
              </div>
            </Panel>
          </div>
        </div>

        <Panel title="오류 로그" right={<span className="text-[12.5px] text-(--tf-sub)">오늘 {logs.length}건</span>}>
          <table className="w-full">
            <thead>
              <tr>
                <th className={thCls}>시각</th>
                <th className={thCls}>골프장</th>
                <th className={thCls}>수준</th>
                <th className={thCls}>내용</th>
                <th className={thCls} />
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="h-12 border-b border-[#EDF0ED] last:border-b-0">
                  <td className={cx(tdCls, "tf-num")}>{l.at}</td>
                  <td className={cx(tdCls, "font-semibold")}>{nameOf(l.courseId)}</td>
                  <td className={tdCls}>
                    <Badge kind={l.level === "error" ? "course:error" : "course:warn"} size="sm" label={l.level === "error" ? "오류" : "경고"} />
                  </td>
                  <td className={tdCls}>{l.message}</td>
                  <td className={cx(tdCls, "text-right")}>
                    <Button size="sm" variant="outline" onClick={() => onFix(l.courseId)}>
                      <Wrench size={14} aria-hidden />
                      설정 수정하기
                    </Button>
                  </td>
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

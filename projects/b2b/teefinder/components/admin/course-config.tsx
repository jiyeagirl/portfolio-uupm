"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle, MagnifyingGlass, Play, Plus, SpinnerGap, WarningOctagon } from "@phosphor-icons/react";
import { useTee } from "../../lib/store";
import { slotsFor } from "../../lib/mock-data";
import { REGIONS, type Course, type LoginType, type Region } from "../../lib/types";
import { fmtWon } from "../../lib/format";
import { Badge, Button, Field, cx, inputSmCls } from "../ui";
import { PageHeader, Panel, selectCls, thCls, tdCls, useToast } from "./parts";

/** 목업 시험 실행이 "정답"으로 보는 값. 홈페이지 개편으로 값이 바뀐 골프장을 운영자가 고치는 흐름을 보여 줌 */
const FIXES: Record<string, Partial<Course>> = {
  c05: { selId: "#loginId", selPw: "#loginPw" },
  c08: { apiTime: "tee_time" },
};

interface StepResult {
  ok: boolean;
  msg: string;
}

function evaluate(f: Course): StepResult[] {
  const fix = FIXES[f.id];
  const out: StepResult[] = [];

  if (!f.domain.trim()) return [{ ok: false, msg: "도메인 URL을 입력해 주세요" }];
  if (!f.selId.trim() || !f.selPw.trim() || !f.selBtn.trim()) return [{ ok: false, msg: "아이디, 비밀번호, 버튼 선택자를 모두 입력해 주세요" }];
  if (fix?.selId && f.selId !== fix.selId) {
    return [{ ok: false, msg: `선택자 ${f.selId}를 로그인 페이지에서 찾을 수 없음. 아이디 입력칸의 id가 ${fix.selId.slice(1)}로 바뀐 것으로 보임` }];
  }
  if (fix?.selPw && f.selPw !== fix.selPw) {
    return [{ ok: false, msg: `선택자 ${f.selPw}를 로그인 페이지에서 찾을 수 없음. 비밀번호 입력칸의 id가 ${fix.selPw.slice(1)}로 바뀐 것으로 보임` }];
  }
  out.push({ ok: true, msg: f.loginType === "captcha" ? "로그인 성공 (보안문자는 회원이 앱에서 직접 입력)" : "로그인 성공 (0.8초)" });

  if (!f.apiDate.trim() || !f.apiTime.trim() || !f.apiCourse.trim() || !f.apiFee.trim()) {
    out.push({ ok: false, msg: "날짜, 시간, 코스, 그린피 파라미터를 모두 입력해 주세요" });
    return out;
  }
  if (fix?.apiTime && f.apiTime !== fix.apiTime) {
    out.push({ ok: false, msg: `응답에서 ${f.apiTime} 필드를 찾을 수 없음. 응답 필드명이 ${fix.apiTime}로 바뀐 것으로 보임` });
    return out;
  }
  out.push({ ok: true, msg: f.status === "warn" ? "응답 200, 14일치 조회 (응답 지연 8.2초)" : "응답 200, 14일치 조회 (1.2초)" });
  out.push({ ok: true, msg: "시간 9건 파싱" });
  return out;
}

const STEP_LABELS = ["로그인", "티타임 조회", "파싱 결과 미리보기"];

const LABEL: Partial<Record<keyof Course, string>> = {
  name: "이름",
  region: "지역",
  area: "위치",
  layouts: "코스",
  domain: "도메인",
  loginType: "로그인 방식",
  selId: "아이디 선택자",
  selPw: "비밀번호 선택자",
  selBtn: "버튼 선택자",
  apiDate: "날짜 파라미터",
  apiTime: "시간 파라미터",
  apiCourse: "코스 파라미터",
  apiFee: "그린피 파라미터",
  bookingUrl: "예약 URL 패턴",
};

function blank(id: string): Course {
  return {
    id,
    name: "",
    region: "서울/경기",
    area: "",
    layouts: [],
    status: "warn",
    loginType: "normal",
    domain: "",
    selId: "",
    selPw: "",
    selBtn: "",
    apiDate: "",
    apiTime: "",
    apiCourse: "",
    apiFee: "",
    bookingUrl: "",
    rate24h: 0,
    lastSuccess: "-",
  };
}

export function CourseConfigScreen({ initialId, initialTest }: { initialId?: string; initialTest?: boolean }) {
  const { courses, saveCourse, addCourse, configLog } = useTee();
  const [query, setQuery] = useState("");
  const [selId, setSelId] = useState<string>(initialId && courses.some((c) => c.id === initialId) ? initialId : "c05");
  const isNew = selId === "new";
  const base = isNew ? blank(`c${String(courses.length + 1).padStart(2, "0")}`) : (courses.find((c) => c.id === selId) ?? courses[0]);
  const [form, setForm] = useState<Course>(base);
  const [layoutsText, setLayoutsText] = useState(base.layouts.join(", "));
  const [stage, setStage] = useState<{ results: StepResult[]; shown: number } | null>(null);
  const timers = useRef<number[]>([]);
  const toast = useToast();

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  const choose = (id: string) => {
    clearTimers();
    setSelId(id);
    const next = id === "new" ? blank(`c${String(courses.length + 1).padStart(2, "0")}`) : (courses.find((c) => c.id === id) ?? courses[0]);
    setForm(next);
    setLayoutsText(next.layouts.join(", "));
    setStage(null);
  };

  const run = () => {
    clearTimers();
    const results = evaluate({ ...form, layouts: layoutsText.split(",").map((s) => s.trim()).filter(Boolean) });
    setStage({ results, shown: 0 });
    results.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setStage({ results, shown: i + 1 }), 650 * (i + 1)));
    });
  };

  useEffect(() => {
    if (!initialTest) return;
    const t = window.setTimeout(run, 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof Course>(k: K, v: Course[K]) => setForm((f) => ({ ...f, [k]: v }));

  const layouts = layoutsText.split(",").map((s) => s.trim()).filter(Boolean);
  const canSave = form.name.trim() !== "" && form.domain.trim() !== "";

  const save = () => {
    const next: Course = { ...form, layouts };
    if (isNew) {
      addCourse({ ...next, name: next.name.trim() });
      toast.show(`${next.name} 골프장을 추가했습니다`);
      setSelId(next.id);
      return;
    }
    const diffs = (Object.keys(LABEL) as (keyof Course)[]).filter((k) => JSON.stringify(next[k]) !== JSON.stringify(base[k])).map((k) => LABEL[k]);
    const passes = evaluate(next).every((r) => r.ok);
    const recovered = base.status === "error" && passes;
    const saved: Course = recovered ? { ...next, status: "ok", errorNote: undefined } : next;
    saveCourse(saved, diffs.length ? `${diffs.join(", ")} 수정` : "설정 저장");
    toast.show(recovered ? `${next.name} 설정을 저장했습니다. 다음 수집부터 정상 상태로 돌아옵니다` : `${next.name} 설정을 저장했습니다`);
  };

  const list = courses.filter((c) => query.trim() === "" || c.name.includes(query.trim()) || c.area.includes(query.trim()));
  const history = configLog.filter((h) => h.courseId === base.id).slice(0, 4);
  const nameOf = (id: string) => courses.find((c) => c.id === id)?.name ?? id;

  const result = stage?.results ?? [];
  const done = stage !== null && stage.shown >= result.length;
  const allOk = result.length === 3 && result.every((r) => r.ok);
  const previewDate = "2026-10-10";
  const preview = slotsFor("c01", previewDate).slice(0, 4);

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        title="골프장 설정"
        desc="코드 수정 없이 주소, 선택자, API 파라미터를 고치고 저장 전에 시험 실행으로 확인합니다"
        action={
          <Button size="sm" variant="outline" onClick={() => choose("new")}>
            <Plus size={14} weight="bold" aria-hidden />
            골프장 추가
          </Button>
        }
      />

      <div className="grid min-h-0 flex-1 grid-cols-[280px_1fr_340px]">
        {/* 목록 */}
        <div className="flex min-h-0 flex-col border-r border-[#E3E7E3]">
          <label className="relative m-3 block">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--tf-sub)" aria-hidden />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="골프장 검색" aria-label="골프장 검색" className={cx(inputSmCls, "pl-9")} />
          </label>
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {list.map((c) => (
              <li key={c.id} className="border-b border-[#EDF0ED]">
                <button
                  type="button"
                  aria-pressed={selId === c.id}
                  onClick={() => choose(c.id)}
                  className={cx("flex min-h-[56px] w-full items-center justify-between gap-2 px-4 py-2 text-left transition-colors duration-150", selId === c.id ? "bg-(--tf-ink)/6 shadow-[inset_3px_0_0_var(--tf-ink)]" : "hover:bg-[#FAFBFA]")}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] font-bold text-(--tf-text)">{c.name}</span>
                    <span className="block text-[12px] text-(--tf-sub)">{c.area}</span>
                  </span>
                  <Badge kind={`course:${c.status}`} size="sm" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* 폼 */}
        <div className="min-h-0 overflow-y-auto bg-[#FAFBFA] p-6">
          <div className="mx-auto flex max-w-[620px] flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="tf-heading text-[22px] text-(--tf-ink)">{isNew ? "새 골프장" : form.name}</h2>
              {!isNew && <Badge kind={`course:${base.status}`} />}
            </div>
            {!isNew && base.status === "error" && base.errorNote && (
              <p className="rounded-lg border border-[#F1C5C1] bg-[#FDF3F2] px-4 py-3 text-[13px] leading-5 text-[#B42318]">
                <span className="font-bold">수집 오류</span> {base.errorNote}. 아래 설정을 고치고 시험 실행으로 확인하세요.
              </p>
            )}

            <Panel title="기본 정보">
              <div className="grid grid-cols-2 gap-3 p-4">
                <Field label="이름" small>
                  <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputSmCls} placeholder="예: 새봄 CC" />
                </Field>
                <Field label="지역" small>
                  <select value={form.region} onChange={(e) => set("region", e.target.value as Region)} className={selectCls}>
                    {REGIONS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </Field>
                <Field label="위치" small>
                  <input value={form.area} onChange={(e) => set("area", e.target.value)} className={inputSmCls} placeholder="예: 경기 용인" />
                </Field>
                <Field label="코스 (쉼표로 구분)" small>
                  <input value={layoutsText} onChange={(e) => setLayoutsText(e.target.value)} className={inputSmCls} placeholder="레이크, 힐" />
                </Field>
              </div>
            </Panel>

            <Panel title="접속과 로그인">
              <div className="grid grid-cols-2 gap-3 p-4">
                <div className="col-span-2">
                  <Field label="도메인 URL" small>
                    <input value={form.domain} onChange={(e) => set("domain", e.target.value)} className={cx(inputSmCls, "tf-num")} placeholder="https://www.example-cc.example" />
                  </Field>
                </div>
                <Field label="로그인 방식" small>
                  <select value={form.loginType} onChange={(e) => set("loginType", e.target.value as LoginType)} className={selectCls}>
                    <option value="normal">일반</option>
                    <option value="captcha">보안문자</option>
                  </select>
                </Field>
                <div />
                <Field label="아이디 Selector" small>
                  <input value={form.selId} onChange={(e) => set("selId", e.target.value)} className={cx(inputSmCls, "font-mono")} />
                </Field>
                <Field label="비밀번호 Selector" small>
                  <input value={form.selPw} onChange={(e) => set("selPw", e.target.value)} className={cx(inputSmCls, "font-mono")} />
                </Field>
                <div className="col-span-2">
                  <Field label="로그인 버튼 Selector" small>
                    <input value={form.selBtn} onChange={(e) => set("selBtn", e.target.value)} className={cx(inputSmCls, "font-mono")} />
                  </Field>
                </div>
              </div>
            </Panel>

            <Panel title="티타임 API 파라미터 매핑">
              <div className="grid grid-cols-2 gap-3 p-4">
                <Field label="날짜" small>
                  <input value={form.apiDate} onChange={(e) => set("apiDate", e.target.value)} className={cx(inputSmCls, "font-mono")} />
                </Field>
                <Field label="시간" small>
                  <input value={form.apiTime} onChange={(e) => set("apiTime", e.target.value)} className={cx(inputSmCls, "font-mono")} />
                </Field>
                <Field label="코스" small>
                  <input value={form.apiCourse} onChange={(e) => set("apiCourse", e.target.value)} className={cx(inputSmCls, "font-mono")} />
                </Field>
                <Field label="그린피" small>
                  <input value={form.apiFee} onChange={(e) => set("apiFee", e.target.value)} className={cx(inputSmCls, "font-mono")} />
                </Field>
                <div className="col-span-2">
                  <Field label="예약 페이지 이동 URL 패턴" small hint="{date}, {time}, {course}가 선택한 자리 값으로 바뀝니다">
                    <input value={form.bookingUrl} onChange={(e) => set("bookingUrl", e.target.value)} className={cx(inputSmCls, "font-mono")} />
                  </Field>
                </div>
              </div>
            </Panel>
          </div>
        </div>

        {/* 시험 실행, 변경 이력 */}
        <aside className="min-h-0 overflow-y-auto border-l border-[#E3E7E3] bg-white p-5">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={run}>
              <Play size={14} weight="fill" aria-hidden />
              시험 실행
            </Button>
            <Button size="sm" className="flex-1" disabled={!canSave} onClick={save}>저장</Button>
          </div>
          <p className="mt-2 text-[12px] leading-4 text-(--tf-sub)">{canSave ? "저장하면 변경 이력에 한 줄이 추가됩니다. 저장 전에 시험 실행을 권장합니다." : "이름과 도메인 URL을 입력하면 저장할 수 있습니다."}</p>

          <h3 className="mt-5 text-[13px] font-bold text-(--tf-text)">시험 실행 결과</h3>
          {!stage ? (
            <p className="mt-2 rounded-lg border border-dashed border-[#CBD2CC] px-3 py-5 text-center text-[12.5px] leading-5 text-(--tf-sub)">
              시험 실행을 누르면 로그인, 티타임 조회, 파싱 결과를 단계별로 확인합니다.
            </p>
          ) : (
            <ol className="mt-2 space-y-2">
              {STEP_LABELS.map((label, i) => {
                const r = result[i];
                const revealed = r !== undefined && stage.shown > i;
                const running = r !== undefined && stage.shown === i;
                const skipped = r === undefined;
                return (
                  <li key={label} className={cx("rounded-lg border px-3 py-2.5", revealed ? (r.ok ? "border-[#BFE3CB] bg-[#F3FBF6]" : "border-[#F1C5C1] bg-[#FDF3F2]") : "border-[#E3E7E3] bg-white")}>
                    <div className="flex items-center gap-2 text-[13px] font-bold text-(--tf-text)">
                      {revealed ? (
                        r.ok ? <CheckCircle size={16} weight="fill" className="text-[#166534]" aria-label="성공" /> : <WarningOctagon size={16} weight="fill" className="text-[#B42318]" aria-label="실패" />
                      ) : running ? (
                        <SpinnerGap size={16} className="animate-spin text-(--tf-brass-ink)" aria-label="실행 중" />
                      ) : (
                        <span className="h-3 w-3 rounded-full border border-[#B9C0BB]" aria-label="대기" />
                      )}
                      <span className="tf-num text-(--tf-sub)">{i + 1}</span>
                      {label}
                      {skipped && stage.shown >= result.length && <span className="ml-auto text-[11.5px] font-medium text-(--tf-sub)">실행 안 함</span>}
                    </div>
                    {revealed && <p className={cx("mt-1 text-[12.5px] leading-[18px]", r.ok ? "text-[#166534]" : "text-[#B42318]")}>{r.msg}</p>}
                  </li>
                );
              })}
            </ol>
          )}

          {done && allOk && (
            <div className="mt-3 overflow-hidden rounded-lg border border-[#E3E7E3]">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={cx(thCls, "h-8 px-3 text-[12px]")}>시간</th>
                    <th className={cx(thCls, "h-8 px-3 text-[12px]")}>코스</th>
                    <th className={cx(thCls, "h-8 px-3 text-right text-[12px]")}>그린피 (원)</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((s) => (
                    <tr key={s.id} className="h-9 border-t border-[#EDF0ED]">
                      <td className={cx(tdCls, "tf-num px-3 text-[12.5px]")}>{s.date.slice(5)} {s.time}</td>
                      <td className={cx(tdCls, "px-3 text-[12.5px]")}>{s.layout}</td>
                      <td className={cx(tdCls, "tf-num px-3 text-right text-[12.5px]")}>{fmtWon(s.fee).replace("원", "")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {done && !allOk && result.some((r) => !r.ok) && <p className="mt-3 text-[12.5px] leading-5 text-(--tf-sub)">설정을 고친 뒤 다시 시험 실행하세요. 실패한 단계 이후는 실행하지 않습니다.</p>}

          <h3 className="mt-6 text-[13px] font-bold text-(--tf-text)">변경 이력</h3>
          {history.length === 0 ? (
            <p className="mt-2 text-[12.5px] text-(--tf-sub)">이 골프장의 변경 이력이 없습니다.</p>
          ) : (
            <ul className="mt-2 divide-y divide-[#EDF0ED] text-[12.5px]">
              {history.map((h) => (
                <li key={h.id} className="py-2">
                  <p className="tf-num text-(--tf-sub)">{h.at}</p>
                  <p className="text-(--tf-text)">{nameOf(h.courseId)}: {h.text}</p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
      {toast.node}
    </div>
  );
}

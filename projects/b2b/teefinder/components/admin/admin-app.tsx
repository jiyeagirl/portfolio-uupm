"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { DeviceMobile, Flag, PaperPlaneTilt, Pulse, UserCheck, Users } from "@phosphor-icons/react";
import "../../styles/teefinder.css";
import { TeeProvider, useTee } from "../../lib/store";
import { ADMIN_SCREENS, type AdminScreen } from "../../lib/types";
import { Wordmark, cx } from "../ui";
import { ApprovalsScreen } from "./approvals";
import { MembersScreen } from "./members";
import { CourseConfigScreen } from "./course-config";
import { MonitoringScreen } from "./monitoring";
import { PushScreen } from "./push";

const NAV: { key: AdminScreen; label: string; Icon: typeof Users }[] = [
  { key: "approvals", label: "가입 승인", Icon: UserCheck },
  { key: "members", label: "회원 관리", Icon: Users },
  { key: "course-config", label: "골프장 설정", Icon: Flag },
  { key: "monitoring", label: "수집 모니터링", Icon: Pulse },
  { key: "push", label: "푸시 발송", Icon: PaperPlaneTilt },
];

export function toAdminScreen(s: string | null | undefined): AdminScreen {
  const k = (s ?? "").replace(/^admin-/, "") as AdminScreen;
  return ADMIN_SCREENS.includes(k) ? k : "approvals";
}

export function AdminConsole({ initialScreen, q, onSwitch }: { initialScreen?: AdminScreen; q: Record<string, string>; onSwitch?: () => void }) {
  const { members, courses } = useTee();
  const [screen, setScreen] = useState<AdminScreen>(initialScreen ?? "approvals");
  const [fixId, setFixId] = useState<string | undefined>(q.id);
  const pending = members.filter((m) => m.status === "pending").length;
  const errors = courses.filter((c) => c.status === "error").length;

  const badge = (k: AdminScreen) => (k === "approvals" ? pending : k === "monitoring" ? errors : 0);

  return (
    <div className="teefinder flex min-h-dvh bg-white text-[13.5px] leading-5">
      <div className="w-[240px] shrink-0 bg-(--tf-ink)">
      <aside className="sticky top-0 flex h-dvh w-[240px] flex-col px-3 py-5 text-white">
        <div className="px-3">
          <Wordmark size={19} />
          <p className="mt-1 pl-[34px] text-[12px] text-white/60">운영 콘솔</p>
        </div>
        <nav aria-label="관리자 메뉴" className="mt-7 flex flex-col gap-1">
          {NAV.map(({ key, label, Icon }) => {
            const active = screen === key;
            const n = badge(key);
            return (
              <button
                key={key}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => setScreen(key)}
                className={cx("relative flex h-11 items-center gap-3 rounded-lg px-3 text-left text-[14px] transition-colors duration-150", active ? "bg-(--tf-ink-2) font-bold text-white" : "text-white/75 hover:bg-white/8")}
              >
                {active && <span className="absolute inset-y-2 left-0 w-[3px] rounded-r bg-(--tf-brass)" />}
                <Icon size={19} weight={active ? "fill" : "regular"} aria-hidden />
                <span className="flex-1">{label}</span>
                {n > 0 && (
                  <span className={cx("tf-num flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11.5px] font-bold", key === "monitoring" ? "bg-[#E5584B] text-white" : "bg-(--tf-brass) text-(--tf-ink)")}>{n}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto">
          {onSwitch && (
            <button type="button" onClick={onSwitch} className="mb-3 flex h-11 w-full items-center gap-3 rounded-lg border border-white/20 px-3 text-[13.5px] font-semibold text-white/90 hover:bg-white/8">
              <DeviceMobile size={18} aria-hidden />
              회원 앱 보기
            </button>
          )}
          <div className="flex items-center gap-3 border-t border-white/12 px-3 pt-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--tf-ink-3) text-[13px] font-bold">이</span>
            <div>
              <p className="text-[13.5px] font-semibold">이수진</p>
              <p className="text-[12px] text-white/60">운영 관리자</p>
            </div>
          </div>
        </div>
      </aside>
      </div>

      <main className="flex min-w-0 flex-1 flex-col [&>*]:flex-1">
        {screen === "approvals" && <ApprovalsScreen initialId={q.id} initialReject={q.reject === "1"} />}
        {screen === "members" && <MembersScreen initialId={q.id} initialStatus={q.status} />}
        {screen === "course-config" && <CourseConfigScreen key={fixId ?? "default"} initialId={fixId} initialTest={q.test === "1"} />}
        {screen === "monitoring" && (
          <MonitoringScreen
            onFix={(id) => {
              setFixId(id);
              setScreen("course-config");
            }}
          />
        )}
        {screen === "push" && <PushScreen initialTitle={q.title} initialBody={q.body} />}
      </main>
    </div>
  );
}

/** 관리자 전용 URL(-admin)이 쓰는 엔트리. 앱과 상태를 공유하지 않는 독립 인스턴스 */
export function AdminApp() {
  const params = useSearchParams();
  const q: Record<string, string> = {};
  params?.forEach((v, k) => {
    q[k] = v;
  });
  return (
    <TeeProvider>
      <AdminConsole initialScreen={toAdminScreen(q.screen)} q={q} />
    </TeeProvider>
  );
}

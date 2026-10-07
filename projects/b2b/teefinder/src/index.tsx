"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { MotionConfig } from "motion/react";
import { PhoneFrame } from "@/components/shared/phone-frame";
import "../styles/teefinder.css";
import { DEMO_MEMBER_ID } from "../lib/mock-data";
import { TeeProvider } from "../lib/store";
import { AppShell } from "../components/app/app-shell";
import { AdminConsole, toAdminScreen } from "../components/admin/admin-app";
import { cx } from "../components/ui";

type Surface = "app" | "admin";

function SurfaceSwitch({ value, onChange }: { value: Surface; onChange: (s: Surface) => void }) {
  return (
    <div role="tablist" aria-label="화면 선택" className="teefinder mx-auto mt-4 flex w-fit rounded-full border border-[#D9DDD9] bg-white p-1 lg:absolute lg:left-6 lg:top-6 lg:z-50 lg:m-0">
      {(
        [
          ["app", "회원 앱 보기"],
          ["admin", "관리자 웹 보기"],
        ] as const
      ).map(([k, label]) => (
        <button
          key={k}
          role="tab"
          type="button"
          aria-selected={value === k}
          onClick={() => onChange(k)}
          className={cx("min-h-10 rounded-full px-4 text-[13.5px] font-semibold transition-colors duration-150", value === k ? "bg-(--tf-ink) text-white" : "text-(--tf-sub) hover:bg-(--tf-ink)/6")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// 초기 화면은 ?screen=app-home, admin-members 처럼 받음. 서버와 클라이언트 결과가 같도록 useSearchParams로 읽음
export default function TeeFinder() {
  const params = useSearchParams();
  const q: Record<string, string> = {};
  params?.forEach((v, k) => {
    q[k] = v;
  });
  const screen = q.screen;
  const [surface, setSurface] = useState<Surface>(screen?.startsWith("admin-") ? "admin" : "app");
  const [webview, setWebview] = useState(false);

  const appScreen = screen?.startsWith("app-") ? screen.slice(4) : undefined;
  const memberState = q.member === "pending" || q.member === "rejected" ? q.member : undefined;
  const loggedOut = (screen === undefined || appScreen === "login") && !memberState;

  return (
    <MotionConfig reducedMotion="user">
      <TeeProvider initialSessionId={loggedOut ? null : DEMO_MEMBER_ID} initialMemberStatus={memberState}>
        {surface === "admin" ? (
          <AdminConsole initialScreen={toAdminScreen(screen)} q={q} onSwitch={() => setSurface("app")} />
        ) : (
          <div className="relative bg-white">
            <SurfaceSwitch value={surface} onChange={setSurface} />
            <PhoneFrame
              screenClassName="bg-(--tf-paper) text-(--tf-text)"
              statusBarClassName={webview ? "text-neutral-900" : "text-white"}
              homeIndicatorClassName={webview ? "bg-white/80" : "bg-neutral-900/80"}
            >
              <div className="teefinder h-full">
                <AppShell screen={appScreen} q={q} onWebview={setWebview} />
              </div>
            </PhoneFrame>
          </div>
        )}
      </TeeProvider>
    </MotionConfig>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, Flag, House, Lightning, User } from "@phosphor-icons/react";
import { useTee } from "../../lib/store";
import { INITIAL_INBOX, slotsFor } from "../../lib/mock-data";
import { cx, Toast } from "../ui";
import { AuthScreen, StatusScreen } from "./login";
import { HomeScreen } from "./home";
import { CoursesScreen } from "./courses";
import { CourseDetailScreen } from "./course-detail";
import { WebviewScreen } from "./webview";
import { AlertsScreen } from "./alerts";
import { ProfileScreen } from "./profile";
import type { AlertPrefill, AppNav, Tab } from "./parts";

type View =
  | { kind: "tab" }
  | { kind: "detail"; courseId: string; date?: string; slotId?: string }
  | { kind: "webview"; slotId: string; from: "detail" | "tab" };

const TABS: { key: Tab; label: string; Icon: typeof House }[] = [
  { key: "home", label: "홈", Icon: House },
  { key: "courses", label: "골프장", Icon: Flag },
  { key: "alerts", label: "알림", Icon: Bell },
  { key: "profile", label: "내 정보", Icon: User },
];

function initialView(screen: string | undefined, q: Record<string, string>): { tab: Tab; view: View } {
  if (screen === "course-detail") return { tab: "courses", view: { kind: "detail", courseId: q.course ?? "c01", date: q.date, slotId: q.slot } };
  if (screen === "webview") {
    const courseId = q.course;
    const date = q.date ?? "2026-10-10";
    const slotId = courseId ? (slotsFor(courseId, date).find((s) => s.status === "open")?.id ?? INITIAL_INBOX[0].slotId!) : INITIAL_INBOX[0].slotId!;
    return { tab: "courses", view: { kind: "webview", slotId, from: "detail" } };
  }
  const tab: Tab = screen === "courses" || screen === "alerts" || screen === "profile" ? screen : "home";
  return { tab, view: { kind: "tab" } };
}

export function AppShell({ screen, q, onWebview }: { screen?: string; q: Record<string, string>; onWebview?: (on: boolean) => void }) {
  const { sessionMember: me, inbox, banner, dismissBanner, logout } = useTee();
  const [init] = useState(() => initialView(screen, q));
  const [tab, setTab] = useState<Tab>(init.tab);
  const [view, setView] = useState<View>(init.view);
  const [prefill, setPrefill] = useState<AlertPrefill | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const showToast = useCallback((t: string) => {
    setToast(t);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(dismissBanner, 4500);
    return () => window.clearTimeout(t);
  }, [banner, dismissBanner]);

  const approved = me?.status === "approved";
  const inWebview = approved && view.kind === "webview";
  useEffect(() => {
    onWebview?.(inWebview);
  }, [inWebview, onWebview]);

  const nav: AppNav = {
    setTab: (t) => {
      if (!approved) {
        showToast("승인 후 이용할 수 있어요");
        return;
      }
      setTab(t);
      setView({ kind: "tab" });
    },
    openCourse: (courseId, date, slotId) => setView({ kind: "detail", courseId, date, slotId }),
    openWebview: (slotId) => setView((v) => ({ kind: "webview", slotId, from: v.kind === "detail" ? "detail" : "tab" })),
    addAlertFor: (p) => {
      setPrefill(p);
      setTab("alerts");
      setView({ kind: "tab" });
    },
    toast: showToast,
  };

  const unread = inbox.filter((n) => !n.read).length;

  let body: React.ReactNode;
  let fullscreen = false;

  if (!me) {
    return (
      <div className="relative h-full">
        <AuthScreen q={q} />
      </div>
    );
  }

  if (approved && view.kind === "detail") {
    fullscreen = true;
    body = <CourseDetailScreen nav={nav} courseId={view.courseId} initialDate={view.date} initialSlotId={view.slotId} onBack={() => setView({ kind: "tab" })} />;
  } else if (approved && view.kind === "webview") {
    fullscreen = true;
    const from = view.from;
    const slotId = view.slotId;
    body = (
      <WebviewScreen
        slotId={slotId}
        q={q}
        onClose={() => {
          const [courseId, date] = slotId.split("|");
          setView(from === "detail" ? { kind: "detail", courseId, date, slotId } : { kind: "tab" });
        }}
      />
    );
  } else if (!approved) {
    body = <StatusScreen />;
  } else if (tab === "home") {
    body = <HomeScreen nav={nav} q={q} />;
  } else if (tab === "courses") {
    body = <CoursesScreen nav={nav} q={q} />;
  } else if (tab === "alerts") {
    body = <AlertsScreen nav={nav} q={q} prefill={prefill} onPrefillUsed={() => setPrefill(null)} />;
  } else {
    body = <ProfileScreen nav={nav} q={q} onWithdrawn={logout} />;
  }

  const key = !approved ? "status" : view.kind === "tab" ? tab : view.kind;

  return (
    <div className="relative flex h-full flex-col bg-(--tf-paper)">
      {fullscreen ? (
        <div key={key} className="tf-fade min-h-0 flex-1">
          {body}
        </div>
      ) : (
        <>
          <div key={key} className="tf-fade min-h-0 flex-1 overflow-y-auto [scrollbar-width:none]">
            {body}
          </div>
          <nav aria-label="하단 탭" className="grid shrink-0 grid-cols-4 border-t border-(--tf-line) bg-white pb-7">
            {TABS.map(({ key: k, label, Icon }) => {
              const active = approved && tab === k;
              return (
                <button
                  key={k}
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => nav.setTab(k)}
                  className="relative flex min-h-[56px] flex-col items-center justify-center gap-0.5"
                >
                  {active && <span className="absolute inset-x-5 top-0 h-[3px] rounded-b bg-(--tf-brass)" />}
                  <span className="relative">
                    <Icon size={24} weight={active ? "fill" : "regular"} className={active ? "text-(--tf-ink)" : "text-[#6B7770]"} />
                    {k === "alerts" && unread > 0 && approved && (
                      <span className="tf-num absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-(--tf-danger) px-1 text-[10px] font-bold text-white">{unread}</span>
                    )}
                  </span>
                  <span className={cx("text-[11px]", active ? "font-bold text-(--tf-ink)" : "font-medium text-[#6B7770]")}>{label}</span>
                </button>
              );
            })}
          </nav>
        </>
      )}

      <AnimatePresence>
        {banner && (
          <motion.button
            key={banner.id}
            type="button"
            role="alert"
            onClick={() => {
              const id = banner.slotId;
              dismissBanner();
              if (id && approved) setView({ kind: "webview", slotId: id, from: "tab" });
            }}
            className="absolute inset-x-3 top-[54px] z-[70] flex items-start gap-3 rounded-2xl bg-white p-3.5 text-left shadow-[0_10px_30px_rgba(14,42,34,0.28)]"
            initial={{ y: -90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -90, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--tf-cancel) text-white" aria-hidden>
              <Lightning size={20} weight="fill" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between text-[11.5px] text-(--tf-sub)">
                <span className="font-bold text-(--tf-cancel)">TeeFinder 취소티</span>
                <span>방금 전</span>
              </span>
              <span className="mt-0.5 block text-[14.5px] font-bold text-(--tf-text)">{banner.title}</span>
              <span className="tf-num block text-[13px] text-(--tf-sub)">{banner.body}</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <Toast text={toast} />
    </div>
  );
}


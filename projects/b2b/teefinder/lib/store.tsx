"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type {
  AlertCondition,
  CollectLog,
  ConfigLog,
  Course,
  CourseAccount,
  InboxItem,
  Member,
  PushRecord,
  Region,
  Slot,
  TimeBand,
} from "./types";
import {
  DEMO_MEMBER_ID,
  DEMO_PUSH_SLOTS,
  INITIAL_ACCOUNTS,
  INITIAL_CONDITIONS,
  INITIAL_CONFIG_LOG,
  INITIAL_FAVORITES,
  INITIAL_INBOX,
  INITIAL_LOGS,
  INITIAL_MEMBERS,
  INITIAL_PUSHES,
  COURSES,
  cancelCard,
  courseById,
} from "./mock-data";
import { NOW_LABEL } from "./format";

export interface SignupForm {
  name: string;
  phone: string;
  membershipNo: string;
}

export interface PushBanner {
  id: string;
  title: string;
  body: string;
  slotId?: string;
}

interface TeeState {
  members: Member[];
  courses: Course[];
  sessionId: string | null;
  favorites: string[];
  conditions: AlertCondition[];
  inbox: InboxItem[];
  accounts: CourseAccount[];
  pushes: PushRecord[];
  logs: CollectLog[];
  configLog: ConfigLog[];
  interval: 5 | 2 | 1;
  failN: number;
  banner: PushBanner | null;
  demoPushIdx: number;
}

interface TeeActions {
  sessionMember: Member | null;
  loginDemo: () => void;
  signup: (f: SignupForm) => void;
  reapply: () => void;
  logout: () => void;
  withdraw: () => number;
  demoSetStatus: (s: "approved" | "rejected") => void;
  approve: (id: string) => void;
  reject: (id: string, reason: string) => void;
  suspend: (id: string, reason: string) => void;
  unsuspend: (id: string) => void;
  toggleFavorite: (courseId: string) => void;
  addCondition: (c: Omit<AlertCondition, "id" | "on">) => void;
  toggleCondition: (id: string) => void;
  deleteCondition: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  upsertAccount: (courseId: string, loginId: string) => void;
  deleteAccount: (courseId: string) => void;
  saveCourse: (course: Course, note: string) => void;
  addCourse: (course: Course) => void;
  setIntervalMin: (m: 5 | 2 | 1) => void;
  setFailN: (n: number) => void;
  recipientCount: (target: string) => number;
  sendPush: (target: string, title: string, body: string) => void;
  triggerDemoPush: () => void;
  dismissBanner: () => void;
  demoPushLeft: number;
}

type Ctx = TeeState & TeeActions;
const TeeContext = createContext<Ctx | null>(null);

export function useTee(): Ctx {
  const v = useContext(TeeContext);
  if (!v) throw new Error("TeeProvider 밖에서 useTee를 호출함");
  return v;
}

export function groupTargets(): { label: string; kind: "all" | "region" | "course"; key: string }[] {
  const regions: Region[] = ["서울/경기", "강원", "충청", "경상", "전라", "제주"];
  return [
    { label: "전체 회원", kind: "all", key: "" },
    ...regions.map((r) => ({ label: `${r} 즐겨찾기 회원`, kind: "region" as const, key: r })),
    ...["c01", "c02", "c17"].map((id) => ({
      label: `${courseById(id)?.name ?? id} 즐겨찾기 회원`,
      kind: "course" as const,
      key: id,
    })),
  ];
}

export function TeeProvider({
  children,
  initialSessionId = null,
  initialMemberStatus,
}: {
  children: ReactNode;
  initialSessionId?: string | null;
  /** 캡처용: 로그인한 회원의 초기 상태를 바꿈 */
  initialMemberStatus?: Member["status"];
}) {
  const [s, setS] = useState<TeeState>(() => {
    let members = INITIAL_MEMBERS;
    let sessionId = initialSessionId;
    if (initialMemberStatus === "pending" || initialMemberStatus === "rejected") {
      const applicant: Member = {
        id: "m-new",
        name: "신청자",
        phone: "010-0000-5577",
        membershipNo: "AL-21100",
        membershipName: "A레저 정회원",
        appliedAt: "2026.10.07",
        joinedAt: "",
        status: initialMemberStatus,
        reason: initialMemberStatus === "rejected" ? "회원권 번호가 명부와 일치하지 않음. 확인 후 다시 신청해 주세요." : undefined,
        favRegions: [],
        favCourseIds: [],
      };
      members = [applicant, ...INITIAL_MEMBERS];
      sessionId = "m-new";
    }
    return {
      members,
      courses: COURSES,
      sessionId,
      favorites: INITIAL_FAVORITES,
      conditions: INITIAL_CONDITIONS,
      inbox: INITIAL_INBOX,
      accounts: INITIAL_ACCOUNTS,
      pushes: INITIAL_PUSHES,
      logs: INITIAL_LOGS,
      configLog: INITIAL_CONFIG_LOG,
      interval: 2,
      failN: 3,
      banner: null,
      demoPushIdx: 0,
    };
  });

  const patch = useCallback((p: Partial<TeeState> | ((cur: TeeState) => Partial<TeeState>)) => {
    setS((cur) => ({ ...cur, ...(typeof p === "function" ? p(cur) : p) }));
  }, []);

  const setMember = useCallback(
    (id: string, fn: (m: Member) => Member) => patch((cur) => ({ members: cur.members.map((m) => (m.id === id ? fn(m) : m)) })),
    [patch],
  );

  const recipientCount = useCallback(
    (target: string): number => {
      const active = s.members.filter((m) => m.status === "approved");
      const g = groupTargets().find((t) => t.label === target);
      if (!g || g.kind === "all") return active.length;
      if (g.kind === "region") return active.filter((m) => m.favRegions.includes(g.key as Region)).length;
      return active.filter((m) => m.favCourseIds.includes(g.key)).length;
    },
    [s.members],
  );

  const actions: TeeActions = useMemo(
    () => ({
      sessionMember: s.members.find((m) => m.id === s.sessionId) ?? null,
      loginDemo: () => patch({ sessionId: DEMO_MEMBER_ID }),
      signup: (f) =>
        patch((cur) => {
          const m: Member = {
            id: "m-new",
            name: f.name,
            phone: f.phone,
            membershipNo: f.membershipNo,
            membershipName: "A레저 정회원",
            appliedAt: "2026.10.07",
            joinedAt: "",
            status: "pending",
            favRegions: [],
            favCourseIds: [],
          };
          return { members: [m, ...cur.members.filter((x) => x.id !== "m-new")], sessionId: "m-new" };
        }),
      reapply: () => {
        if (s.sessionId) setMember(s.sessionId, (m) => ({ ...m, status: "pending", reason: undefined, appliedAt: "2026.10.07" }));
      },
      logout: () => patch({ sessionId: null }),
      withdraw: () => {
        const n = s.accounts.length;
        patch({ accounts: [] });
        return n;
      },
      demoSetStatus: (status) => {
        if (!s.sessionId) return;
        setMember(s.sessionId, (m) => ({
          ...m,
          status,
          joinedAt: status === "approved" ? "2026.10.07" : "",
          reason: status === "rejected" ? "회원권 번호가 명부와 일치하지 않음. 확인 후 다시 신청해 주세요." : undefined,
        }));
      },
      approve: (id) => setMember(id, (m) => ({ ...m, status: "approved", joinedAt: "2026.10.07", reason: undefined })),
      reject: (id, reason) => setMember(id, (m) => ({ ...m, status: "rejected", reason })),
      suspend: (id, reason) => setMember(id, (m) => ({ ...m, status: "suspended", reason })),
      unsuspend: (id) => setMember(id, (m) => ({ ...m, status: "approved", reason: undefined })),
      toggleFavorite: (courseId) =>
        patch((cur) => ({
          favorites: cur.favorites.includes(courseId) ? cur.favorites.filter((x) => x !== courseId) : [...cur.favorites, courseId],
        })),
      addCondition: (c) =>
        patch((cur) => ({ conditions: [{ ...c, id: `ac${Date.now()}`, on: true }, ...cur.conditions] })),
      toggleCondition: (id) =>
        patch((cur) => ({ conditions: cur.conditions.map((c) => (c.id === id ? { ...c, on: !c.on } : c)) })),
      deleteCondition: (id) => patch((cur) => ({ conditions: cur.conditions.filter((c) => c.id !== id) })),
      markRead: (id) => patch((cur) => ({ inbox: cur.inbox.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllRead: () => patch((cur) => ({ inbox: cur.inbox.map((n) => ({ ...n, read: true })) })),
      upsertAccount: (courseId, loginId) =>
        patch((cur) => {
          const status = courseById(courseId)?.loginType === "captcha" ? ("captcha" as const) : ("ok" as const);
          const exists = cur.accounts.some((a) => a.courseId === courseId);
          return {
            accounts: exists
              ? cur.accounts.map((a) => (a.courseId === courseId ? { ...a, loginId, status } : a))
              : [...cur.accounts, { courseId, loginId, status }],
          };
        }),
      deleteAccount: (courseId) => patch((cur) => ({ accounts: cur.accounts.filter((a) => a.courseId !== courseId) })),
      saveCourse: (course, note) =>
        patch((cur) => ({
          courses: cur.courses.map((c) => (c.id === course.id ? course : c)),
          configLog: [{ id: `h${Date.now()}`, at: NOW_LABEL, courseId: course.id, text: note }, ...cur.configLog],
        })),
      addCourse: (course) =>
        patch((cur) => ({
          courses: [...cur.courses, course],
          configLog: [{ id: `h${Date.now()}`, at: NOW_LABEL, courseId: course.id, text: "골프장 신규 등록" }, ...cur.configLog],
        })),
      setIntervalMin: (m) => patch({ interval: m }),
      setFailN: (n) => patch({ failN: n }),
      recipientCount,
      sendPush: (target, title, body) =>
        patch((cur) => {
          const count = recipientCount(target);
          const id = `p${Date.now()}`;
          const record: PushRecord = { id, sentAt: NOW_LABEL, target, title, body, count };
          const notice: InboxItem = { id: `n-${id}`, kind: "notice", title, body, at: "방금 전", read: false };
          return { pushes: [record, ...cur.pushes], inbox: [notice, ...cur.inbox] };
        }),
      triggerDemoPush: () =>
        patch((cur) => {
          const slot: Slot | undefined = DEMO_PUSH_SLOTS[cur.demoPushIdx];
          if (!slot) return {};
          const card = cancelCard(slot, "방금 전", false);
          const dup = cur.inbox.some((n) => n.slotId === slot.id);
          return {
            demoPushIdx: cur.demoPushIdx + 1,
            inbox: dup ? cur.inbox : [card, ...cur.inbox],
            banner: { id: `${slot.id}-${cur.demoPushIdx}`, title: card.title, body: card.body, slotId: slot.id },
          };
        }),
      dismissBanner: () => patch({ banner: null }),
      demoPushLeft: DEMO_PUSH_SLOTS.length - s.demoPushIdx,
    }),
    [s.members, s.sessionId, s.accounts.length, s.demoPushIdx, patch, setMember, recipientCount],
  );

  const value: Ctx = { ...s, ...actions };
  return <TeeContext.Provider value={value}>{children}</TeeContext.Provider>;
}

export type { TimeBand };

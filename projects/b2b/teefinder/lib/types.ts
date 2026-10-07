export type Region = "서울/경기" | "강원" | "충청" | "경상" | "전라" | "제주";
export const REGIONS: Region[] = ["서울/경기", "강원", "충청", "경상", "전라", "제주"];

export type MemberStatus = "pending" | "approved" | "rejected" | "suspended";
export type CourseStatus = "ok" | "warn" | "error" | "captcha";
export type SlotStatus = "open" | "closed" | "cancel";
export type AccountStatus = "ok" | "failed" | "captcha";
export type LoginType = "normal" | "captcha";
export type TimeBand = "all" | "dawn" | "am" | "pm";

export interface Member {
  id: string;
  name: string;
  phone: string;
  membershipNo: string;
  membershipName: string;
  appliedAt: string;
  joinedAt: string;
  status: MemberStatus;
  /** 반려 사유 또는 이용 정지 사유 */
  reason?: string;
  favRegions: Region[];
  favCourseIds: string[];
}

export interface Course {
  id: string;
  name: string;
  region: Region;
  area: string;
  layouts: string[];
  status: CourseStatus;
  loginType: LoginType;
  domain: string;
  selId: string;
  selPw: string;
  selBtn: string;
  apiDate: string;
  apiTime: string;
  apiCourse: string;
  apiFee: string;
  bookingUrl: string;
  rate24h: number;
  lastSuccess: string;
  errorNote?: string;
}

export interface Slot {
  id: string;
  courseId: string;
  date: string;
  time: string;
  layout: string;
  fee: number;
  status: SlotStatus;
}

export interface AlertCondition {
  id: string;
  courseId: string;
  date: string;
  band: TimeBand;
  maxFee: number;
  on: boolean;
}

export interface InboxItem {
  id: string;
  kind: "cancel" | "notice";
  title: string;
  body: string;
  at: string;
  read: boolean;
  slotId?: string;
}

export interface CourseAccount {
  courseId: string;
  loginId: string;
  status: AccountStatus;
}

export interface PushRecord {
  id: string;
  sentAt: string;
  target: string;
  title: string;
  body: string;
  count: number;
}

export interface CollectLog {
  id: string;
  at: string;
  courseId: string;
  level: "error" | "warn";
  message: string;
}

export interface ConfigLog {
  id: string;
  at: string;
  courseId: string;
  text: string;
}

export type AppScreen = "login" | "home" | "courses" | "course-detail" | "webview" | "alerts" | "profile";
export type AdminScreen = "approvals" | "members" | "course-config" | "monitoring" | "push";
export const ADMIN_SCREENS: AdminScreen[] = ["approvals", "members", "course-config", "monitoring", "push"];

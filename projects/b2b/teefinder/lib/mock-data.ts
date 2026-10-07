import type {
  AlertCondition,
  CollectLog,
  ConfigLog,
  Course,
  CourseAccount,
  CourseStatus,
  InboxItem,
  LoginType,
  Member,
  PushRecord,
  Region,
  Slot,
} from "./types";
import { addDays, dateRange, isWeekend, TODAY } from "./format";

/* ---------- 골프장 ---------- */

const LAYOUT_SETS = [
  ["레이크", "힐"],
  ["힐", "밸리"],
  ["레이크", "힐", "밸리"],
  ["밸리", "레이크"],
];

function mk(
  n: number,
  name: string,
  slug: string,
  region: Region,
  area: string,
  extra: Partial<Course> = {},
): Course {
  const status: CourseStatus = extra.status ?? "ok";
  const loginType: LoginType = extra.loginType ?? "normal";
  return {
    id: `c${String(n).padStart(2, "0")}`,
    name,
    region,
    area,
    layouts: LAYOUT_SETS[n % LAYOUT_SETS.length],
    status,
    loginType,
    domain: `https://www.${slug}.example`,
    selId: "#userId",
    selPw: "#userPw",
    selBtn: "button.btn-login",
    apiDate: "playDate",
    apiTime: "teeTime",
    apiCourse: "courseCd",
    apiFee: "greenFee",
    bookingUrl: "/reserve/step2?date={date}&time={time}&course={course}",
    rate24h: 98.4,
    lastSuccess: "11:47",
    ...extra,
  };
}

export const COURSES: Course[] = [
  mk(1, "블루힐 CC", "bluehill-cc", "서울/경기", "경기 용인", { rate24h: 99.2 }),
  mk(2, "솔밭 레이크 CC", "solbat-lake", "서울/경기", "경기 이천", { rate24h: 98.7 }),
  mk(3, "은하수 CC", "eunhasu-cc", "서울/경기", "경기 가평", { rate24h: 97.5 }),
  mk(4, "청솔 밸리 CC", "cheongsol-valley", "서울/경기", "경기 여주", { rate24h: 96.1, lastSuccess: "11:45" }),
  mk(5, "한강 뷰 CC", "hangang-view", "서울/경기", "경기 김포", {
    status: "error",
    rate24h: 0,
    lastSuccess: "09:18",
    errorNote: "로그인 선택자 불일치, 홈페이지 개편 의심",
    selId: "#mb_id",
    selPw: "#mb_pw",
  }),
  mk(6, "대관령 하이랜드 CC", "daegwallyeong-highland", "강원", "강원 평창", { rate24h: 97.9 }),
  mk(7, "동해 오션 CC", "donghae-ocean", "강원", "강원 동해", { status: "warn", rate24h: 78.3, lastSuccess: "11:31" }),
  mk(8, "치악 밸리 CC", "chiak-valley", "강원", "강원 원주", {
    status: "error",
    rate24h: 12.5,
    lastSuccess: "07:52",
    errorNote: "티타임 응답 형식 변경, 파싱 실패",
  }),
  mk(9, "금강 레이크 CC", "geumgang-lake", "충청", "충남 공주", { rate24h: 98.9 }),
  mk(10, "계룡 힐스 CC", "gyeryong-hills", "충청", "충남 계룡", {
    status: "captcha",
    loginType: "captcha",
    rate24h: 96.8,
  }),
  mk(11, "충주 호반 CC", "chungju-hoban", "충청", "충북 충주", { rate24h: 95.4 }),
  mk(12, "낙동 리버 CC", "nakdong-river", "경상", "경북 구미", {
    status: "captcha",
    loginType: "captcha",
    rate24h: 95.9,
  }),
  mk(13, "팔공 파인 CC", "palgong-pine", "경상", "대구 동구", { status: "warn", rate24h: 62.0, lastSuccess: "11:12" }),
  mk(14, "남해 선셋 CC", "namhae-sunset", "경상", "경남 남해", {
    status: "captcha",
    loginType: "captcha",
    rate24h: 97.2,
  }),
  mk(15, "무등 밸리 CC", "mudeung-valley", "전라", "전남 담양", { rate24h: 98.1 }),
  mk(16, "지리산 레이크 CC", "jirisan-lake", "전라", "전북 남원", { status: "warn", rate24h: 88.6, lastSuccess: "11:38" }),
  mk(17, "한라 파인 CC", "halla-pine", "제주", "제주 서귀포", { rate24h: 99.0 }),
  mk(18, "섭지 오션 CC", "seopji-ocean", "제주", "제주 제주시", { rate24h: 97.7 }),
];

export const TOTAL_COURSES = 70;

export function courseById(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

/* ---------- 티타임 (결정적 생성, 오늘부터 14일) ---------- */

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 시연용으로 취소티가 반드시 나오는 자리: `코스|날짜` -> 시간 순번 */
const CANCEL_SEEDS: Record<string, number[]> = {
  "c01|2026-10-10": [1, 4],
  "c02|2026-10-14": [2],
  "c17|2026-10-17": [1, 3],
  "c06|2026-10-11": [0],
  "c09|2026-10-12": [1],
};

const cache = new Map<string, Slot[]>();

export function slotsFor(courseId: string, date: string): Slot[] {
  const key = `${courseId}|${date}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const course = courseById(courseId);
  if (!course || course.status === "error") {
    cache.set(key, []);
    return [];
  }
  const h = hash(key);
  const count = 5 + (h % 8);
  const weekend = isWeekend(date);
  const baseFee = weekend ? 200000 + (hash(courseId) % 5) * 10000 : 120000 + (hash(courseId) % 4) * 10000;
  const seeds = CANCEL_SEEDS[key] ?? [];
  const slots: Slot[] = [];
  for (let i = 0; i < count; i++) {
    const total = 360 + Math.floor((i * 540) / count) + ((h >>> (i % 8)) % 7);
    const hh = String(Math.floor(total / 60)).padStart(2, "0");
    const mm = String(total % 60).padStart(2, "0");
    const time = `${hh}:${mm}`;
    const early = total < 540 ? 10000 : 0;
    const roll = hash(`${key}|${i}`) % 100;
    let status: Slot["status"] = roll < 52 ? "open" : "closed";
    if (seeds.includes(i)) status = "cancel";
    else if (status === "open" && roll % 17 === 0) status = "cancel";
    slots.push({
      id: `${courseId}|${date}|${time}`,
      courseId,
      date,
      time,
      layout: course.layouts[(i + (h % 3)) % course.layouts.length],
      fee: baseFee + early + (hash(`${key}|f${i}`) % 3) * 2000,
      status,
    });
  }
  cache.set(key, slots);
  return slots;
}

export function slotById(id: string): Slot | undefined {
  const [courseId, date] = id.split("|");
  return slotsFor(courseId, date).find((s) => s.id === id);
}

export function openCount(courseId: string, date: string): number {
  return slotsFor(courseId, date).filter((s) => s.status !== "closed").length;
}

export const DATES = dateRange(14);

/* ---------- 회원 ---------- */

export const DEMO_MEMBER_ID = "m01";

export const INITIAL_MEMBERS: Member[] = [
  { id: "m01", name: "김회원", phone: "010-0000-1204", membershipNo: "AL-20418", membershipName: "A레저 정회원", appliedAt: "2026.08.21", joinedAt: "2026.08.22", status: "approved", favRegions: ["서울/경기", "제주"], favCourseIds: ["c01", "c02", "c17", "c12"] },
  { id: "m02", name: "이서준", phone: "010-0000-2381", membershipNo: "AL-20977", membershipName: "A레저 정회원", appliedAt: "2026.10.06", joinedAt: "", status: "pending", favRegions: [], favCourseIds: [] },
  { id: "m03", name: "박지우", phone: "010-0000-3315", membershipNo: "BR-11402", membershipName: "B리조트 가족회원", appliedAt: "2026.10.06", joinedAt: "", status: "pending", favRegions: [], favCourseIds: [] },
  { id: "m04", name: "최민재", phone: "010-0000-4872", membershipNo: "AL-21033", membershipName: "A레저 정회원", appliedAt: "2026.10.05", joinedAt: "", status: "pending", favRegions: [], favCourseIds: [] },
  { id: "m05", name: "정하은", phone: "010-0000-5530", membershipNo: "CC-07781", membershipName: "C클럽 주중회원", appliedAt: "2026.10.04", joinedAt: "", status: "pending", favRegions: [], favCourseIds: [] },
  { id: "m06", name: "강도윤", phone: "010-0000-6194", membershipNo: "BR-99999", membershipName: "B리조트 가족회원", appliedAt: "2026.10.01", joinedAt: "", status: "rejected", reason: "회원권 번호가 명부와 일치하지 않음", favRegions: [], favCourseIds: [] },
  { id: "m07", name: "윤서아", phone: "010-0000-7026", membershipNo: "AL-19840", membershipName: "A레저 정회원", appliedAt: "2026.07.14", joinedAt: "2026.07.15", status: "suspended", reason: "회원권 양도 사실 확인 중", favRegions: ["충청"], favCourseIds: ["c09"] },
  { id: "m08", name: "임준호", phone: "010-0000-8143", membershipNo: "AL-18220", membershipName: "A레저 정회원", appliedAt: "2026.06.02", joinedAt: "2026.06.03", status: "approved", favRegions: ["서울/경기"], favCourseIds: ["c01", "c04"] },
  { id: "m09", name: "한지민", phone: "010-0000-9257", membershipNo: "CC-06312", membershipName: "C클럽 정회원", appliedAt: "2026.06.18", joinedAt: "2026.06.18", status: "approved", favRegions: ["강원", "서울/경기"], favCourseIds: ["c06"] },
  { id: "m10", name: "오세훈", phone: "010-0000-1068", membershipNo: "BR-10277", membershipName: "B리조트 정회원", appliedAt: "2026.05.09", joinedAt: "2026.05.10", status: "approved", favRegions: ["경상"], favCourseIds: ["c12", "c13"] },
  { id: "m11", name: "송유진", phone: "010-0000-1189", membershipNo: "AL-17754", membershipName: "A레저 가족회원", appliedAt: "2026.04.27", joinedAt: "2026.04.28", status: "approved", favRegions: ["제주"], favCourseIds: ["c17", "c18"] },
  { id: "m12", name: "배수현", phone: "010-0000-1342", membershipNo: "CC-05590", membershipName: "C클럽 정회원", appliedAt: "2026.03.30", joinedAt: "2026.03.31", status: "approved", favRegions: ["전라", "서울/경기"], favCourseIds: ["c02", "c15"] },
];

/* ---------- 앱 시연 회원 데이터 ---------- */

export const INITIAL_FAVORITES: string[] = ["c01", "c02", "c17", "c12"];

export const INITIAL_CONDITIONS: AlertCondition[] = [
  { id: "ac1", courseId: "c01", date: "2026-10-10", band: "dawn", maxFee: 250000, on: true },
  { id: "ac2", courseId: "c02", date: "2026-10-14", band: "all", maxFee: 160000, on: true },
  { id: "ac3", courseId: "c17", date: "2026-10-17", band: "am", maxFee: 250000, on: false },
];

export const INITIAL_ACCOUNTS: CourseAccount[] = [
  { courseId: "c01", loginId: "kim_member01", status: "ok" },
  { courseId: "c02", loginId: "kim_member01", status: "ok" },
  { courseId: "c17", loginId: "kimhoewon", status: "failed" },
  { courseId: "c12", loginId: "kim_member01", status: "captcha" },
];

function slotAt(courseId: string, date: string, status: "cancel", n = 0): Slot {
  const list = slotsFor(courseId, date).filter((s) => s.status === status);
  return list[n] ?? slotsFor(courseId, date)[0];
}

const SEED_CANCELS = [
  slotAt("c01", "2026-10-10", "cancel", 0),
  slotAt("c02", "2026-10-14", "cancel", 0),
  slotAt("c06", "2026-10-11", "cancel", 0),
];

/** 시연 푸시 버튼이 한 번씩 꺼내 쓰는 취소티. 이미 받은 자리는 다시 오지 않음 */
export const DEMO_PUSH_SLOTS: Slot[] = [
  slotAt("c01", "2026-10-10", "cancel", 1),
  slotAt("c17", "2026-10-17", "cancel", 1),
  slotAt("c09", "2026-10-12", "cancel", 0),
];

export function cancelCard(slot: Slot, at: string, read: boolean): InboxItem {
  const c = courseById(slot.courseId);
  return {
    id: `n-${slot.id}`,
    kind: "cancel",
    title: `${c?.name ?? "골프장"} 취소티`,
    body: `${slot.date.slice(5, 7)}.${slot.date.slice(8, 10)} ${slot.time} ${slot.layout} 코스`,
    at,
    read,
    slotId: slot.id,
  };
}

export const INITIAL_INBOX: InboxItem[] = [
  cancelCard(SEED_CANCELS[0], "방금 전", false),
  cancelCard(SEED_CANCELS[1], "32분 전", false),
  { id: "n-notice-1", kind: "notice", title: "시스템 점검 안내", body: "10월 12일 새벽 02:00~04:00 점검으로 티타임 조회가 잠시 중단됩니다.", at: "어제", read: false },
  cancelCard(SEED_CANCELS[2], "어제", true),
  { id: "n-notice-2", kind: "notice", title: "10월 신규 골프장 추가", body: "10월에 골프장 3곳이 새로 연동되었습니다. 골프장 탭에서 확인해 보세요.", at: "10.03", read: true },
  cancelCard(slotAt("c17", "2026-10-17", "cancel", 0), "10.02", true),
];

/* ---------- 관리자 ---------- */

export const INITIAL_PUSHES: PushRecord[] = [
  { id: "p5", sentAt: "2026.10.03 10:00", target: "전체 회원", title: "10월 신규 골프장 추가", body: "10월에 골프장 3곳이 새로 연동되었습니다. 골프장 탭에서 확인해 보세요.", count: 7 },
  { id: "p4", sentAt: "2026.09.28 18:30", target: "제주 즐겨찾기 회원", title: "제주 10월 티타임 오픈", body: "제주 지역 10월 티타임이 열렸습니다.", count: 2 },
  { id: "p3", sentAt: "2026.09.21 09:10", target: "블루힐 CC 즐겨찾기 회원", title: "블루힐 CC 주말 취소티 다수", body: "이번 주말 블루힐 CC에 취소티가 나왔습니다.", count: 2 },
  { id: "p2", sentAt: "2026.09.12 14:00", target: "전체 회원", title: "추석 연휴 수집 일정 안내", body: "연휴 기간에는 수집 간격이 달라질 수 있습니다.", count: 6 },
  { id: "p1", sentAt: "2026.09.01 10:00", target: "전체 회원", title: "TeeFinder 오픈 안내", body: "회원 전용 골프장 빈 티타임 통합 서비스가 시작되었습니다.", count: 5 },
];

export const INITIAL_LOGS: CollectLog[] = [
  { id: "l1", at: "11:47", courseId: "c05", level: "error", message: "로그인 선택자 불일치, 홈페이지 개편 의심" },
  { id: "l2", at: "11:45", courseId: "c08", level: "error", message: "티타임 응답 형식 변경, 파싱 실패" },
  { id: "l3", at: "11:40", courseId: "c13", level: "warn", message: "응답 지연 8.2초, 재시도 2회" },
  { id: "l4", at: "11:32", courseId: "c07", level: "warn", message: "프록시 연결 끊김, 다른 프록시로 전환" },
  { id: "l5", at: "11:20", courseId: "c05", level: "error", message: "로그인 선택자 불일치, 홈페이지 개편 의심" },
  { id: "l6", at: "11:15", courseId: "c16", level: "warn", message: "일부 날짜 요금 필드 누락" },
  { id: "l7", at: "10:58", courseId: "c08", level: "error", message: "티타임 응답 형식 변경, 파싱 실패" },
  { id: "l8", at: "10:44", courseId: "c13", level: "warn", message: "응답 지연 6.9초, 재시도 1회" },
  { id: "l9", at: "10:12", courseId: "c07", level: "warn", message: "예약 페이지 URL 패턴 불일치 의심" },
  { id: "l10", at: "09:18", courseId: "c05", level: "error", message: "로그인 선택자 불일치, 홈페이지 개편 의심" },
];

export const INITIAL_CONFIG_LOG: ConfigLog[] = [
  { id: "h1", at: "2026.10.05 16:20", courseId: "c01", text: "티타임 API 요금 파라미터 변경 (fee -> greenFee)" },
  { id: "h2", at: "2026.10.02 11:05", courseId: "c07", text: "로그인 버튼 선택자 수정" },
  { id: "h3", at: "2026.09.29 09:40", courseId: "c10", text: "로그인 방식을 보안문자로 변경" },
];

export const INTERVAL_COST: { minutes: 5 | 2 | 1; cost: number }[] = [
  { minutes: 5, cost: 380000 },
  { minutes: 2, cost: 820000 },
  { minutes: 1, cost: 1540000 },
];

export const PROXY = { rate: 97.4, active: 38, total: 39 };

export { addDays, TODAY };

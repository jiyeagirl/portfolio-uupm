const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

/** 목업의 오늘. 서버와 클라이언트 결과가 같도록 고정함 */
export const TODAY = "2026-10-07";
export const NOW_LABEL = "2026.10.07 11:50";

function parse(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(iso: string, n: number): string {
  const d = parse(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function weekdayIdx(iso: string): number {
  return parse(iso).getUTCDay();
}

export function isWeekend(iso: string): boolean {
  const w = weekdayIdx(iso);
  return w === 0 || w === 6;
}

export function weekdayName(iso: string): string {
  return WEEK[weekdayIdx(iso)];
}

/** 10.10 (토) */
export function fmtDate(iso: string): string {
  return `${iso.slice(5, 7)}.${iso.slice(8, 10)} (${weekdayName(iso)})`;
}

export function dayNum(iso: string): number {
  return Number(iso.slice(8, 10));
}

export function dateRange(count = 14): string[] {
  return Array.from({ length: count }, (_, i) => addDays(TODAY, i));
}

export function fmtNum(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function fmtWon(n: number): string {
  return `${fmtNum(n)}원`;
}

export function fmtPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function maskPw(len = 8): string {
  return "*".repeat(len);
}

export const BAND_LABEL: Record<"all" | "dawn" | "am" | "pm", string> = {
  all: "전체 시간",
  dawn: "새벽 06:00~08:00",
  am: "오전 08:00~12:00",
  pm: "오후 12:00~15:00",
};

export function inBand(time: string, band: "all" | "dawn" | "am" | "pm"): boolean {
  if (band === "all") return true;
  const h = Number(time.slice(0, 2)) + Number(time.slice(3)) / 60;
  if (band === "dawn") return h < 8;
  if (band === "am") return h >= 8 && h < 12;
  return h >= 12;
}

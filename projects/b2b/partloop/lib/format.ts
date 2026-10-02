import type { LineItem } from "./types";

export const TODAY = "2026-09-24";
export const NOW = "2026-09-24 14:30";

export const won = (n: number) => `₩${Math.round(n).toLocaleString("ko-KR")}`;
export const num = (n: number) => Math.round(n).toLocaleString("ko-KR");

export const subtotal = (items: LineItem[]) => items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
export const vat = (n: number) => Math.round(n * 0.1);

export function dayDiff(date: string, from = TODAY) {
  const a = new Date(`${date}T00:00:00`).getTime();
  const b = new Date(`${from}T00:00:00`).getTime();
  return Math.round((a - b) / 86400000);
}

export function shortDate(date: string) {
  const [, m, d] = date.split("-");
  return `${Number(m)}월 ${Number(d)}일`;
}

export function dateWithDay(date: string) {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const d = new Date(`${date}T00:00:00`);
  return `${date.replaceAll("-", ".")} (${days[d.getDay()]})`;
}

export function itemSummary(items: LineItem[]) {
  if (items.length === 0) return "품목 없음";
  return items.length === 1 ? items[0].name : `${items[0].name} 외 ${items.length - 1}건`;
}

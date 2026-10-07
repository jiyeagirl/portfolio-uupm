export function ago(minutes: number) {
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}시간 전`;
  return `${Math.floor(minutes / (60 * 24))}일 전`;
}

export const num = (n: number) => n.toLocaleString("ko-KR");

export function excerpt(body: string, max = 70) {
  const one = body.replace(/\s+/g, " ").trim();
  return one.length > max ? `${one.slice(0, max).trimEnd()}...` : one;
}

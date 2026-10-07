import type { ComponentProps, ReactNode } from "react";
import { CheckCircle, Lightbulb, Question, SealCheck, ShieldCheck, WarningCircle } from "@phosphor-icons/react";
import type { PostKind } from "../lib/types";

type Tone = { fg: string; bg: string; Icon: typeof Question; label: string };

export const LABEL: Record<"solved" | "question" | "info" | "adopted" | "alert", Tone> = {
  solved: { fg: "#065F46", bg: "#D1FAE5", Icon: CheckCircle, label: "해결됨" },
  question: { fg: "#0C5A82", bg: "#E0F0F9", Icon: Question, label: "질문" },
  info: { fg: "#5a4f44", bg: "#F1EADB", Icon: Lightbulb, label: "정보 공유" },
  adopted: { fg: "#065F46", bg: "#D1FAE5", Icon: SealCheck, label: "작성자가 채택한 답변" },
  alert: { fg: "#9A3412", bg: "#FFEDD5", Icon: WarningCircle, label: "안전 알림" },
};

export function Tag({ tone }: { tone: keyof typeof LABEL }) {
  const t = LABEL[tone];
  return (
    <span className="inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-md px-2 text-[12.5px] font-semibold" style={{ color: t.fg, backgroundColor: t.bg }}>
      <t.Icon size={14} weight={tone === "solved" || tone === "adopted" ? "fill" : "bold"} aria-hidden />
      {t.label}
    </span>
  );
}

export const kindTone = (k: PostKind) => (k === "question" ? "question" : "info") as "question" | "info";

export function TopicChip({ children }: { children: ReactNode }) {
  return <span className="inline-flex h-6 items-center rounded-md bg-(--hz-muted) px-2 text-[12.5px] font-medium text-(--hz-ink-3)">{children}</span>;
}

// 닉네임과 동네 인증 표시. 동네 인증은 ShieldCheck + 동네명
export function Author({ nickname, dong, anonymous }: { nickname: string; dong: string; anonymous?: boolean }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 text-[13.5px] text-(--hz-ink-3)">
      <span className="font-semibold text-(--hz-ink-2)">{anonymous ? "익명" : nickname}</span>
      <span className="inline-flex items-center gap-0.5">
        <ShieldCheck size={14} weight="fill" aria-hidden className="text-(--hz-primary)" />
        {dong}
      </span>
    </span>
  );
}

// 지붕 선이 모자처럼 얹힌 'ㅎ' 마크
export function HonzipMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden className={className}>
      <path d="M5 11.5 14 4l9 7.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 15.5h12" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="14" cy="21" r="3.3" stroke="currentColor" strokeWidth="2.6" />
    </svg>
  );
}

// 창문 격자 모티프. 불 켜진 창(주황)은 답해 주는 이웃, 꺼진 창은 아직 조용한 집을 뜻함
export function WindowGrid({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden className={className}>
      <rect x="8" y="8" width="104" height="104" rx="14" stroke="currentColor" strokeWidth="5" />
      <path d="M60 8v104M8 60h104" stroke="currentColor" strokeWidth="5" />
      <rect x="20" y="20" width="28" height="28" rx="4" fill="currentColor" opacity=".35" />
    </svg>
  );
}

// 홈 배너용 건물 일러스트. 창마다 불이 켜진 집(주황)과 꺼진 집(연한 면)이 섞이고 일부 창에는 말풍선이 걸림
export function Facade({ className = "" }: { className?: string }) {
  const cols = [0, 1, 2];
  const rows = [0, 1, 2];
  const lit = new Set(["0-0", "1-1", "2-0", "1-2", "0-2"]);
  const talk = new Set(["1-1", "2-0"]);
  return (
    <svg viewBox="0 0 300 260" fill="none" aria-hidden className={className}>
      <path d="M18 74 150 12l132 62" stroke="#FFF8E8" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="34" y="74" width="232" height="168" rx="6" fill="#065F46" />
      <rect x="34" y="74" width="232" height="168" rx="6" stroke="#FFF8E8" strokeWidth="6" />
      {rows.map((r) =>
        cols.map((c) => {
          const k = `${c}-${r}`;
          const on = lit.has(k);
          const x = 54 + c * 72;
          const y = 92 + r * 46;
          return (
            <g key={k}>
              <rect x={x} y={y} width="56" height="34" rx="5" fill={on ? "#FDBA74" : "#0B7A5A"} stroke="#FFF8E8" strokeWidth="3" />
              <path d={`M${x + 28} ${y}v34M${x} ${y + 17}h56`} stroke="#FFF8E8" strokeWidth="2.4" opacity={on ? 0.9 : 0.5} />
              {talk.has(k) && (
                <g>
                  <rect x={x + 30} y={y - 16} width="30" height="20" rx="8" fill="#FFF8E8" />
                  <path d={`M${x + 38} ${y + 3}l-4 8 11-6z`} fill="#FFF8E8" />
                  <circle cx={x + 38} cy={y - 6} r="2" fill="#C2410C" />
                  <circle cx={x + 45} cy={y - 6} r="2" fill="#C2410C" />
                  <circle cx={x + 52} cy={y - 6} r="2" fill="#C2410C" />
                </g>
              )}
            </g>
          );
        }),
      )}
      <rect x="132" y="206" width="36" height="36" rx="4" fill="#FFF8E8" />
      <circle cx="160" cy="226" r="2.5" fill="#065F46" />
    </svg>
  );
}

// 사진이 없는 자리는 불 켜진 창 하나가 있는 따뜻한 타일로 둠 (사진 요청 목록에 기록)
export function PhotoTile({ className = "" }: { className?: string }) {
  return (
    <div role="img" aria-label="첨부 사진 자리" className={`flex items-center justify-center bg-(--hz-muted) ${className}`}>
      <svg viewBox="0 0 120 120" fill="none" aria-hidden className="h-1/2 max-h-20 w-1/2 max-w-20">
        <rect x="14" y="14" width="92" height="92" rx="12" stroke="#cfc3ab" strokeWidth="5" />
        <path d="M60 14v92M14 60h92" stroke="#cfc3ab" strokeWidth="5" />
        <rect x="24" y="24" width="26" height="26" rx="4" fill="#FDBA74" />
      </svg>
    </div>
  );
}

type BtnProps = ComponentProps<"button"> & { variant?: "cta" | "primary" | "secondary" | "ghost"; icon?: ReactNode };

export function Button({ variant = "secondary", icon, className = "", children, ...rest }: BtnProps) {
  const base =
    "inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-4 text-[15px] font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45";
  const v = {
    cta: "bg-(--hz-accent) text-white hover:bg-(--hz-accent-hover) disabled:bg-(--hz-line) disabled:text-(--hz-ink-3) disabled:opacity-100",
    primary: "bg-(--hz-primary) text-white hover:bg-(--hz-primary-hover) disabled:bg-(--hz-line) disabled:text-(--hz-ink-3) disabled:opacity-100",
    secondary: "border border-(--hz-line-strong) bg-(--hz-surface) text-(--hz-ink) hover:bg-(--hz-muted)",
    ghost: "text-(--hz-ink-3) hover:bg-(--hz-muted) hover:text-(--hz-ink)",
  }[variant];
  return (
    <button type="button" className={`${base} ${v} ${className}`} {...rest}>
      {icon}
      {children}
    </button>
  );
}

export const inputCls =
  "w-full rounded-lg border border-(--hz-line-strong) bg-(--hz-surface) px-3.5 text-[15px] text-(--hz-ink) placeholder:text-(--hz-ink-4) transition-colors duration-150 hover:border-(--hz-ink-4) focus:border-(--hz-primary) focus:outline-none focus:ring-3 focus:ring-(--hz-primary)/15";

export function Field({ label, required, hint, children, htmlFor }: { label: string; required?: boolean; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-[14px] font-semibold text-(--hz-ink-2)">
        {label}
        {required && <span className="ml-1.5 text-[12.5px] font-normal text-(--hz-danger)">필수</span>}
      </label>
      {children}
      {hint && <p className="text-[13px] text-(--hz-ink-4)">{hint}</p>}
    </div>
  );
}

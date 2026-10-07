import { useMemo, useState } from "react";
import { CaretDown, ChatCircle, ThumbsUp, WarningCircle } from "@phosphor-icons/react";
import type { Post, Topic } from "../../lib/types";
import { ALERTS, TOPICS } from "../../lib/mock-data";
import { ago, excerpt, num } from "../../lib/format";
import { Author, Button, PhotoTile, Tag, TopicChip, WindowGrid, kindTone } from "../ui";

function AlertList() {
  return (
    <ul className="divide-y divide-(--hz-line)">
      {ALERTS.map((a) => (
        <li key={a.id} className="py-3 first:pt-0 last:pb-0">
          <p className="flex items-start gap-1.5 text-[14.5px] font-medium leading-[22px] text-[#9A3412]"><WarningCircle size={16} weight="fill" aria-hidden className="mt-[3px] shrink-0" /><span className="text-(--hz-ink)">{a.text}</span></p>
          <p className="mt-0.5 pl-[22px] text-[13px] text-(--hz-ink-4)">{ago(a.minutesAgo)}</p>
        </li>
      ))}
    </ul>
  );
}

function Popular({ posts, onOpen }: { posts: Post[]; onOpen: (id: string) => void }) {
  const top = [...posts].sort((a, b) => b.views - a.views).slice(0, 3);
  return (
    <section aria-labelledby="popular">
      <h2 id="popular" className="mb-2 text-[17px] font-bold">이번 주 많이 본 글</h2>
      <ol className="grid border-t-2 border-(--hz-ink) md:grid-cols-[1.35fr_1fr_1fr] md:gap-4">
        {top.map((p, i) => (
          <li key={p.id} className={i === 0 ? "my-2 rounded-xl bg-(--hz-primary-soft)" : "border-b border-(--hz-line) md:border-b-0"}>
            <button type="button" onClick={() => onOpen(p.id)} className={`flex w-full cursor-pointer items-start gap-3 text-left md:py-4 ${i === 0 ? "px-4 py-4" : "py-3"}`}>
              <span className={`num shrink-0 font-semibold text-(--hz-primary) ${i === 0 ? "w-9 text-[40px] leading-[40px]" : "w-7 text-[26px] leading-8"}`}>{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className={`line-clamp-2 block font-bold hover:underline ${i === 0 ? "text-[19px] leading-[28px]" : "text-[16px] leading-[24px]"}`}>{p.title}</span>
                <span className="mt-1 flex items-center gap-2 text-[13px] text-(--hz-ink-4)">
                  {p.topic}
                  <span>조회 {num(p.views)}</span>
                  <span className="inline-flex items-center gap-1"><ThumbsUp size={13} aria-hidden />공감 {num(p.likes)}</span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Row({ post, onOpen }: { post: Post; onOpen: (id: string) => void }) {
  const solved = !!post.adoptedCommentId;
  return (
    <li className="border-t border-(--hz-line) first:border-t-0">
      <button type="button" onClick={() => onOpen(post.id)} className="flex w-full cursor-pointer gap-4 px-4 py-4 text-left transition-colors hover:bg-(--hz-canvas) md:px-5 md:py-5">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <TopicChip>{post.topic}</TopicChip>
            <Tag tone={solved ? "solved" : kindTone(post.kind)} />
          </div>
          <h3 className="text-[18px] font-extrabold leading-[26px]">{post.title}</h3>
          <p className="mt-1 line-clamp-2 text-[14px] leading-[22px] text-(--hz-ink-3)">{excerpt(post.body, 90)}</p>
          <div className="mt-2.5 flex flex-col gap-1 text-[13px] text-(--hz-ink-4) md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-x-3">
              <Author nickname={post.nickname} dong={post.dong} />
              <span>{ago(post.minutesAgo)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1"><ThumbsUp size={14} aria-hidden />공감 {num(post.likes)}</span>
              <span className="inline-flex items-center gap-1"><ChatCircle size={14} aria-hidden />댓글 {num(post.comments.length)}</span>
            </div>
          </div>
        </div>
        {post.photos === 0 && <div aria-hidden className="hidden w-24 shrink-0 md:block" />}
        {post.photos > 0 && (
          <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg md:h-24 md:w-24">
            <PhotoTile className="h-full w-full" />
            {post.photos > 1 && <span className="num absolute bottom-1 right-1 rounded bg-[#1f2a24] px-1.5 text-[12px] font-semibold text-white">+{post.photos - 1}</span>}
          </div>
        )}
      </button>
    </li>
  );
}

export function HomeScreen({ posts, query, dong, onOpen, onWrite, onClearQuery }: { posts: Post[]; query: string; dong: string; onOpen: (id: string) => void; onWrite: () => void; onClearQuery: () => void }) {
  const [topic, setTopic] = useState<Topic | "전체">("전체");
  const needle = query.trim().toLowerCase();
  const list = useMemo(
    () => posts.filter((p) => (topic === "전체" || p.topic === topic) && (!needle || p.title.toLowerCase().includes(needle) || p.body.toLowerCase().includes(needle))),
    [posts, topic, needle],
  );
  const tabs: (Topic | "전체")[] = ["전체", ...TOPICS];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
      <div className="min-w-0">
        <section aria-label="혼집 소개" className="relative mb-5 overflow-hidden rounded-2xl bg-(--hz-primary) px-5 py-5 text-white md:mb-8 md:px-8 md:py-9">
          <WindowGrid className="pointer-events-none absolute -right-4 -top-6 h-40 w-40 text-white/15 md:-right-2 md:-top-8 md:h-64 md:w-64" />
          <WindowGrid className="pointer-events-none absolute bottom-[-28px] right-24 hidden h-24 w-24 text-white/10 md:block" />
          <p className="text-[14px] font-semibold text-white/85">혼자 살아도 같은 동네엔 답이 있어요</p>
          <h1 className="mt-2 max-w-[560px] text-[26px] font-extrabold leading-[34px] tracking-[-0.02em] md:text-[40px] md:leading-[52px]">{dong} 이웃에게<br />물어보세요</h1>
        </section>

        <Popular posts={posts} onOpen={onOpen} />


        <details className="group mt-6 rounded-xl border border-(--hz-line) bg-(--hz-surface) lg:hidden">
          <summary className="flex h-12 cursor-pointer list-none items-center justify-between px-4 text-[15px] font-bold [&::-webkit-details-marker]:hidden">
            우리 동네 안전 알림
            <CaretDown size={16} weight="bold" aria-hidden className="transition-transform group-open:rotate-180" />
          </summary>
          <div className="border-t border-(--hz-line) p-4"><AlertList /></div>
        </details>

        <div className="relative -mx-4 mt-3 md:mx-0">
        <div role="tablist" aria-label="주제" className="no-scrollbar flex gap-1 overflow-x-auto border-b border-(--hz-line) px-4 md:px-0">
          {tabs.map((t) => {
            const on = t === topic;
            return (
              <button
                key={t}
                role="tab"
                aria-selected={on}
                onClick={() => setTopic(t)}
                className={`-mb-px h-11 shrink-0 cursor-pointer border-b-2 px-3 text-[15px] font-semibold transition-colors ${on ? "border-(--hz-primary) text-(--hz-primary-hover)" : "border-transparent text-(--hz-ink-4) hover:text-(--hz-ink)"}`}
              >
                {t}
              </button>
            );
          })}
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-(--hz-canvas) to-transparent md:hidden" />
        </div>

        <section aria-label="최신 글" className="mt-4 overflow-hidden rounded-xl border border-(--hz-line) bg-(--hz-surface)">
          {list.length > 0 ? (
            <ul>{list.map((p) => <Row key={p.id} post={p} onOpen={onOpen} />)}</ul>
          ) : (
            <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <WindowGrid className="h-16 w-16 text-(--hz-primary)/40" />
              <p className="text-[16px] font-bold">{needle ? `"${query.trim()}"에 대한 글이 없어요` : "이 주제에 아직 글이 없어요"}</p>
              <p className="text-[14px] text-(--hz-ink-4)">검색어를 바꾸거나 첫 글을 남겨 보세요.</p>
              <div className="flex gap-2">
                {needle && <Button onClick={onClearQuery}>검색어 지우기</Button>}
                <Button variant="cta" onClick={onWrite}>글쓰기</Button>
              </div>
            </div>
          )}
        </section>

      </div>

      <aside aria-label="우리 동네 안전 알림" className="hidden lg:block">
        <div className="sticky top-24 rounded-xl border border-(--hz-line) bg-(--hz-surface) p-5">
          <h2 className="mb-3 text-[16px] font-bold">우리 동네 안전 알림</h2>
          <AlertList />
        </div>
      </aside>

    </div>
  );
}

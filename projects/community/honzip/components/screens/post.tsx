import { useState } from "react";
import { ArrowLeft, BookmarkSimple, ThumbsUp } from "@phosphor-icons/react";
import type { Comment, Post } from "../../lib/types";
import { ago, num } from "../../lib/format";
import { Author, Button, PhotoTile, Tag, TopicChip, inputCls, kindTone } from "../ui";

function CommentItem({ c, adopted }: { c: Comment; adopted?: boolean }) {
  return (
    <li className={adopted ? "rounded-xl border border-[#A7F3D0] bg-[#F0FBF5] p-4" : "border-t border-(--hz-line) py-4 first:border-t-0"}>
      {adopted && <div className="mb-2"><Tag tone="adopted" /></div>}
      <div className="flex flex-wrap items-center gap-x-2.5">
        <Author nickname={c.nickname} dong={c.dong} />
        <span className="text-[13px] text-(--hz-ink-4)">{ago(c.minutesAgo)}</span>
      </div>
      <p className="mt-1.5 text-[15px] leading-[25px]">{c.body}</p>
    </li>
  );
}

export function PostScreen({
  post, related, liked, saved, onLike, onSave, onComment, onBack, onOpen,
}: {
  post: Post;
  related: Post[];
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onSave: () => void;
  onComment: (text: string) => void;
  onBack: () => void;
  onOpen: (id: string) => void;
}) {
  const [text, setText] = useState("");
  const adopted = post.comments.find((c) => c.id === post.adoptedCommentId);
  const rest = post.comments.filter((c) => c.id !== post.adoptedCommentId);
  const cols = post.photos === 1 ? "grid-cols-1" : post.photos === 2 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div>
    <button type="button" onClick={onBack} className="mb-4 -ml-1 inline-flex h-10 cursor-pointer items-center gap-1 rounded-lg px-1 text-[14px] font-semibold text-(--hz-ink-3) transition-colors hover:text-(--hz-ink)">
      <ArrowLeft size={16} weight="bold" aria-hidden />
      목록으로
    </button>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
      <div className="min-w-0">
        <article className="rounded-xl border border-(--hz-line) bg-(--hz-surface) p-5 md:p-7">
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <TopicChip>{post.topic}</TopicChip>
            <Tag tone={kindTone(post.kind)} />
            {post.adoptedCommentId && <Tag tone="solved" />}
          </div>
          <h1 className="text-[22px] font-bold leading-[32px] md:text-[26px] md:leading-[36px]">{post.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            <Author nickname={post.nickname} dong={post.dong} anonymous={post.nickname === "익명"} />
            <span className="text-[13.5px] text-(--hz-ink-4)">{ago(post.minutesAgo)}</span>
          </div>

          <p className="mt-6 whitespace-pre-line text-[16px] leading-[28px]">{post.body}</p>

          {post.photos > 0 && (
            <div className={`mt-6 grid gap-2 ${cols}`}>
              {Array.from({ length: post.photos }).map((_, i) => <PhotoTile key={i} className="aspect-[4/3] w-full rounded-lg" />)}
            </div>
          )}

          <div className="mt-7 flex items-center gap-2 border-t border-(--hz-line) pt-5">
            <button
              type="button"
              aria-pressed={liked}
              onClick={onLike}
              className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border px-4 text-[15px] font-semibold transition-colors ${liked ? "border-(--hz-primary) bg-(--hz-primary-soft) text-(--hz-primary-hover)" : "border-(--hz-line-strong) bg-(--hz-surface) hover:bg-(--hz-muted)"}`}
            >
              <ThumbsUp size={18} weight={liked ? "fill" : "regular"} aria-hidden />
              공감 <span className="num">{num(post.likes)}</span>
            </button>
            <span role="status" aria-atomic="true" className="sr-only">공감 {post.likes}개{liked ? ", 내가 공감함" : ""}</span>
            <button
              type="button"
              aria-pressed={saved}
              onClick={onSave}
              className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border px-4 text-[15px] font-semibold transition-colors ${saved ? "border-(--hz-ink) bg-(--hz-ink) text-white" : "border-(--hz-line-strong) bg-(--hz-surface) hover:bg-(--hz-muted)"}`}
            >
              <BookmarkSimple size={18} weight={saved ? "fill" : "regular"} aria-hidden />
              {saved ? "저장됨" : "저장"}
            </button>
          </div>

        <section aria-labelledby="comments" className="mt-7 border-t border-(--hz-line) pt-6">
          <h2 id="comments" className="mb-3 text-[17px] font-bold">댓글 <span className="num text-(--hz-primary)">{post.comments.length}</span></h2>
          {adopted && <ul className="mb-2"><CommentItem c={adopted} adopted /></ul>}
          {rest.length > 0 && <ul>{rest.map((c) => <CommentItem key={c.id} c={c} />)}</ul>}
          {post.comments.length === 0 && <p className="py-4 text-[14.5px] text-(--hz-ink-4)">아직 댓글이 없어요. 아는 만큼 먼저 답해 주세요.</p>}

          <form
            className="mt-4 flex flex-col gap-2 border-t border-(--hz-line) pt-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim()) return;
              onComment(text.trim());
              setText("");
            }}
          >
            <label htmlFor="comment" className="text-[14px] font-semibold text-(--hz-ink-2)">댓글 쓰기</label>
            <textarea id="comment" value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="이웃에게 도움이 되는 답을 남겨 주세요" className={`${inputCls} resize-none py-3 leading-[24px]`} />
            <div className="flex justify-end">
              <Button variant="primary" disabled={!text.trim()} onClick={() => { if (text.trim()) { onComment(text.trim()); setText(""); } }}>댓글 등록</Button>
            </div>
          </form>
        </section>
        </article>
      </div>

      <aside aria-label="함께 읽어 보세요">
        <div className="rounded-xl border border-(--hz-line) bg-(--hz-surface) p-5 lg:sticky lg:top-24">
          <h2 className="mb-1 text-[16px] font-bold">{related.every((p) => p.topic === post.topic) ? "같은 주제의 다른 글" : "함께 읽어 보세요"}</h2>
          <ul>
            {related.map((p) => (
              <li key={p.id} className="border-t border-(--hz-line) first:border-t-0">
                <button type="button" onClick={() => onOpen(p.id)} className="w-full cursor-pointer py-3 text-left">
                  <span className="block text-[15px] font-semibold leading-[22px] hover:underline">{p.title}</span>
                  <span className="mt-0.5 flex items-center gap-2 text-[13px] text-(--hz-ink-4)">
                    {p.topic}
                    <span className="inline-flex items-center gap-1"><ThumbsUp size={13} aria-hidden />공감 {num(p.likes)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { CheckCircle } from "@phosphor-icons/react";
import { ResponsiveSite } from "@/components/shared/responsive-site";
import "../styles/honzip.css";
import type { Post, Screen } from "../lib/types";
import { INITIAL_POSTS, ME } from "../lib/mock-data";
import { Shell } from "../components/shell";
import { HomeScreen } from "../components/screens/home";
import { PostScreen } from "../components/screens/post";
import { EMPTY_DRAFT, FILLED_DRAFT, WriteScreen, type Draft } from "../components/screens/write";

const SCREENS: Screen[] = ["home", "post", "write"];

// 초기 화면은 ?screen=, ?id=, ?draft=에서 읽음 (시각 검증 캡처용). useSearchParams라 서버와 클라이언트 결과가 같음
function initial(p: URLSearchParams | null): { screen: Screen; id: string; draft: Draft } {
  const s = p?.get("screen") as Screen | null;
  return { screen: s && SCREENS.includes(s) ? s : "home", id: p?.get("id") ?? "p1", draft: p?.get("draft") === "filled" ? FILLED_DRAFT : EMPTY_DRAFT };
}

export default function Honzip() {
  const params = useSearchParams();
  const [init] = useState(() => initial(params));
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [screen, setScreen] = useState<Screen>(init.screen);
  const [openId, setOpenId] = useState(init.id);
  const [dong, setDong] = useState(ME.dong);
  const [query, setQuery] = useState("");
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  const go = (s: Screen) => {
    setScreen(s);
    window.scrollTo({ top: 0 });
  };
  const notify = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast((t) => (t === text ? null : t)), 3200);
  };
  const toggle = (set: Set<string>, id: string) => {
    const next = new Set(set);
    if (!next.delete(id)) next.add(id);
    return next;
  };

  const like = (id: string) => {
    const was = liked.has(id);
    setLiked((s) => toggle(s, id));
    setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, likes: p.likes + (was ? -1 : 1) } : p)));
  };
  const save = (id: string) => {
    notify(saved.has(id) ? "저장을 취소했어요" : "저장했어요");
    setSaved((s) => toggle(s, id));
  };
  const comment = (id: string, body: string) => {
    setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, comments: [...p.comments, { id: `${id}c${p.comments.length + 1}-new`, nickname: ME.nickname, dong, minutesAgo: 0, body }] } : p)));
  };
  const submit = (d: Draft) => {
    if (!d.topic) return;
    const post: Post = {
      id: `p${posts.length + 1}`, topic: d.topic, kind: d.kind, title: d.title.trim(), body: d.body.trim(),
      nickname: d.anonymous ? "익명" : ME.nickname, dong, minutesAgo: 0, likes: 0, views: 0, photos: d.photos, comments: [],
    };
    setPosts((ps) => [post, ...ps]);
    setQuery("");
    notify("글을 등록했어요");
    go("home");
  };

  const current = posts.find((p) => p.id === openId) ?? posts[0];
  const related = [
    ...posts.filter((p) => p.id !== current.id && p.topic === current.topic),
    ...posts.filter((p) => p.id !== current.id && p.topic !== current.topic).sort((a, b) => b.views - a.views),
  ].slice(0, 4);

  return (
    <ResponsiveSite screenClassName="bg-[#F6F7F3] text-neutral-900">
      <MotionConfig reducedMotion="user">
        <div className="honzip">
          <Shell screen={screen} onNavigate={go} dong={dong} onDong={setDong} query={query} onQuery={setQuery}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={screen === "post" ? `p-${current.id}` : screen} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                {screen === "home" && (
                  <HomeScreen
                    posts={posts}
                    query={query}
                    dong={dong}
                    onClearQuery={() => setQuery("")}
                    onWrite={() => go("write")}
                    onOpen={(id) => {
                      setOpenId(id);
                      go("post");
                    }}
                  />
                )}
                {screen === "post" && (
                  <PostScreen
                    post={current}
                    related={related}
                    liked={liked.has(current.id)}
                    saved={saved.has(current.id)}
                    onLike={() => like(current.id)}
                    onSave={() => save(current.id)}
                    onComment={(t) => comment(current.id, t)}
                    onBack={() => go("home")}
                    onOpen={(id) => {
                      setOpenId(id);
                      window.scrollTo({ top: 0 });
                    }}
                  />
                )}
                {screen === "write" && <WriteScreen initial={init.draft} dong={dong} onSubmit={submit} onCancel={() => go("home")} />}
              </motion.div>
            </AnimatePresence>
          </Shell>

          <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
            <AnimatePresence>
              {toast && (
                <motion.div key={toast} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.14 } }} transition={{ duration: 0.2 }} className="flex items-center gap-2 rounded-lg bg-(--hz-ink) px-4 py-3 text-[14.5px] font-medium text-white shadow-[0_6px_12px_rgba(31,42,36,0.18)]">
                  <CheckCircle size={18} weight="fill" className="text-[#6EE7B7]" aria-hidden />
                  {toast}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </MotionConfig>
    </ResponsiveSite>
  );
}

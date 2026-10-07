export type Topic = "동네 정보" | "안전" | "집 관리" | "생활 꿀팁" | "같이 해요";
export type PostKind = "question" | "info";
export type Scope = "우리 동네만" | "인근 동네까지";
export type Screen = "home" | "post" | "write";

export type Comment = {
  id: string;
  nickname: string;
  dong: string;
  minutesAgo: number;
  body: string;
};

export type Post = {
  id: string;
  topic: Topic;
  kind: PostKind;
  title: string;
  body: string;
  nickname: string;
  dong: string;
  minutesAgo: number;
  likes: number;
  views: number;
  photos: number; // 첨부 사진 수 (최대 3)
  adoptedCommentId?: string; // 질문 글에서 작성자가 채택한 답변
  comments: Comment[];
};

export type SafetyAlert = { id: string; text: string; minutesAgo: number };

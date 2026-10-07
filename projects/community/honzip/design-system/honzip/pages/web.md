# honzip web override (MASTER.md보다 우선)

design-intake가 생성함. 아래 '프로젝트 판단' 절은 에이전트가 채움.

## intake 기록
- 질의어: `local community neighborhood board women living alone`
- 프리셋: web, 다이얼 V6 / M5 / D5
- UUPM 카테고리: Hyperlocal Services (spec의 업종과 맞는지 에이전트가 확인)
- 스타일: Minimalism

## 버린 것
- Motion (GSAP 스니펫): 워크스페이스는 motion/react 사용. 필요하면 같은 의도로 옮겨 씀

## 대체한 것
- 디스플레이 폰트: Inter → Outfit

## 폰트 (워크스페이스 정책 적용)
- 본문, 라벨, 한글 전체: Pretendard
- 디스플레이(제목 영문, KPI 숫자, 금액): Outfit (자동 교체. 원래 추천 'Inter': 'Inter'는 디스플레이 폰트 금지 목록(흔한 기본값)에 있음)
- CSS: `--font-display: "Outfit", "Pretendard Variable", Pretendard, sans-serif`
- 숫자: Outfit에 tabular-nums 적용 (지원 확인됨)
- 코드, ID, 해시만 모노스페이스

## 프로젝트 판단

### 컬러 보정 (MASTER보다 우선)
- MASTER의 Primary #059669는 흰 배경 작은 글자 대비가 3.8:1이라 글자에는 #047857(5.5:1)로 한 단계 진하게 씀. 면(배지 배경, 탭 밑줄)에는 #059669 계열 틴트 허용.
- 배경은 민트 #ECFDF5 대신 #F6F7F3(아주 옅은 올리브 회색). 화면 전체가 민트색이면 헬스 앱처럼 보이고, spec이 요구한 "차분하고 생활감 있는 톤"에 안 맞음.
- CTA 주황은 #C2410C(흰 글자 5.2:1). 글쓰기, 등록 버튼에만 쓰고 다른 곳에는 쓰지 않음.
- 분홍, 하트 아이콘 없음. 공감 아이콘은 하트 대신 ThumbsUp.

### 라벨 색 (의미 고정, 색 + 아이콘 + 텍스트)

| 라벨 | 글자 | 배경 | 아이콘 (Phosphor) |
|---|---|---|---|
| 해결됨 | #065F46 | #D1FAE5 | CheckCircle (fill) |
| 질문 | #0C5A82 | #E0F0F9 | Question |
| 정보 공유 | #475569 | #EEF1EB | Lightbulb |
| 작성자가 채택한 답변 | #065F46 | #D1FAE5 | SealCheck |
| 안전 알림 | #9A3412 | #FFEDD5 | WarningCircle |

- 동네 인증은 닉네임 옆 ShieldCheck 아이콘 + 동네명으로 표시. 목업이라 인증 수치나 인원수는 쓰지 않음(검증되지 않은 숫자 금지).
- 주제는 중립 회색 칩 하나로 통일하고, 주제마다 색을 따로 주지 않음.

### 셸과 레이아웃
- 선택: 흰 상단 바(데스크톱 64px, 모바일 56px). 로고 + 동네 칩 + 메뉴(홈, 글쓰기). 모바일은 하단 탭이 아니라 상단 햄버거 메뉴(spec).
- 홈 데스크톱은 좌 피드 + 우 320px 사이드(안전 알림). 많이 본 글은 번호 목록 한 덩어리, 피드는 카드 격자가 아니라 구분선 목록 행(썸네일은 우측). 같은 카드가 연속되는 구조를 피함.
- 모바일은 우측 박스를 피드 아래가 아니라 주제 탭 바로 위의 접이식 한 줄로 접음.
- 배제 1. 하단 탭 바: spec이 상단 메뉴를 명시함.
- 배제 2. 좌측 사이드 내비: 커뮤니티 피드 폭이 줄고, 화면이 3개뿐이라 과함.
- 상세는 본문 단일 열 720px + 우측 같은 주제 글 4개. 글쓰기는 단일 열 720px.

### 보조 검색에서 채택한 것
- `Community/Forum Landing` (landing): "Warm, welcoming", "Topic badges in brand colors", "Activity indicators green". 채택은 따뜻한 톤과 초록 활동 표시까지. 히어로, 가입 CTA 섹션은 서비스 화면이라 버림. 회원 수 같은 수치는 검증 안 되므로 쓰지 않음.
- `community social network` (product): Social Media App의 Vibrant & Block-based는 spec의 차분한 톤과 반대라 버림. Anonymous Community의 "upvote green + empathy warm accent"만 참고해 공감은 초록, 따뜻한 강조는 주황 CTA 한 곳.
- `responsive navigation mobile menu` (ux): 모바일 우선 작성, 기본 스타일에서 md, lg로 확장.
- `trust verified neighbor badge` (ux): 비동기로 바뀌는 수치(공감 수 등)는 맥락 있는 문장으로 status 영역에 알림(예: "공감 35개").
- 결과 없음: `local community neighborhood board`(landing)는 0건이라 `Community/Forum Landing`으로 한 번 재시도함.

### 타이포, 모션
- 본문 15px/24px(모바일), 게시글 본문 16px/27px. 제목은 Pretendard 700, 로고와 숫자는 Outfit.
- 전환은 화면 페이드 200ms 하나, 공감 버튼은 눌렀을 때 숫자가 바뀌는 즉시 피드백. reduced-motion이면 모두 즉시.

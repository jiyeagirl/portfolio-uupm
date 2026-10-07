# teefinder app override (MASTER.md보다 우선)

design-intake가 생성함. 아래 '프로젝트 판단' 절은 에이전트가 채움.

## intake 기록
- 질의어: `golf tee time booking membership app`
- 프리셋: app, 다이얼 V7 / M6 / D5
- UUPM 카테고리: Booking & Appointment App (spec의 업종과 맞는지 에이전트가 확인)
- 스타일: Soft UI Evolution

## 버린 것
- Page Pattern: 랜딩 페이지 섹션 구조라 앱 화면과 무관함. references/app.md를 따름
- Motion (GSAP 스니펫): 앱은 motion/react 사용. 스크롤 트리거 연출 금지
- Modal backdrop-filter blur: 기기 프레임 모서리 흰 틈 버그와 같은 원인. 불투명 시트로

## 대체한 것
- 디스플레이 폰트: Inter → Poppins

## 폰트 (워크스페이스 정책 적용)
- 본문, 라벨, 버튼, 입력칸: Pretendard
- 한글 제목: 한글 디스플레이 폰트 1개 허용. references/font-map.md에서 무드에 맞게 골라 아트 디렉션에 적음
- 디스플레이(제목 영문, KPI 숫자, 금액): Poppins (자동 교체. 원래 추천 'Inter': 'Inter'는 디스플레이 폰트 금지 목록(흔한 기본값)에 있음)
- CSS: `--font-display: "Poppins", "Pretendard Variable", Pretendard, sans-serif`
- 숫자: Poppins는 고정폭 숫자 미지원. KPI, 금액, 표 숫자는 Pretendard + tabular-nums로
- 코드, ID, 해시만 모노스페이스

## 프로젝트 판단

### 컬러 대체 (MASTER보다 우선)
UUPM의 파랑 primary(#0284C7)와 초록 accent(#059669)는 spec의 상태 색(보안인증 필요, 취소티 = 파랑 / 정상, 예약 가능 = 초록)과 겹쳐 브랜드와 상태가 구분되지 않음. 브랜드는 상태 색 밖으로 뺌.

| 토큰 | 값 | 용도 |
|---|---|---|
| `--tf-ink` | #0E2A22 | 브랜드 면(홈 상단 큰 면적, 하단 고정 CTA, 관리자 레일) |
| `--tf-ink-2` | #17382E | 면 위 보조 면 |
| `--tf-paper` | #F5F1E6 | 앱 배경 |
| `--tf-card` | #FFFFFF | 카드 |
| `--tf-line` | #E4DECF | 구분선 |
| `--tf-brass` | #B8893B | 회원권 표식, 즐겨찾기 하트, 숫자 강조 |
| `--tf-text` | #14231D | 본문 |
| `--tf-sub` | #5B6A63 | 보조 텍스트 (paper 위 대비 4.5:1 이상) |

관리자 웹은 같은 토큰을 쓰되 배경은 흰색(#FFFFFF), 레일만 ink. 앱과 같은 제품으로 읽히게 함.

### 상태 색 표 (앱, 관리자 모든 화면에서 의미 고정)
| 상태 | 글자 | 배경 | 아이콘 (phosphor) |
|---|---|---|---|
| 승인 대기 | #9A4A00 | #FFEBD2 | Hourglass |
| 승인, 정상 | #166534 | #DCF3E3 | CheckCircle |
| 반려 | #B42318 | #FDE2E0 | XCircle |
| 이용 정지 | #4B5563 | #E8EAED | Prohibit |
| 점검 필요 | #9A4A00 | #FFEBD2 | WarningCircle |
| 오류 | #B42318 | #FDE2E0 | WarningOctagon |
| 보안인증 필요 | #1D4ED8 | #DEE8FD | ShieldCheck |
| 예약 가능 | #166534 | #DCF3E3 | CheckCircle |
| 마감 | #4B5563 | #E8EAED | Lock |
| 취소티 | #FFFFFF | #1D4ED8 | Lightning (채운 파랑, 강조) |

색만으로 구분하지 않음. 배지는 아이콘 + 텍스트 + 색 3중 표기.

### 셸과 레이아웃
- 앱: 하단 탭 4개(홈 / 골프장 / 알림 / 내 정보). 탭바는 불투명 흰 배경, backdrop-blur 금지. 로그인과 승인 대기, 웹뷰는 탭바 없는 풀스크린.
- 관리자: S1 흰 좌측 레일(메뉴 5개, 레일은 ink 면)을 기본 셸로 채택. 가입 승인 화면만 안쪽에 S5 마스터 디테일(목록 380px + 우측 상세).
  - 배제 S2(상단 바 + 탭): 메뉴 5개에 골프장 설정 같은 2분할 폼 화면이 있어 세로 공간이 좁아짐.
  - 배제 S4(다크 레일 전체): 워크스페이스에 이미 많고 관제 근거가 약함. 레일만 ink 면으로 쓰고 본문은 흰색.
- 앱과 관리자가 한 상태 저장소를 공유함(`lib/store.tsx`). 관리자 승인이 앱 승인 대기 화면을 푸는 흐름이 핵심.

### 보조 검색으로 채택한 것
- `--domain product "golf booking appointment"`: 1순위가 Booking & Appointment App(intake 카테고리와 일치). 팔레트 포커스 "trust blue + available green + booked grey"의 상태 의미(가능 = 초록, 마감 = 회색)는 채택. 파랑 primary는 상태 색과 겹쳐 버림(위 컬러 대체). 2순위 Government Portal은 업종 불일치로 무시.
- `--domain ux "status badge color not only"`: "Color Only" 항목 채택. 색 + 아이콘 + 텍스트 3중 표기.
- `--domain ux "bottom navigation tab bar"`: 검증된 결과 없음. 나온 2건이 web용 sticky nav, 키보드 탐색이라 앱 탭바에 해당 없음. references/app.md 기본값(탭 4개, 터치 영역 44px 이상, 불투명 배경)을 그대로 씀.
- 도메인 고유 판단(티타임 시각 표현, 취소티 강조)은 검색 근거가 없어 아트 디렉션에서 정함.

### 타이포
- 한글 제목: Gowun Batang 700 (`--tf-heading`). 영문 워드마크와 영문 라벨: Poppins 600 (`--tf-display`).
- 본문, 라벨, 버튼, 입력칸: Pretendard. 시간(07:12), 그린피, 표 숫자는 Pretendard 700 + tabular-nums (Poppins는 고정폭 미지원).
- 앱 본문 15px / 행간 22px. 시간 숫자 22~28px.
- 눌림 피드백: 배경 톤 변화(ink 5% 틴트), scale 없음. 화면 진입 모션은 translateY 8px + fade 220ms ease-out.

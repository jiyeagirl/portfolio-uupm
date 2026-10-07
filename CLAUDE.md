# 포트폴리오 목업 워크스페이스

여러 포트폴리오 목업을 Next.js 앱 하나에서 관리하는 워크스페이스. 주력은 B2B 콘솔과 관리자 화면이고, 모바일 앱과 고객용 반응형 웹도 같은 파이프라인으로 만듦.

이 파일에는 구조, 순서, 금지사항만 둠. 플랫폼별 디자인 판단은 `.claude/skills/design-intake/references/`에, 리뷰 기준은 `.claude/agents/`에 있음.

## 반복 실패 체크 (작업 전 훑기)

- [ ] 엔트리(`src/index.tsx`, `admin-app.tsx`)를 먼저 썼는가. 리프 먼저, 엔트리 마지막. 순서가 뒤집히면 모든 프로젝트 URL이 500.
- [ ] `design-system/<slug>/MASTER.md` 없이 UI 파일을 쓰려 하는가. 훅이 막음.
- [ ] UUPM 원본 출력을 보정 없이 썼는가. 랜딩 패턴, GSAP, 엉뚱한 폰트가 섞여 나옴.
- [ ] 렌더링 텍스트에 em dash, 중간점이 있는가.
- [ ] 아무도 화면을 안 봤는가. `tsc` 통과는 완성이 아님. 캡처와 리뷰어 판정까지 끝내야 완성.

---

## 1. 구조

```
app/                         # 루트 엔트리 + 동적 라우트 1개만. 프로젝트 추가로 파일이 늘지 않음
  [category]/[project]/page.tsx
components/shared/           # 브랜드 없는 공용 부품만 (PhoneFrame, ResponsiveSite, ...)
projects/<category>/<project>/
  spec.md                    # 사용자가 씀. 기능 범위의 정답
  design-system/<slug>/
    MASTER.md                # UUPM 생성 후 어댑터가 보정한 결과
    pages/<screen>.md        # 화면별 예외 (선택)
  design.md                  # 적용한 판단과 근거
  lib/ components/ styles/ assets/
  src/index.tsx              # default export. 유일한 필수 파일
  src/meta.ts                # 탭 제목 (선택, "use client" 금지)
.claude/
  skills/ui-ux-pro-max/      # 외부 스킬. 저장소에 커밋함 (기계마다 달라지지 않게)
  skills/design-intake/      # 워크스페이스 어댑터 스킬
  agents/                    # 리뷰어 3종
  hooks/
```

- 새 프로젝트는 반드시 `projects/` 아래. 새 Next.js 앱이나 `app/` 아래 프로젝트 폴더를 만들지 않음.
- 한 프로젝트는 URL 하나 (`/<category>/<project>`). 내부 화면은 컴포넌트 상태로 전환하고, 초기 화면은 `?screen=`으로 받음.
- 공용 컴포넌트 승격은 두 번째 프로젝트가 같은 구조를 실제로 재사용할 때만.
- 디자인 산출물(`design-system/`)도 프로젝트 폴더 안에만 둠. 루트에 `design-system/`을 만들지 않음.

### 공유 컴파일 단위

동적 라우트의 import 경로가 템플릿 리터럴이라 `projects/*/*/src/` 전체가 컴파일 단위 하나로 묶임. 어느 프로젝트든 존재하지 않는 모듈을 import하면 워크스페이스 전체가 500. 무관한 프로젝트가 500이면 dev 로그에서 다른 프로젝트의 module-not-found부터 찾음.

## 2. 프리셋

| 프리셋 | 용도 | 품질 기준 | 기본 다이얼 (V/M/D) | 플랫폼 레퍼런스 |
|---|---|---|---|---|
| `console` (기본) | B2B 서비스, 관리자, 운영 도구 | **절제.** 빠르게 읽히고 틀리지 않으면 통과. 공들인 장식은 감점 | 4 / 3 / 8 | `references/console.md` |
| `web` | 고객용 반응형 사이트 | **표현.** 3초 안에 이 서비스만의 인상이 보여야 통과 | 7 / 5 / 4 | `references/web.md` + `art-direction.md` |
| `app` | 모바일 앱 (iPhone 16 Pro 프레임 1대) | **표현.** web과 같음 | 7 / 6 / 5 | `references/app.md` + `art-direction.md` |

UUPM은 "틀리지 않게"까지만 정해줌. web, app은 그 위에 아트 디렉션(무드, 레퍼런스 3개, 시그니처 요소 2개 이상)을 반드시 더함. 빼기만 하는 판단은 무난한 화면을 만듦.

- `/scaffold <category>/<project> [console|web|app] [--with-admin] [--with-mobile]` (내부적으로 `bash scripts/scaffold.sh` 실행)
- 다이얼은 spec에 `다이얼: V/M/D` 줄이 있으면 그것을 따름.

## 3. 새 프로젝트 순서

1. **Scaffold.** 프리셋 결정, `.visual-pending` 마커 생성.
2. **Design intake** (`design-intake` 스킬). UUPM을 직접 부르지 않고 반드시 이 스킬을 거침.
   1. spec.md에서 영어 질의어 2~5개를 만듦 (업종 + 제품 유형 + 톤).
   2. `python3 .claude/skills/design-intake/scripts/intake.py --project projects/<c>/<p> --query "<질의어>"` 실행. UUPM 생성, 폰트와 스타일 자동 검사, 프로젝트 안 저장까지 함.
   3. 카테고리, 컬러, 폰트가 spec과 맞는지 눈으로 확인. 안 맞으면 질의어를 좁혀 1회 재실행.
   4. 보조 검색(`--domain product|ux|chart`)으로 화면 근거를 보강.
   5. web, app이면 `references/art-direction.md`로 아트 디렉션을 정함.
   6. `pages/<preset>.md`의 "프로젝트 판단" 절(상태 색, 셸 선택, 보조 검색 결과)과 `design.md`를 씀.
3. **빌드.** `lib/types.ts` → `lib/mock-data.ts` → `components/ui.tsx` → 화면 → 셸 → `src/index.tsx` 순서. spec의 모든 화면을 한 번에 만들고 화면마다 멈추지 않음.
4. **검사.** `tsc --noEmit`, `eslint`, 라우트 200 확인을 마지막에 한 번.
5. **시각 검증** (4절).
6. **최종 요약.** 만든 화면, 검사 결과, 리뷰 라운드별 지적 수, 미해결 목록, 사진 요청 목록, spec에서 적용한 옵션 줄.

`app/` 아래는 건드리지 않음. 랜딩 페이지와 동적 라우트가 새 프로젝트를 자동으로 잡음.

## 4. 시각 검증과 리뷰

1. `npm run visual -- <c> <p> <screen...> [--device=console|web]`로 spec의 모든 화면 캡처. `--with-admin`은 `-admin` URL을 따로 캡처.
   - 화면마다 상태가 다른 경우(지연 건, 승인 대기 건, 필터 탭 선택)도 `name:key=value` 토큰으로 캡처함. 리뷰어는 캡처에 없는 상태를 확인할 수 없음.
2. 출력의 `[error]`(금지 문자, 가로 넘침, 폰트 누락, 깨진 이미지, 모서리 흰 틈, 콘솔 에러)는 리뷰 전에 고침.
3. 리뷰어 3개를 **병렬로** 띄움. 리뷰어에게 코드는 주지 않고 캡처 PNG와 문서만 줌. 프롬프트에 프로젝트 경로, slug, 프리셋, PNG 목록(각 PNG가 어떤 상태인지)을 적음.
   - `review-domain`: spec + MASTER.md 기준. 업종에 맞는 인상인가, Anti-patterns를 어겼는가
   - `review-ux`: UUPM 사전 점검표 + 플랫폼 레퍼런스. 상태 표기, 정렬, 숫자 표기, 포커스, 빈 상태
   - `review-visual`: 위계, 여백, 정렬, 반복 레이아웃, AI 티 나는 패턴. web, app은 무난함 점검표와 시그니처 요소 노출까지 판정
4. 지적을 high / mid / low로 합치고 high, mid만 고침. 바뀐 화면만 다시 캡처해서 같은 리뷰어에게 재판정 받음.
5. 최대 2라운드. 남은 지적은 최종 요약의 "미해결"로 넘김.
6. 빌더도 수정한 화면 PNG를 직접 열어 확인함. 리뷰어의 "통과"만 믿지 않음.
7. 끝나면 `.visual-pending` 삭제.

## 5. 우선순위 (충돌 시)

1. spec.md에 명시된 옵션 줄 (`프리셋:`, `다이얼:`, `디자인시스템:`, `팔레트:`)
2. 이 파일의 워크스페이스 고정 규칙 (6절)
3. 프로젝트 `design-system/<slug>/pages/*.md`
4. 프로젝트 `design-system/<slug>/MASTER.md`
5. 플랫폼 레퍼런스
6. UUPM 원본 데이터

`디자인시스템: <name>`이 있으면 `design-systems/<name>.md`의 컬러와 타이포가 MASTER.md를 대신함. 레이아웃, 밀도, UX 규칙은 그대로 UUPM 보정본을 따름.

## 6. 워크스페이스 고정 규칙

### 폰트
- 본문, UI 라벨, 버튼, 입력칸은 Pretendard. console은 한글 제목도 Pretendard.
- web, app은 한글 제목(페이지, 섹션 제목, 히어로 문구)에 한글 디스플레이 폰트 1개를 쓸 수 있음. 후보와 설치법은 `references/font-map.md`.
- 제목 영문, KPI 숫자, 금액은 UUPM 추천 폰트 허용. `--font-display: "<추천>", "Pretendard Variable", sans-serif`로 폴백 구성.
- 숫자 열은 `tabular-nums` 지원 폰트만. 장식성 폰트(스크립트, 손글씨)는 숫자에 금지.
- 세리프가 추천되면 한글 제목도 세리프 계열로 매핑 (`references/font-map.md`).
- 코드, ID, 해시만 모노스페이스.

### 텍스트
- 렌더링되는 모든 텍스트(목업 데이터, `meta.ts` 포함)에 em dash, 중간점 금지. 문장 안 나열은 쉼표, 복합 라벨은 슬래시, 메타 정보 나열은 파이프. 숫자 범위의 en dash는 허용.
- 회사명은 `A테크`, `B소재`처럼 알파벳으로 익명화. 사람, 연락처는 그럴듯한 가상값.
- 빈 섹션, Lorem Ipsum, TODO, "Coming Soon" 금지.

### 구현 가능성 (콘솔 KPI 기준. 목업도 실제로 개발할 수 있는 수준으로)
- KPI, 요약 카드의 보조 문구는 집계 기준을 설명하는 고정 문구만 씀 (예: "수락 대기, 진행 중, 지연 포함"처럼 spec의 상태명 그대로). 데이터가 바뀌어도 그대로 쓸 수 있어야 함.
- 숫자를 다시 쪼갠 내역("승인 대기 2건 포함"), 특정 레코드 이름("B소재 PO-2609-025"), 근거 없는 증감률("전월 대비 +12%")을 보조 문구에 넣지 않음. 카드 하나마다 집계 쿼리가 늘어나는 문구는 금지.
- 보조 문구 자체가 필요 없으면 생략함. 라벨에 단위나 기준을 넣는 것으로 충분한 경우가 많음.
- 행 단위 파생값(D-day, 지연 일수, 행 금액)은 해당 레코드 필드만으로 계산되므로 허용.
- 이 절은 콘솔 KPI 보조 문구 규칙임. 소비자 화면의 단순 카운트(이웃 수, 오늘 새 글, 참여 인원)는 목업 데이터로 써도 됨.

### 스택
- Tailwind, `@phosphor-icons/react`, `motion/react`. shadcn/ui와 `@iconify/react` 신규 사용 금지.
- 각 프로젝트는 자기 `components/ui.tsx`를 씀.
- 프로젝트 토큰은 `styles/<project>.css`에 프로젝트 접두사 CSS 변수(`--pl-accent`)로 정의하고 루트 래퍼 클래스(`.partloop`)에 스코프함. `src/index.tsx`에서 import하고 Tailwind에서는 `bg-(--pl-accent)`처럼 씀. `@theme`은 `app/globals.css` 전용 (프로젝트 CSS에 쓰면 처리되지 않음).
- 디스플레이 폰트는 npm 폰트 패키지(`@fontsource/<slug>`, `@sun-typeface/suit`, `wanted-sans` 등)를 설치하고 필요한 굵기만 프로젝트 CSS에서 import (오프라인 빌드에서도 깨지지 않음).
- 초기 화면은 `useSearchParams`로 읽음. 렌더 중에 `window`를 읽으면 서버와 클라이언트 결과가 달라져 hydration 에러가 남.
- 모션은 `prefers-reduced-motion` 존중. 콘솔은 화면 전환 페이드 1개와 상태 변화 피드백 정도만.

### 이미지
- 콘텐츠 이미지는 직접 확인한 고정 id만 사용. 랜덤 seed 금지.
- 맞는 사진이 없으면 자리만 틴트 타일로 두고 최종 요약의 "사진 요청"에 화면, 위치, 필요한 내용, 비율, 저장 경로를 적음.

### 앱 프리셋 전용
- iPhone 16 Pro 프레임 1대, 흰 배경 중앙 배치.
- 화면 끝에 붙는 바에 `backdrop-blur` 금지 (프레임 모서리 흰 틈 버그). 반투명 대신 불투명 배경.

## 7. 훅

- `post-edit-check.mjs`: `projects/` 수정 직후 금지 문자, 해석 안 되는 import, `@iconify/react`, 기기 프레임 안 `backdrop-blur` 검사.
- `pre-write-design-gate.mjs`: 새 `.tsx`(프로젝트 `src/`, `components/` 아래)를 쓰기 전에 `.intake.json`, `MASTER.md`, 판단 절이 채워진 `pages/<preset>.md`, `design.md`가 있는지 확인하고 없으면 막음. intake 경고가 남아 있으면 재실행하거나 `.intake-ack`로 확인 표시해야 통과. `-admin` 프로젝트는 메인 프로젝트 기준.
- `stop-visual-gate.mjs`: 이번 세션에 작업한 프로젝트에 `.visual-pending`이 남아 있으면 턴 종료 시 한 번 상기.

훅 메시지는 우회할 에러가 아니라 따라야 할 피드백임.

배치 진행을 건너뛰는 경우는 사용자가 화면 하나 먼저 보자고 할 때, 또는 기존 화면의 작은 수정일 때뿐.

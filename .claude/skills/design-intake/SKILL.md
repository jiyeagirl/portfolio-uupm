---
name: design-intake
description: 새 목업 프로젝트의 디자인 시스템을 UI UX Pro Max로 생성하고 워크스페이스 규칙으로 걸러 프로젝트 폴더에 저장하는 스킬. spec.md가 준비된 프로젝트에서 첫 UI 파일을 쓰기 전에 반드시 사용. 기존 프로젝트의 디자인 방향을 다시 잡을 때도 사용.
---

# design-intake

UI UX Pro Max(이하 UUPM)를 대신하는 스킬이 아님. UUPM을 부르는 앞뒤 단계를 고정해서, 매 프로젝트가 같은 품질 기준을 거치게 함.

```
spec.md → [1 질의어] → [2 intake.py: UUPM 생성 + 자동 검사 + 저장] → [3 경고 처리] → [4 보조 검색] → [5 판단 기록] → UI 작성
```

`pre-write-design-gate.mjs` 훅이 5단계까지 끝나지 않은 프로젝트의 새 `.tsx` 작성을 막음.

## 0. 먼저 읽을 것

- 프로젝트의 `spec.md` 전체
- 프리셋에 맞는 레퍼런스 하나: `references/console.md` | `references/web.md` | `references/app.md`
  - 프리셋은 spec의 `프리셋:` 줄, 없으면 `_reference.md`의 `- 프리셋:`, 없으면 `플랫폼:` 줄로 판단. 모두 없으면 console
- 폰트가 세리프거나 숫자 지원이 미확인이면 `references/font-map.md`

## 1. 질의어 만들기

UUPM 데이터는 영어 BM25 검색이라 한국어 spec을 그대로 넣으면 매칭이 약함. spec에서 영어 단어 2~5개를 뽑음.

- 구성: **업종 1개 + 제품 유형 1개 + 핵심 대상이나 톤 1개**
- 좋은 예: `B2B procurement purchase order supplier management`, `clinic appointment booking patient`, `film camera photo app retro`
- 피할 것: 기능 나열(`table filter search chart modal`), 플랫폼 단어만(`admin dashboard`), 형용사만(`clean modern`)
- 플랫폼 단어(dashboard, console, app)는 UUPM이 랜딩 카테고리로 끌고 가는 경우가 있어 업종 단어 뒤에 하나만 붙이거나 생략

## 2. intake 실행

워크스페이스 루트에서 (Windows에서 `python3`가 없으면 `python`으로):

```bash
python3 .claude/skills/design-intake/scripts/intake.py \
  --project projects/<category>/<project> \
  --query "<영어 질의어>"
```

스크립트가 하는 일:
- 프리셋과 다이얼 결정 (spec의 `다이얼: V/M/D`가 우선, 기본값은 console 4/3/8, web 6/5/5, app 5/5/5)
- UUPM `--design-system` 실행
- **폰트 자동 검사와 교체**: 무드가 프리셋과 안 맞거나(예: 콘솔에 academia, luxury), 금지 목록(Inter, Geist, Roboto 등)이거나, 모노스페이스면 대체 후보로 교체. 콘솔은 고정폭 숫자 지원 폰트를 우선하고, 다른 프로젝트가 이미 쓴 폰트는 뒤로 미룸
- **스타일 검사**: 프리셋에 안 맞는 스타일(콘솔의 glass, clay, brutalism 등)이면 경고
- 저장: `design-system/<slug>/MASTER.md`(UUPM 원본), `design-system/<slug>/pages/<preset>.md`(override), `.intake.json`(훅이 읽는 기록)

옵션: `--preset`, `--name`, `--font "<폰트명>"`(디스플레이 폰트 직접 지정), `--force`(MASTER.md 덮어쓰기)

종료 코드 0은 통과, 2는 경고 있음(파일은 저장됨).

## 3. 출력 검증과 경고 처리

종료 코드와 상관없이 아래 3가지는 사람 눈으로 확인함. 스크립트가 판단할 수 없는 부분임.

1. **카테고리**: 출력의 `카테고리:`가 spec의 업종과 맞는가. 발주 시스템인데 `E-commerce Luxury`가 나오면 질의어가 잘못된 것
2. **컬러**: primary와 accent가 업종 인상과 맞는가. 보라, 분홍 그라데이션 계열이면 다시 봄
3. **폰트 교체 결과**: 자동 교체된 폰트가 spec의 톤과 맞는가

맞지 않으면 질의어를 **한 번만** 좁혀 `--force`로 재실행함. 그래도 안 맞는 항목은 4단계 보조 검색 결과로 그 항목만 바꿈.

경고를 검토하고 그대로 가기로 했으면 이유를 `design.md`에 적고 프로젝트 폴더에 빈 `.intake-ack` 파일을 만듦. 그래야 훅이 통과시킴.

## 4. 보조 검색

`--design-system`은 제품 전체 방향만 줌. 화면 구현에 필요한 근거는 도메인 검색으로 보강함. 프리셋 레퍼런스의 "보조 검색" 절에 기본 질의가 있음.

```bash
S=.claude/skills/ui-ux-pro-max/scripts/search.py
python3 $S "<업종 단어 2~3개>" --domain product -n 2     # 업종별 스타일, 대시보드 스타일, 색 전략
python3 $S "<확인할 UX 결과 하나>" --domain ux -n 2     # 예: "status badge color not only"
python3 $S "<차트 목적>" --domain chart -n 2            # 차트가 있을 때만
```

질의 하나에 의도 하나. 결과가 비거나 엉뚱하면 한 번만 바꿔 재시도하고, 그래도 없으면 "검증된 결과 없음"으로 기록하고 레퍼런스의 기본값을 씀.

## 5. 판단 기록

`pages/<preset>.md`의 `## 프로젝트 판단 (에이전트가 작성)` 절을 실제 내용으로 바꿈. 제목의 "(에이전트가 작성)"도 지움. intake를 다시 돌려도 이 절은 보존됨.

반드시 들어갈 것:
- **상태 색 표**: 상태명 / 글자색 / 배경색 / 아이콘. 상태가 있는 도메인이면 필수. 의미는 모든 화면에서 고정
- **셸과 레이아웃**: 고른 것, 배제한 후보 2개와 이유 (레퍼런스의 선택지 참고)
- **보조 검색으로 채택한 것**: 질의와 채택한 결과 한 줄씩
- **화면별 예외**가 있으면 `pages/<screen>.md`를 따로 만듦 (그 화면에서만 MASTER와 다른 것만)

그다음 프로젝트 루트에 `design.md`를 씀:

```markdown
# 디자인 적용
해석: <화면 종류> for <누구>. 다이얼 V<v>/M<m>/D<d>.

## 채택 (UUPM)
- 스타일, 컬러, 디스플레이 폰트와 근거 한 줄씩

## 버림
- override의 "버린 것"에 더해 이 프로젝트에서 추가로 버린 것

## 앞선 프로젝트와 다르게 고른 것
- 셸, 폰트, 본문 크기/행간, 진입 모션 중 최소 2개
```

## 우선순위

spec.md 옵션 줄 > CLAUDE.md 고정 규칙 > `pages/<screen>.md` > `pages/<preset>.md` > `MASTER.md` > 프리셋 레퍼런스 > UUPM 원본 데이터

spec에 `디자인시스템: <name>`이 있으면 `design-systems/<name>.md`의 컬러와 타이포가 MASTER.md를 대신함. intake는 그래도 실행함 (레이아웃, 밀도, UX 근거는 UUPM에서 가져오므로).

## 하지 말 것

- UUPM `search.py --design-system --persist`를 직접 실행하지 않음. 루트에 `design-system/`이 생기고 검사를 건너뜀
- MASTER.md를 손으로 고치지 않음. 바꿀 것은 override에 적음 (MASTER는 UUPM 원본으로 남겨서 무엇을 바꿨는지 추적 가능하게)
- UUPM의 Pre-Delivery Checklist를 그대로 최종 검수로 쓰지 않음. 모바일 앱 기준 항목이 섞여 있음. 검수는 리뷰어 에이전트가 프리셋 레퍼런스 기준으로 함

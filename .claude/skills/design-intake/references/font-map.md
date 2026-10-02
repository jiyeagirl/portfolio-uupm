# 폰트 정책과 매핑

## 기본 정책

- 본문, 라벨, 한글 전체: Pretendard
- 디스플레이(제목 영문, KPI 숫자, 금액): UUPM 추천 폰트, 한글은 Pretendard로 폴백
- 코드, ID, 해시: 모노스페이스

```css
--font-display: "<추천 폰트>", "Pretendard Variable", Pretendard, sans-serif;
```

폰트 폴백이라 영문과 숫자는 추천 폰트로, 한글 글리프는 자동으로 Pretendard로 그려짐. 한글과 영문을 따로 지정할 필요 없음.

## 디스플레이 폰트 금지

- Inter, Geist, Roboto, Arial, Helvetica, system-ui, SF Pro: 너무 흔해서 AI 기본값처럼 보임
- 모노스페이스 계열: ID 전용
- 스크립트체, 손글씨체: 숫자에 금지. 앱이나 웹의 로고, 히어로 제목에만 허용

## 고정폭 숫자 지원 (fontsource woff로 직접 확인, 2026-10)

| 폰트 | 숫자 | 비고 |
|---|---|---|
| Plus Jakarta Sans | 지원 | tnum 기능 |
| Manrope | 지원 | tnum 기능 |
| Space Grotesk | 지원 | tnum 기능 |
| Outfit | 지원 | tnum 기능 |
| Sora | 지원 | tnum 기능 |
| Work Sans | 지원 | tnum 기능 |
| Montserrat | 지원 | tnum 기능 |
| Fira Sans | 지원 | tnum 기능 |
| IBM Plex Sans | 지원 | 기본 숫자가 고정폭 |
| Source Sans 3 | 지원 | 기본 숫자가 고정폭 |
| Lora | 지원 | tnum 기능 (세리프) |
| DM Sans | 미지원 | 숫자는 Pretendard로 |
| Lexend | 미지원 | 숫자는 Pretendard로 |
| Poppins | 미지원 | 숫자는 Pretendard로 |

미지원 폰트를 디스플레이로 쓰면 KPI, 금액, 표 숫자에는 `font-family: Pretendard; font-variant-numeric: tabular-nums`를 따로 줌 (Pretendard는 tnum 지원).

### 새 폰트 확인 방법

```bash
npm i @fontsource/<font-slug>
python3 - <<'EOF'
from fontTools.ttLib import TTFont
f = TTFont("node_modules/@fontsource/<font-slug>/files/<font-slug>-latin-600-normal.woff")
tags = {r.FeatureTag for r in f["GSUB"].table.FeatureList.FeatureRecord} if "GSUB" in f else set()
cmap, hm = f.getBestCmap(), f["hmtx"]
widths = {hm[cmap[ord(c)]][0] for c in "0123456789"}
print("tnum" in tags, "기본 고정폭" if len(widths) == 1 else "기본 비례폭")
EOF
```

둘 중 하나라도 해당되면 지원. 결과를 위 표와 `scripts/intake.py`의 `FONT_TNUM`에 추가함.

## 세리프가 추천될 때 (주로 web, app)

영문 세리프 + 한글 고딕이 섞이면 제목이 어색해짐. 한글 제목도 세리프 계열로 맞춤.

| 영문 세리프 인상 | 한글 매핑 |
|---|---|
| 고전, 출판 (Garamond, Cormorant, Crimson) | Noto Serif KR |
| 현대 에디토리얼 (Playfair, Lora, Fraunces) | Gowun Batang |

- 둘 다 Google Fonts에 있어 `next/font/google`로 로드 가능
- 한글 세리프는 제목에만. 본문은 Pretendard 유지
- 콘솔에는 세리프 디스플레이를 쓰지 않음 (intake가 자동 교체함)

## 로딩

- 기본: `npm i @fontsource/<slug>` 후 프로젝트 `styles/<project>.css` 맨 위에서 필요한 굵기만 import (`@import "@fontsource/plus-jakarta-sans/latin-600.css";`). 오프라인 빌드에서도 깨지지 않음
- 한글 세리프처럼 fontsource에 없거나 용량이 큰 폰트만 `next/font/google`을 프로젝트 안에서 사용. 공용 `app/layout.tsx`는 건드리지 않음

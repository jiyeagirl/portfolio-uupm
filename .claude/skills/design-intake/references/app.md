# app 프리셋 레퍼런스

iPhone 16 Pro 프레임 1대 안에서 보이는 모바일 앱. 흰 배경 중앙 배치, 스크린샷 그대로 포트폴리오에 씀.

## 질의어 예시

| spec 업종 | 질의어 |
|---|---|
| 필름 카메라 | `film camera photo app retro` |
| 습관, 헬스케어 | `habit tracker health wellness` |
| 반려동물 | `pet care owner community` |
| 지역 생활 | `local neighborhood community map` |

## intake가 자동으로 버리는 것

랜딩 섹션 패턴, GSAP 스니펫, 모달 blur. 앱은 UUPM의 앱 규칙(터치 영역 44pt, 안전 영역, 하단 탭 5개 이하)은 그대로 따름.

## 보조 검색 기본 질의

```bash
python3 $S "<업종 단어>" --domain product -n 2
python3 $S "bottom navigation tab bar" --domain ux -n 2
python3 $S "<핵심 상호작용 하나>" --domain web -n 2      # 예: "swipe gesture affordance"
```

## 홈 골격 선택지

같은 카테고리 안에서 같은 골격 연속 2개 금지. 섹션 헤더 + 가로 스크롤 + 하단 탭바 조합(섹션 스택)은 이미 포화라 도메인 근거가 있을 때만.

| 골격 | 맞는 경우 |
|---|---|
| 단일 피드 | 콘텐츠 소비가 핵심 |
| 지도 또는 캔버스 중심 | 위치, 촬영, 그리기가 핵심 |
| 오늘 하루 카드 1장 + 기록 | 습관, 건강, 일정 |
| 큰 주 행동 버튼 + 최근 기록 | 촬영, 결제, 기록처럼 한 동작이 핵심 |
| 대화형 | 상담, 코칭, AI 기능 |

## 기기 프레임 규칙

- 화면 끝에 붙는 바(하단 탭, 고정 CTA, 앱 바)에 `backdrop-blur` 금지. 불투명 배경만
- 프레임 밖으로 나가는 위치(음수 오프셋, fixed) 금지
- 상태바 영역은 `ScreenHeader`(공용)의 `pt-[59px]` 사용

## 타이포, 모션

- 본문 15~16px. 앞선 프로젝트와 같은 크기/행간 쌍 금지
- 눌림 피드백은 scale, translateY, 배경 톤, 없음 중 하나를 프로젝트마다 다르게
- 진입 모션 duration과 easing 계열도 앞선 프로젝트와 다르게

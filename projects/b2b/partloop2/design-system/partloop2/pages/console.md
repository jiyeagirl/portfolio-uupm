# partloop2 console override (MASTER.md보다 우선)

design-intake가 생성함. 아래 '프로젝트 판단' 절은 에이전트가 채움.

## intake 기록
- 질의어: `B2B procurement purchase order supplier management`
- 프리셋: console, 다이얼 V4 / M3 / D8
- UUPM 카테고리: B2B Service (spec의 업종과 맞는지 에이전트가 확인)
- 스타일: Accessible & Ethical

## 버린 것
- Page Pattern: 랜딩 페이지 섹션 구조라 콘솔과 무관함. 셸과 화면 구성은 references/console.md를 따름
- Motion (GSAP 스니펫): 스크롤 등장 연출은 업무 화면에서 방해가 됨. motion/react로 화면 전환 페이드와 상태 피드백만
- Card hover translateY, 카드 전체 cursor-pointer: 클릭 안 되는 카드가 눌리는 것처럼 보임. 클릭 가능한 행과 버튼에만 hover
- Secondary Button 2px 테두리: 표 중심 화면에서 시선을 과하게 끎. 1px로 낮춤
- Modal backdrop-filter blur: 필요할 때만 불투명 스크림으로
- 본문 16px 규칙: 모바일 기준이라 콘솔에는 적용 안 함. 본문 13.5~14px, 표 13~13.5px

## 대체한 것
- 없음

## 폰트 (워크스페이스 정책 적용)
- 본문, 라벨, 한글 전체: Pretendard
- 디스플레이(제목 영문, KPI 숫자, 금액): Plus Jakarta Sans (UUPM 추천 그대로)
- CSS: `--font-display: "Plus Jakarta Sans", "Pretendard Variable", Pretendard, sans-serif`
- 숫자: Plus Jakarta Sans에 tabular-nums 적용 (지원 확인됨)
- 코드, ID, 해시만 모노스페이스

## 프로젝트 판단

### 상태 색 (모든 화면에서 의미 고정, 색 + 아이콘 + 텍스트 3중 표기)

| 상태 | 글자 | 배경 | 아이콘 (Phosphor) |
|---|---|---|---|
| 승인 대기 | #92400E | #FEF3C7 | Hourglass |
| 수락 대기 | #475569 | #E2E8F0 | Clock |
| 진행 중 | #075985 | #E0F2FE | Truck |
| 지연 | #B91C1C | #FEE2E2 | WarningCircle |
| 납품 완료 | #166534 | #DCFCE7 | CheckCircle |

- 글자와 배경 대비 4.5:1 이상. 보라, 분홍 계열 없음.
- 지연은 상태이면서 D-day 파생값(납기 초과 일수)을 행에 함께 표시. 상세에서는 상단 배너로 원인과 다음 행동.

### 로그인 사용자와 권한
- 로그인 사용자는 A테크 구매팀 팀장(승인권자). "발주 승인" 버튼을 보여줄 수 있는 근거.
- 수락 대기는 공급사 행동을 기다리는 상태라 주 버튼을 두지 않고, 회색 secondary "공급사 연락"과 이유 문구만 표시.
- 진행 중, 지연은 "납품 확인", 납품 완료는 버튼 없음.

### 이름 정리
- 상태 탭은 spec의 "진행 중"이 배지 "진행 중"(3행 안팎)과 집합이 달라 숫자가 어긋남. 탭 이름을 KPI와 같은 "납품 대기"(수락 대기, 진행 중, 지연 포함)로 맞춤. spec 수정 제안 대상.

### 셸과 레이아웃
- 선택: S1 흰 좌측 레일 224px. 아이콘 옆에 라벨을 나란히 표시, 상단에 A테크 구매팀, 하단에 사용자 이름과 직책. 64px 아이콘 레일은 라벨이 작고 좁아 읽기 어렵다는 사용자 피드백으로 폐기.
- 배제 S3 아이콘 레일 64px: 위 이유로 한 번 채택했다가 되돌림.
- 배제 S2 상단 바: 메뉴 수는 맞지만 spec이 좌측 내비로 고정함.
- 상세는 메뉴에 없고 레일의 "발주 현황"을 활성으로 유지, 상단에 목록으로 돌아가는 경로를 둠.
- 표는 두 줄 셀(발주번호/요청일, 공급사/품목 요약)로 열 6개 이하.

### 보조 검색에서 채택한 것
- `B2B service dashboard` (product): Accessible & Ethical + Minimalism & Swiss, 팔레트 Professional blue + neutral grey. 포인트 색은 CTA와 링크에만.
- `status badge color not only` (ux): 색만으로 구분 금지(High). 배지 3중 표기 근거.
- `data table sortable` (ux): 표는 overflow-x-auto 래퍼. 일괄 처리(체크박스)는 spec 범위 밖이라 채택하지 않음.
- `procurement purchase order` (product): 결과 없음. 검증된 결과 없음으로 기록하고 console.md 기본값을 씀.

### 상태 배지
- 폭 고정(작은 88px, 큰 104px)으로 모든 행과 화면에서 같은 너비. 가장 긴 "납품 완료"에 맞춤.

### 타이포, 모션
- 본문 13.5/21, 표 13/18, 페이지 제목 24, KPI 숫자 28 (Plus Jakarta Sans, tabular-nums). 선행 partloop는 14/20, 13.5.
- 화면 전환은 200ms 페이드만(이동 없음). 상태 변경은 배지 색 크로스페이드와 좌하단 토스트. reduced-motion이면 모두 즉시 전환.

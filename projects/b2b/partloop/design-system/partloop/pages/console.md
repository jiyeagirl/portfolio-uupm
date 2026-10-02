# partloop console override (MASTER.md보다 우선)

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

- 상태 색 표 (글자 / 배경 / 아이콘)
  - 승인 대기: #92400E / #FEF3C7 / HourglassMedium
  - 수락 대기: #334155 / #E2E8F0 / PaperPlaneTilt
  - 진행 중: #075985 / #E0F2FE / Truck
  - 지연: #991B1B / #FEE2E2 / WarningCircle
  - 납품 완료: #065F46 / #D1FAE5 / CheckCircle
- 셸: S1 흰 좌측 레일 232px. 배제: S4 다크 레일(워크스페이스에 많음), S2 상단 바(KPI와 표 폭은 충분하지만 메뉴 확장 여지 위해 S1)
- 보조 검색
  - `procurement supply chain inventory` --domain product: Flat + Swiss, Data-Dense, 신호등 상태색 채택
  - `status badge color not only` --domain ux: 배지는 색 + 아이콘 + 텍스트

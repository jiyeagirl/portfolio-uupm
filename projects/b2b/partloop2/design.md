# 디자인 적용
해석: 발주 현황, 작성, 상세 3화면의 구매 담당자용 B2B 수발주 콘솔 for A테크 구매팀 팀장. 다이얼 V4/M3/D8.

## 채택 (UUPM)
- 스타일: Accessible & Ethical + Minimalism & Swiss. 표 중심 업무 도구라 대비와 포커스를 우선
- 컬러: 네이비 잉크 #0F172A, CTA 블루 #0369A1, 배경 #F8FAFC. 업종 색 전략(Professional blue + neutral grey), 블루는 CTA와 링크만
- 디스플레이 폰트: Plus Jakarta Sans (tnum 지원). KPI, 금액, 발주번호. 본문과 한글은 Pretendard

## 버림
- override의 "버린 것" 전부 (랜딩 패턴, GSAP, 카드 hover 상승, 2px 보조 버튼, 모달 blur, 본문 16px)
- 체크박스 일괄 처리: spec 범위 밖
- 차트: spec에 없음

## 앞선 프로젝트와 다르게 고른 것
- 셸: 선행 partloop와 같은 S1 흰 레일 계열(224px). 64px 아이콘 레일을 먼저 썼으나 사용자 피드백으로 변경. 겹침 회피는 아래 항목들로 대신함
- 본문 13.5/21, 표 13/18 (partloop는 14/20, 13.5)
- 모션: 200ms 순수 페이드와 배지 색 크로스페이드, 좌하단 토스트 (partloop는 6px 이동 페이드와 scale 등장)
- 상태 탭 이름을 KPI와 같은 "납품 대기"로 정리 (spec 수정 제안)

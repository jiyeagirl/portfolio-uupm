# web 프리셋 레퍼런스

고객용 반응형 사이트(쇼핑, 예약, 커뮤니티). 같은 URL을 데스크톱 1440과 프레임 안 모바일 393으로 둘 다 검증함.

## 질의어 예시

| spec 업종 | 질의어 |
|---|---|
| 지역 커뮤니티 | `local community neighborhood board` |
| 숙소 예약 | `hotel booking travel stay` |
| 클래스 예약 | `class booking workshop learning` |

## intake가 다루는 방식

- web은 UUPM의 랜딩 패턴을 **버리지 않음**. 홈 화면이 실제로 랜딩 역할을 하는 경우가 많음
- 단 Hero 하나에 화면 전체를 쓰는 패턴은 서비스 사이트에서 과함. 첫 화면에 실제 콘텐츠(상품, 게시물, 예약 가능 목록)가 보여야 함
- GSAP 스니펫은 motion/react로 같은 의도만 옮겨 씀

## 보조 검색 기본 질의

```bash
python3 $S "<업종 단어>" --domain landing -n 2
python3 $S "<업종 단어>" --domain product -n 2
python3 $S "responsive navigation mobile menu" --domain ux -n 2
```

## 반응형 기준

- 모바일 우선으로 쓰고 `sm` `md` `lg`로 확장. 별도 모바일 빌드 금지
- 가로 스크롤 금지 (두 폭 모두)
- 데스크톱 컨테이너 최대폭 1200~1280px

## 타이포, 모션

- 본문 15~17px, 섹션 제목은 디스플레이 폰트
- 섹션 간 반복 구조(같은 카드 그리드 연속) 금지
- 스크롤 등장 연출은 섹션당 1개 요소까지, reduced-motion이면 즉시 표시

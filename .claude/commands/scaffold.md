---
description: 새 목업 프로젝트를 만들고 design-intake, 빌드, 시각 검증, 리뷰까지 한 번에 진행. 기본 프리셋은 console(B2B 콘솔), web은 고객용 반응형 웹, app은 모바일 앱.
argument-hint: <카테고리>/<프로젝트명> [console|web|app] [--with-admin] [--with-mobile]
---

워크스페이스 `CLAUDE.md` 3절 순서를 그대로 진행함. 화면마다 멈추지 않고 끝까지 한 번에 감.

1. **스캐폴드**: `bash scripts/scaffold.sh $ARGUMENTS`
   - 대상 폴더에 `spec.md`만 미리 있는 것은 정상 (그대로 보존됨). 없으면 사용자에게 spec.md를 요청하고 멈춤
   - spec의 `플랫폼:`과 고른 프리셋이 맞는지 확인. 고객 웹 + 관리자면 `web --with-admin`, 업무용 웹만이면 `console`, 모바일 앱이면 `app`. 잘못 골랐으면 `spec.md`만 남기고 지운 뒤 다시 만듦 (`-admin/`이 있으면 그것부터 지움. 시드 `admin-app.tsx`를 먼저 지우면 워크스페이스 전체가 500)

2. **디자인**: `.claude/skills/design-intake/SKILL.md`를 끝까지 읽고 그 1~5단계를 진행
   - 결과물: `design-system/<slug>/MASTER.md`, `pages/<preset>.md`(프로젝트 판단 절 작성), `design.md`
   - 이게 끝나기 전에는 `pre-write-design-gate.mjs`가 `.tsx` 작성을 막음

3. **빌드**: 리프부터 씀. `lib/types.ts` → `lib/mock-data.ts` → `styles/<project>.css` → `components/ui.tsx` → 화면 → 셸 → `src/index.tsx`(+ `src/meta.ts`)
   - 토큰은 접두사 CSS 변수 + 루트 래퍼 클래스 스코프 (CLAUDE.md 6절 스택)
   - `src/index.tsx`는 `useSearchParams`로 `?screen=`을 읽음. 상세처럼 대상이 필요한 화면은 `?id=` 같은 파라미터도 받음
   - `web`은 `<ResponsiveSite>`로 감쌈, `app`은 `PhoneFrame`과 `ScreenHeader`(공용) 사용, `console`은 둘 다 쓰지 않음
   - 공용 `Toggle`이 필요하면 `components/shared/toggle.tsx`를 import. `Badge`, `Button`, `Table` 등은 프로젝트마다 새로 씀
   - 표는 `overflow-x-auto` 안에서 열 폭 합이 넘치면 마지막 열이 조용히 잘림. 열은 6개 이하, 넘치면 두 줄 셀로 합침
   - 차트는 라이브러리 없이 직접 구현

4. **검사**: `npx tsc --noEmit`, `npx eslint projects/<c>/<p>`, `curl`로 URL 200 확인. 모든 화면을 만든 뒤 한 번만

5. **시각 검증과 리뷰**: CLAUDE.md 4절
   - dev 서버를 띄우고 `npm run visual -- <c> <p> <화면...> --device=<console|web>` (app은 device 생략)
   - 상태별 화면(지연 건, 승인 대기 건, 탭 선택, 모달)도 `name:key=value` 토큰으로 캡처
   - `review-domain`, `review-ux`, `review-visual`을 **한 메시지에서 병렬로** 띄움. 프롬프트에 프로젝트 경로, slug, 프리셋, 각 PNG가 어떤 상태인지 적음
   - high, mid를 고치고 바뀐 화면만 재캡처해서 **같은 리뷰어에게** SendMessage로 재판정. 최대 2라운드
   - 수정한 화면 PNG는 직접 열어 확인. 끝나면 `.visual-pending` 삭제

6. **`--with-admin`이면**
   - 관리자 화면은 본 프로젝트 `components/admin/`에 쓰고, 시드 `admin-app.tsx`는 지우지 말고 교체 (`AdminApp` named export 유지, `?screen=` 지원)
   - 사용자 화면에는 관리자 진입점을 두지 않음. `<이름>-admin/src/meta.ts`의 자리표시 문구를 교체
   - 관리자 캡처: `npm run visual -- <c> <이름>-admin <화면...> --device=console`

7. **`--with-mobile`이면**: `-mobile`은 독립 프로젝트. 자체 `spec.md`(본 프로젝트 spec을 모바일 IA로 정리)를 쓰고 1~5단계를 `app` 프리셋으로 따로 진행. 같은 제품이면 컬러는 본 프로젝트와 맞춤

8. **최종 요약**: 만든 화면, 검사 결과, 리뷰 라운드별 지적 수와 해결 여부, 미해결 목록, 사진 요청 목록, spec에서 적용한 옵션 줄

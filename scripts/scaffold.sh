#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------
# scaffold.sh: 목업 프로젝트 폴더 뼈대 생성 (LLM 호출 없음, 파일 생성만)
#
# 사용법: bash scripts/scaffold.sh <카테고리>/<프로젝트명> [console|web|app] [--with-admin] [--with-mobile]
# 예:     bash scripts/scaffold.sh b2b/partloop                       # B2B 콘솔 (기본)
#         bash scripts/scaffold.sh platform/dressday web --with-admin # 고객용 반응형 웹 + 관리자
#         bash scripts/scaffold.sh b2b/neworder console --with-admin --with-mobile
#         bash scripts/scaffold.sh camera/moviediary app              # 모바일 앱
#
# 프리셋 (CLAUDE.md 2절):
#   console (기본) B2B 서비스, 관리자, 운영 도구. 1440 전체 화면
#   web            고객용 반응형 사이트. 데스크톱 1440 + 프레임 안 모바일 393 (ResponsiveSite)
#   app            모바일 앱. iPhone 16 Pro 프레임 1대 (PhoneFrame)
#
# 만드는 것: components/ lib/ src/ styles/ 빈 폴더, _reference.md(프리셋 기록), .visual-pending
# 만들지 않는 것: design.md (design-intake 스킬 5단계에서 씀. 빈 파일을 두면 게이트 훅이 막음)
#
# --with-admin: 관리자 콘솔에 별도 URL만 주는 얇은 엔트리 형제(<이름>-admin). 실제 관리자 화면은
#   본 프로젝트 components/admin/ 안에 둠. 엔트리와 함께 시드 admin-app.tsx를 만들어 스캐폴드
#   직후에도 워크스페이스가 컴파일되게 함 (CLAUDE.md "공유 컴파일 단위").
# --with-mobile: console 프리셋 전용. 완전히 독립된 모바일 형제(<이름>-mobile, app 프리셋).
#   자체 spec.md, design-intake, design.md를 따로 거침.
# ------------------------------------------------------------------

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BASE_DIR="$ROOT_DIR/projects"
USAGE="사용법: bash scripts/scaffold.sh <카테고리>/<프로젝트명> [console|web|app] [--with-admin] [--with-mobile]"

NEW_PATH=""
PRESET=""
WITH_ADMIN=0
WITH_MOBILE=0

while [ $# -gt 0 ]; do
  case "$1" in
    --with-admin)  WITH_ADMIN=1 ;;
    --with-mobile) WITH_MOBILE=1 ;;
    -*) echo "알 수 없는 옵션: $1"; echo "$USAGE"; exit 1 ;;
    *)
      if [ -z "$NEW_PATH" ]; then NEW_PATH="$1"
      elif [ -z "$PRESET" ]; then PRESET="$1"
      else echo "인자가 너무 많음: $1"; echo "$USAGE"; exit 1
      fi ;;
  esac
  shift
done

[ -z "$NEW_PATH" ] && { echo "$USAGE"; exit 1; }
PRESET="${PRESET:-console}"
case "$PRESET" in
  console|web|app) ;;
  *) echo "알 수 없는 프리셋: $PRESET (console, web, app 중 하나)"; exit 1 ;;
esac

CATEGORY="${NEW_PATH%%/*}"
NEW_NAME="${NEW_PATH#*/}"
if [ "$CATEGORY" = "$NEW_NAME" ] || [ -z "$NEW_NAME" ]; then
  echo "'<카테고리>/<프로젝트명>' 형식으로 입력. 예: b2b/partloop"; exit 1
fi
if ! [[ "$NEW_NAME" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "프로젝트명은 소문자, 숫자, 하이픈만 사용 (URL이 됨): $NEW_NAME"; exit 1
fi
if [ "$WITH_MOBILE" -eq 1 ] && [ "$PRESET" != "console" ]; then
  echo "--with-mobile은 console 프리셋에서만 사용 (app은 이미 모바일, web은 모바일 화면을 포함)"; exit 1
fi

TARGET="$BASE_DIR/$CATEGORY/$NEW_NAME"
ADMIN_TARGET="$BASE_DIR/$CATEGORY/$NEW_NAME-admin"
MOBILE_TARGET="$BASE_DIR/$CATEGORY/$NEW_NAME-mobile"

# spec.md만 미리 있는 것은 허용 (spec을 먼저 써두는 관례). 그 외가 있으면 이미 만든 프로젝트로 보고 중단.
check_target() {
  local target="$1"
  if [ -d "$target" ]; then
    local unexpected
    unexpected="$(find "$target" -mindepth 1 -maxdepth 1 ! -name 'spec.md')"
    if [ -n "$unexpected" ]; then echo "이미 존재하는 프로젝트: $target"; exit 1; fi
    echo "  기존 spec.md 유지: ${target#$ROOT_DIR/}"
  fi
}
check_target "$TARGET"
[ "$WITH_ADMIN" -eq 1 ] && check_target "$ADMIN_TARGET"
[ "$WITH_MOBILE" -eq 1 ] && check_target "$MOBILE_TARGET"

make_skeleton() {
  local target="$1" preset="$2" note="${3:-}"
  mkdir -p "$target/components" "$target/lib" "$target/src" "$target/styles" "$target/assets"
  touch "$target/.visual-pending"
  {
    echo "# 프로젝트 기록"
    echo
    echo "- 프리셋: $preset"
    [ -n "$note" ] && echo "- $note"
    echo
    echo "훅과 design-intake가 위 프리셋 줄을 읽음. 바꾸려면 이 줄과 spec.md의 \`프리셋:\` 줄을 함께 고침."
    echo
    echo "## 참고 문서"
    echo
    echo "- 디자인 절차: \`.claude/skills/design-intake/SKILL.md\`"
    echo "- 프리셋 기준: \`.claude/skills/design-intake/references/$preset.md\`"
    echo "- 공용 컴포넌트: \`components/shared/\` (복사하지 않고 \`@/components/shared/...\`로 import)"
  } > "$target/_reference.md"
}

echo "생성: ${TARGET#$ROOT_DIR/} (프리셋: $PRESET)"
ADMIN_NOTE=""
[ "$WITH_ADMIN" -eq 1 ] && ADMIN_NOTE="관리자: $CATEGORY/$NEW_NAME-admin (화면 코드는 이 프로젝트 components/admin/)"
make_skeleton "$TARGET" "$PRESET" "$ADMIN_NOTE"

if [ "$WITH_MOBILE" -eq 1 ]; then
  echo "생성: ${MOBILE_TARGET#$ROOT_DIR/} (프리셋: app, 모바일 형제)"
  make_skeleton "$MOBILE_TARGET" "app" "본 프로젝트: $CATEGORY/$NEW_NAME (같은 제품의 모바일 앱)"
fi

if [ "$WITH_ADMIN" -eq 1 ]; then
  mkdir -p "$TARGET/components/admin" "$ADMIN_TARGET/src"
  COMPONENT_NAME="$(echo "$NEW_NAME" | awk -F'-' '{for(i=1;i<=NF;i++) printf toupper(substr($i,1,1)) substr($i,2); print ""}')"

  # 셸 스크립트가 쓰는 파일이라 게이트 훅을 거치지 않음. 시드는 의존성 0 (Tailwind 유틸리티만).
  cat > "$TARGET/components/admin/admin-app.tsx" <<EOF
"use client";

// scaffold.sh가 만든 시드. 지우지 말고 교체함 (AdminApp named export 유지).
// 이 파일이 없으면 $NEW_NAME-admin 엔트리의 import가 깨져 워크스페이스 전체 URL이 500이 됨.
// 교체한 AdminApp은 초기 화면을 ?screen=<name>에서 읽어야 시각 검증 캡처가 가능함.
export function AdminApp() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-white px-6">
      <h1 className="text-[20px] font-semibold text-neutral-900">관리자 콘솔 준비 중</h1>
    </main>
  );
}
EOF

  cat > "$ADMIN_TARGET/src/index.tsx" <<EOF
"use client";

// 관리자 콘솔에 별도 URL(/$CATEGORY/$NEW_NAME-admin)을 주기 위한 얇은 엔트리.
// 실제 화면은 projects/$CATEGORY/$NEW_NAME/components/admin/ 안에 있음.
import { AdminApp } from "@/projects/$CATEGORY/$NEW_NAME/components/admin/admin-app";

export default function ${COMPONENT_NAME}Admin() {
  return <AdminApp />;
}
EOF

  cat > "$ADMIN_TARGET/src/meta.ts" <<EOF
export const meta = {
  title: "$COMPONENT_NAME 관리자",
  description: "$COMPONENT_NAME 관리자 콘솔. spec.md의 관리자 IA에 맞춰 교체함.",
};
EOF
  echo "생성: ${ADMIN_TARGET#$ROOT_DIR/}/src (얇은 엔트리) + components/admin/admin-app.tsx (시드)"
fi

echo
echo "다음 순서 (CLAUDE.md 3절)"
[ -f "$TARGET/spec.md" ] || echo "  0. projects/$CATEGORY/$NEW_NAME/spec.md 작성 (아직 없음)"
echo "  1. design-intake 실행:"
echo "     python3 .claude/skills/design-intake/scripts/intake.py --project projects/$CATEGORY/$NEW_NAME --query \"<영어 질의어>\""
echo "  2. pages/$PRESET.md의 '프로젝트 판단' 절과 design.md 작성 (끝나기 전에는 게이트 훅이 .tsx 작성을 막음)"
echo "  3. 리프부터 빌드: lib/ -> components/ -> 셸 -> src/index.tsx (?screen= 지원)"
case "$PRESET" in
  console) echo "  4. 시각 검증: npm run visual -- $CATEGORY $NEW_NAME <화면...> --device=console" ;;
  web)     echo "  4. 시각 검증: npm run visual -- $CATEGORY $NEW_NAME <화면...> --device=web (src/index.tsx는 <ResponsiveSite>로 감쌈)" ;;
  app)     echo "  4. 시각 검증: npm run visual -- $CATEGORY $NEW_NAME <화면...>" ;;
esac
[ "$WITH_ADMIN" -eq 1 ] && echo "     관리자: npm run visual -- $CATEGORY $NEW_NAME-admin <화면...> --device=console"
[ "$WITH_MOBILE" -eq 1 ] && echo "  모바일 형제는 자체 spec.md를 쓰고 1~4단계를 따로 거침 (같은 제품이면 컬러는 본 프로젝트와 맞춤)"
echo "  5. 리뷰어 3개 병렬 판정 후 .visual-pending 삭제"

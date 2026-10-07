#!/usr/bin/env python3
"""design-intake: UI UX Pro Max 디자인 시스템을 생성하고 워크스페이스 규칙으로 걸러 저장함.

사용 예:
  python3 .claude/skills/design-intake/scripts/intake.py \
      --project projects/b2b/partloop \
      --query "B2B procurement purchase order supplier management"

하는 일:
  1. 프리셋(console|web|app)과 다이얼을 정함 (spec.md의 `프리셋:`, `다이얼:` 줄이 우선)
  2. UUPM search.py --design-system --json 실행
  3. 결과 검사 (폰트 무드, 스타일, 패턴). 문제가 있으면 폰트는 대체 후보로 자동 교체, 스타일은 경고
  4. MASTER.md 저장 (UUPM 원본, 프로젝트 폴더 안)
  5. pages/<preset>.md override 저장 (버린 것, 대체한 것, 폰트 정책)
  6. .intake.json 기록 (pre-write-design-gate 훅이 이 파일을 확인함)

종료 코드: 0 통과, 2 검사 경고가 있어 에이전트 확인 필요 (파일은 저장됨), 1 실행 실패
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

PRESETS = {
    # 다이얼: variance / motion / density
    "console": {"dials": (4, 3, 8), "font_query": "dashboard admin enterprise professional"},
    "web": {"dials": (7, 5, 4), "font_query": "modern brand website"},
    "app": {"dials": (7, 6, 5), "font_query": "modern mobile app friendly"},
}

# 프리셋별로 결과에서 걸러낼 신호. 소문자 부분 일치.
FONT_MOOD_FLAGS = {
    "console": ["academia", "library", "victorian", "antique", "parchment", "wedding", "romantic", "playful",
                "handwrit", "script", "kids", "comic", "gothic", "horror", "vintage", "retro", "fashion", "luxury"],
    "web": ["academia", "victorian", "gothic", "horror", "parchment"],
    "app": ["academia", "victorian", "gothic", "horror", "parchment", "antique"],
}
STYLE_FLAGS = {
    "console": ["glass", "liquid", "claymorphism", "neumorphism", "brutalism", "aurora", "y2k", "vaporwave",
                "cyberpunk", "skeuomorph", "3d", "parallax", "storytelling", "motion-driven"],
    "web": ["y2k", "vaporwave"],
    "app": ["brutalism", "y2k", "vaporwave"],
}
# 디스플레이 폰트로 쓰지 않는 것: 너무 흔해서 AI 기본값처럼 보이거나, 모노스페이스라 ID 전용이어야 하는 것
DISPLAY_FONT_BLOCK = ["inter", "geist", "roboto", "arial", "helvetica", "system-ui", "sf pro"]
MONO_HINT = ["mono", "code", "courier"]

# 숫자 자릿수 고정 지원 여부 (fontsource woff로 직접 확인함, 2026-10). True: tnum 기능 또는 기본 고정폭 숫자
# 새 폰트는 references/font-map.md의 확인 방법으로 검사 후 추가
FONT_TNUM = {
    "Plus Jakarta Sans": True, "Manrope": True, "Space Grotesk": True, "Outfit": True, "Sora": True,
    "Work Sans": True, "Montserrat": True, "Fira Sans": True, "IBM Plex Sans": True, "Source Sans 3": True,
    "Lora": True, "DM Sans": False, "Lexend": False, "Poppins": False,
}

# 프리셋별로 MASTER.md에서 항상 버리는 항목
ALWAYS_DROP = {
    "console": [
        ("Page Pattern", "랜딩 페이지 섹션 구조라 콘솔과 무관함. 셸과 화면 구성은 references/console.md를 따름"),
        ("Motion (GSAP 스니펫)", "스크롤 등장 연출은 업무 화면에서 방해가 됨. motion/react로 화면 전환 페이드와 상태 피드백만"),
        ("Card hover translateY, 카드 전체 cursor-pointer", "클릭 안 되는 카드가 눌리는 것처럼 보임. 클릭 가능한 행과 버튼에만 hover"),
        ("Secondary Button 2px 테두리", "표 중심 화면에서 시선을 과하게 끎. 1px로 낮춤"),
        ("Modal backdrop-filter blur", "필요할 때만 불투명 스크림으로"),
        ("본문 16px 규칙", "모바일 기준이라 콘솔에는 적용 안 함. 본문 13.5~14px, 표 13~13.5px"),
    ],
    "app": [
        ("Page Pattern", "랜딩 페이지 섹션 구조라 앱 화면과 무관함. references/app.md를 따름"),
        ("Motion (GSAP 스니펫)", "앱은 motion/react 사용. 스크롤 트리거 연출 금지"),
        ("Modal backdrop-filter blur", "기기 프레임 모서리 흰 틈 버그와 같은 원인. 불투명 시트로"),
    ],
    "web": [
        ("Motion (GSAP 스니펫)", "워크스페이스는 motion/react 사용. 필요하면 같은 의도로 옮겨 씀"),
    ],
}


def find_root(start: Path) -> Path:
    for p in [start, *start.parents]:
        if (p / ".claude/skills/ui-ux-pro-max/scripts/search.py").exists():
            return p
    sys.exit("[intake] .claude/skills/ui-ux-pro-max/scripts/search.py를 찾지 못함. 워크스페이스 루트에서 실행해야 함")


def read_spec_options(project: Path) -> dict:
    opts = {}
    for name in ("spec.md", "_reference.md"):
        f = project / name
        if not f.exists():
            continue
        for line in f.read_text(encoding="utf-8").splitlines():
            m = re.match(r"^\s*-?\s*(프리셋|다이얼|플랫폼|디자인시스템)\s*:\s*(.+)$", line)
            if m and m.group(1) not in opts:
                opts[m.group(1)] = m.group(2).strip()
    return opts


def preset_from(opts: dict, cli: str | None) -> str:
    if cli:
        return cli
    for key in ("프리셋",):
        v = opts.get(key, "").lower()
        for p in PRESETS:
            if p in v:
                return p
    plat = opts.get("플랫폼", "")
    if re.search(r"console|콘솔|관리자|admin|business", plat, re.I):
        return "console"
    if re.search(r"app|앱|mobile|모바일", plat, re.I):
        return "app"
    if re.search(r"web|웹|사이트", plat, re.I):
        return "web"
    return "console"


def dials_from(opts: dict, preset: str) -> tuple[int, int, int]:
    v = opts.get("다이얼")
    if v:
        nums = [int(x) for x in re.findall(r"\d+", v)][:3]
        if len(nums) == 3 and all(1 <= n <= 10 for n in nums):
            return tuple(nums)  # type: ignore[return-value]
    return PRESETS[preset]["dials"]


def run_search(root: Path, args: list[str]) -> dict:
    cmd = [sys.executable, str(root / ".claude/skills/ui-ux-pro-max/scripts/search.py"), *args]
    r = subprocess.run(cmd, capture_output=True, text=True, cwd=root)
    if r.returncode != 0:
        sys.exit(f"[intake] UUPM 실행 실패\n{r.stderr or r.stdout}")
    try:
        return json.loads(r.stdout)
    except json.JSONDecodeError:
        return {"raw": r.stdout}


def hits(text: str, words: list[str]) -> list[str]:
    t = (text or "").lower()
    return [w for w in words if w in t]


def font_ok(heading: str, mood: str, preset: str) -> list[str]:
    problems = []
    h = heading.lower()
    if any(b == h or h.startswith(b + " ") for b in DISPLAY_FONT_BLOCK):
        problems.append(f"'{heading}'는 디스플레이 폰트 금지 목록(흔한 기본값)에 있음")
    if any(m in h for m in MONO_HINT):
        problems.append(f"'{heading}'는 모노스페이스라 ID, 코드 전용")
    bad = hits(mood, FONT_MOOD_FLAGS[preset])
    if bad:
        problems.append(f"폰트 무드가 {preset}와 안 맞음: {', '.join(bad)}")
    return problems


def used_fonts(root: Path, project: Path) -> dict[str, int]:
    """다른 프로젝트들이 이미 쓴 디스플레이 폰트 (프로젝트끼리 같은 인상이 되는 것을 막기 위함)"""
    used: dict[str, int] = {}
    for f in root.glob("projects/*/*/.intake.json"):
        if f.parent == project:
            continue
        try:
            name = json.loads(f.read_text(encoding="utf-8")).get("display_font")
        except Exception:
            continue
        if name:
            used[name] = used.get(name, 0) + 1
    return used


def pick_font(root: Path, preset: str, query: str, used: dict[str, int]) -> tuple[dict | None, list[str]]:
    tried, ok = [], []
    for q in (PRESETS[preset]["font_query"], f"{query} typography"):
        res = run_search(root, [q, "--domain", "typography", "--json", "-n", "8"])
        for r in res.get("results", []):
            name = r.get("Heading Font", "")
            if name in tried:
                continue
            tried.append(name)
            if not font_ok(name, r.get("Mood/Style Keywords", ""), preset):
                ok.append(r)
    if not ok:
        return None, tried
    # 콘솔은 숫자가 많으므로 tnum 확인된 폰트 우선. 그다음 아직 안 쓴 폰트, 덜 쓴 순서
    def rank(r):
        t = FONT_TNUM.get(r["Heading Font"])
        tnum_penalty = 0 if t else (1 if t is None else 2)
        return (tnum_penalty if preset == "console" else 0, used.get(r["Heading Font"], 0))
    ok.sort(key=rank)
    return ok[0], tried


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--project", required=True, help="projects/<category>/<project>")
    ap.add_argument("--query", required=True, help="영어 질의어 2~5개 (업종 + 제품 유형 + 톤)")
    ap.add_argument("--name", help="디자인 시스템 이름 (기본: 프로젝트 폴더명)")
    ap.add_argument("--preset", choices=list(PRESETS), help="생략하면 spec.md / _reference.md에서 읽음, 없으면 console")
    ap.add_argument("--font", help="디스플레이 폰트를 직접 지정 (자동 교체 결과가 마음에 안 들 때)")
    ap.add_argument("--force", action="store_true", help="기존 MASTER.md를 덮어씀 (같은 프로젝트를 다시 intake할 때)")
    a = ap.parse_args()

    root = find_root(Path.cwd().resolve())
    project = (root / a.project).resolve()
    if not (project / "spec.md").exists():
        sys.exit(f"[intake] {a.project}/spec.md가 없음. scaffold 후 spec.md를 먼저 넣어야 함")

    opts = read_spec_options(project)
    preset = preset_from(opts, a.preset)
    v, m, d = dials_from(opts, preset)
    name = a.name or project.name
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")

    base = [a.query, "--design-system", "-p", name, "--variance", str(v), "--motion", str(m), "--density", str(d)]
    ds = run_search(root, [*base, "--json"])["design_system"]

    warnings: list[str] = []
    replaced: list[tuple[str, str, str]] = []

    # 0. spec의 디자인시스템 줄: 지정 문서가 있으면 컬러와 타이포는 그 문서가 이김 (CLAUDE.md 5절)
    ds_name = opts.get("디자인시스템")
    if ds_name:
        stem = Path(ds_name.strip()).stem
        doc = root / "design-systems" / f"{stem}.md"
        if doc.exists():
            notes_pre = f"spec이 디자인시스템 '{stem}'을 지정함. 컬러와 타이포는 {doc.relative_to(root)}가 MASTER.md를 대신함. design.md에 반영"
        else:
            notes_pre = ""
            warnings.append(f"spec이 디자인시스템 '{stem}'을 지정했지만 design-systems/{stem}.md가 없음. 파일을 추가하거나 spec에서 그 줄을 지움")
    else:
        notes_pre = ""

    # 1. 스타일 검사
    style_name = ds["style"].get("name", "")
    bad_style = hits(f"{style_name} {ds['style'].get('keywords', '')}", STYLE_FLAGS[preset])
    if bad_style:
        warnings.append(f"스타일 '{style_name}'에 {preset}와 안 맞는 신호: {', '.join(bad_style)}. 질의어를 좁혀 재실행하거나 --domain style로 대체 검토")

    # 2. 폰트 검사와 자동 교체
    used = used_fonts(root, project)
    typo = ds["typography"]
    display = a.font or typo.get("heading", "")
    font_note = "UUPM 추천 그대로"
    if a.font:
        font_note = "에이전트가 --font로 지정"
    else:
        problems = font_ok(display, typo.get("mood", ""), preset)
        if problems:
            cand, tried = pick_font(root, preset, a.query, used)
            if cand:
                replaced.append(("디스플레이 폰트", display, cand["Heading Font"]))
                font_note = f"자동 교체. 원래 추천 '{display}': {'; '.join(problems)}"
                display = cand["Heading Font"]
            else:
                warnings.append(f"폰트 문제({'; '.join(problems)}) 대체 후보를 못 찾음. 시도: {', '.join(tried)}. --font로 직접 지정 필요")

    if used.get(display, 0) >= 2:
        warnings.append(f"디스플레이 폰트 '{display}'를 이미 프로젝트 {used[display]}개가 사용 중. 인상이 겹칠 수 있으니 --font로 다른 후보 검토")

    serif = bool(re.search(r"serif|garamond|playfair|lora|merriweather|crimson|cormorant|libre baskerville", display, re.I)) and "sans" not in display.lower()

    # 3. 카테고리는 기계가 판단할 수 없으므로 리포트에 노출만
    category = ds.get("category", "")

    # 4. MASTER.md 저장 (UUPM 원본)
    master = project / "design-system" / slug / "MASTER.md"
    existed = master.exists()
    persist = [*base, "--persist", "--output-dir", str(project)]
    if a.force:
        persist.append("--force")
    r = subprocess.run([sys.executable, str(root / ".claude/skills/ui-ux-pro-max/scripts/search.py"), *persist], capture_output=True, text=True, cwd=root)
    if not master.exists():
        sys.exit(f"[intake] MASTER.md 저장 실패\n{r.stdout}\n{r.stderr}")
    notes: list[str] = [notes_pre] if notes_pre else []
    if existed and not a.force:
        notes.append("기존 MASTER.md가 있어 덮어쓰지 않음. 새 결과로 바꾸려면 --force")

    # 5. override 저장
    pages = master.parent / "pages"
    pages.mkdir(exist_ok=True)
    override = pages / f"{preset}.md"
    lines = [
        f"# {name} {preset} override (MASTER.md보다 우선)",
        "",
        "design-intake가 생성함. 아래 '프로젝트 판단' 절은 에이전트가 채움.",
        "",
        "## intake 기록",
        f"- 질의어: `{a.query}`",
        f"- 프리셋: {preset}, 다이얼 V{v} / M{m} / D{d}",
        f"- UUPM 카테고리: {category} (spec의 업종과 맞는지 에이전트가 확인)",
        f"- 스타일: {style_name}",
        "",
        "## 버린 것",
        *[f"- {k}: {why}" for k, why in ALWAYS_DROP[preset]],
        "",
        "## 대체한 것",
        *([f"- {k}: {old} → {new}" for k, old, new in replaced] or ["- 없음"]),
        "",
        "## 폰트 (워크스페이스 정책 적용)",
        "- 본문, 라벨, 버튼, 입력칸: Pretendard",
        ("- 한글 제목: Pretendard (console)" if preset == "console" else "- 한글 제목: 한글 디스플레이 폰트 1개 허용. references/font-map.md에서 무드에 맞게 골라 아트 디렉션에 적음"),
        f"- 디스플레이(제목 영문, KPI 숫자, 금액): {display} ({font_note})",
        f'- CSS: `--font-display: "{display}", "Pretendard Variable", Pretendard, sans-serif`',
        {True: f"- 숫자: {display}에 tabular-nums 적용 (지원 확인됨)",
         False: f"- 숫자: {display}는 고정폭 숫자 미지원. KPI, 금액, 표 숫자는 Pretendard + tabular-nums로",
         None: f"- 숫자: {display}의 고정폭 숫자 지원 미확인. references/font-map.md 방법으로 확인 후 이 줄 수정"}[FONT_TNUM.get(display)],
        *(["- 세리프 추천이므로 한글 제목은 references/font-map.md의 세리프 매핑을 따름"] if serif else []),
        "- 코드, ID, 해시만 모노스페이스",
        "",
    ]
    # 재실행해도 에이전트가 이미 채운 판단 절은 보존
    kept = ""
    if override.exists():
        prev = override.read_text(encoding="utf-8").split("## 프로젝트 판단", 1)
        if len(prev) == 2 and "(에이전트가 작성)" not in prev[1]:
            kept = "## 프로젝트 판단" + prev[1].rstrip("\n")
    lines += [kept] if kept else [
        "## 프로젝트 판단 (에이전트가 작성)",
        "- 상태 색 표: 상태명 / 글자 / 배경 / 아이콘",
        "- 셸과 레이아웃 선택, 배제한 후보와 이유",
        "- 보조 검색으로 보강한 것 (--domain product / ux 결과)",
    ]
    override.write_text("\n".join(lines) + "\n", encoding="utf-8")

    status = "warn" if warnings else "ok"
    (project / ".intake.json").write_text(json.dumps({
        "status": status, "preset": preset, "dials": [v, m, d], "query": a.query, "slug": slug,
        "category": category, "style": style_name, "display_font": display, "replaced": replaced,
        "warnings": warnings, "at": datetime.now().isoformat(timespec="seconds"),
    }, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"[intake] {status.upper()}  {a.project}  preset={preset}  dials=V{v}/M{m}/D{d}")
    print(f"  카테고리: {category}  스타일: {style_name}")
    print(f"  컬러: primary {ds['colors'].get('primary')}  accent {ds['colors'].get('accent')}  bg {ds['colors'].get('background')}")
    print(f"  디스플레이 폰트: {display} ({font_note})")
    for k, old, new in replaced:
        print(f"  교체: {k} {old} → {new}")
    for w in warnings:
        print(f"  경고: {w}")
    for n in notes:
        print(f"  참고: {n}")
    print(f"  저장: {master.relative_to(root)}, {override.relative_to(root)}, {(project / '.intake.json').relative_to(root)}")
    if preset == "console":
        print("  다음: override의 '프로젝트 판단' 절을 채우고 design.md를 쓴 뒤 UI 작성")
    else:
        print("  다음: references/art-direction.md로 아트 디렉션(무드, 레퍼런스 3개, 시그니처 2개+)을 정하고,")
        print("        override의 '프로젝트 판단' 절과 design.md(아트 디렉션, 더한 것 포함)를 쓴 뒤 UI 작성")
    return 2 if warnings else 0


if __name__ == "__main__":
    sys.exit(main())

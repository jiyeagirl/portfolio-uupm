#!/usr/bin/env node
// PostToolUse (Write|Edit|MultiEdit): fast, file-local checks on project code.
//
// Blocks (exit 2, Claude must fix right away):
//   - em dash / interpunct in the text Claude just wrote (CLAUDE.md Typography)
//   - an import that does not resolve. The project route bundles every
//     projects/*/*/src into one compile unit, so one missing module 500s every
//     project URL in the workspace (CLAUDE.md "공유 컴파일 단위").
//   - a new `@iconify/react` import (CLAUDE.md Components: Phosphor only)
// Notes without blocking (additionalContext):
//   - backdrop-blur / backdrop-filter just written into a screen shown in the phone frame
//     (CLAUDE.md "Device edge integrity")

import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const input = JSON.parse(readFileSync(0, "utf8"));
const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const filePath = input.tool_input?.file_path;
if (!filePath) process.exit(0);

const rel = path.relative(root, filePath).split(path.sep).join("/"); // Windows 경로 구분자 정규화
const match = rel.match(/^projects\/([^/]+)\/([^/]+)\/.+\.(tsx|ts)$/);
if (!match || !existsSync(filePath)) process.exit(0);

const projectDir = path.join(root, "projects", match[1], match[2]);
const source = readFileSync(filePath, "utf8");
const errors = [];
const notes = [];

// Only what was just written, so old files are not re-litigated on every edit.
const written = [
  input.tool_input.content,
  input.tool_input.new_string,
  ...(input.tool_input.edits ?? []).map((e) => e.new_string),
]
  .filter(Boolean)
  .join("\n");

// Comments are exempt (CLAUDE.md Typography). An Edit's new_string can start in
// the middle of a block comment, so JSDoc-style `*` lines are dropped too.
const codeLines = (text) =>
  text
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((line) => (/^\s*(\/\/|\*|\/\*)/.test(line) ? "" : line.replace(/(^|[\s;{}(),])\/\/.*$/, "$1")));

const writtenCode = new Set(codeLines(written).filter((l) => /[—·]/.test(l)).map((l) => l.trim()));
if (writtenCode.size > 0) {
  source.split("\n").forEach((line, i) => {
    if (writtenCode.has(line.trim())) {
      errors.push(`${rel}:${i + 1} em dash(—) 또는 중간점(·): ${line.trim().slice(0, 80)}`);
    }
  });
  if (errors.length === 0) {
    for (const l of writtenCode) errors.push(`${rel}: em dash(—) 또는 중간점(·): ${l.slice(0, 80)}`);
  }
  errors.push("  → 문장 안 나열은 쉼표, 복합 라벨은 슬래시, 메타 정보 나열은 파이프(|)로 바꾼다.");
}

const EXTS = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".json"];
const resolves = (base) => {
  for (const ext of EXTS) {
    const p = base + ext;
    if (existsSync(p) && statSync(p).isFile()) return true;
  }
  for (const idx of ["index.ts", "index.tsx", "index.js"]) {
    if (existsSync(path.join(base, idx))) return true;
  }
  return false;
};

const specifiers = [
  ...source.matchAll(/(?:import|export)\s[^'"]*?from\s*["']([^"']+)["']/g),
  ...source.matchAll(/import\s*\(\s*["']([^"']+)["']\s*\)/g),
  ...source.matchAll(/^\s*import\s*["']([^"']+)["']/gm),
].map((m) => m[1]);

for (const spec of new Set(specifiers)) {
  let base;
  if (spec.startsWith("@/")) base = path.join(root, spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(filePath), spec);
  else continue;
  if (!resolves(base)) {
    errors.push(
      `${rel}: import "${spec}" 를 찾을 수 없다. 이대로면 워크스페이스의 모든 프로젝트 URL이 500이다. ` +
        "대상 파일을 먼저 만들거나 import를 지운다 (CLAUDE.md 공유 컴파일 단위).",
    );
  }
}

if (/from\s*["']@iconify\/react["']/.test(written)) {
  errors.push(`${rel}: @iconify/react import. 새 코드는 Phosphor(@phosphor-icons/react)만 쓴다 (CLAUDE.md Components).`);
}

// Screens that end up inside the phone frame: app projects, and web projects
// (their mobile view runs in the frame). Decided from the scaffold's preset line
// first, because src/index.tsx is written last.
const referencePath = path.join(projectDir, "_reference.md");
const indexPath = path.join(projectDir, "src", "index.tsx");
const preset = existsSync(referencePath)
  ? readFileSync(referencePath, "utf8").match(/^- 프리셋: *(app|web|console)/m)?.[1]
  : undefined;
const indexSource = existsSync(indexPath) ? readFileSync(indexPath, "utf8") : "";
const inPhoneFrame =
  !rel.includes("/components/admin/") &&
  (preset === "app" || preset === "web" || /PhoneFrame|ResponsiveSite/.test(indexSource));
if (inPhoneFrame) {
  codeLines(written).forEach((line) => {
    if (/backdrop-blur|backdrop-filter|backdropFilter/.test(line)) {
      notes.push(`${rel}: backdrop-blur  ${line.trim().slice(0, 80)}`);
    }
  });
  if (notes.length > 0) {
    notes.push(
      "  → 탭바, 고정 CTA, 앱바처럼 화면 가장자리에 붙는 요소라면 불투명 색으로 바꾼다 " +
        "(기기 둥근 모서리 밖으로 흰 틈이 샌다). 가장자리에 닿지 않는 떠 있는 칩이면 그대로 둬도 된다.",
    );
  }
}

if (errors.length > 0) {
  console.error(["[post-edit-check] 고쳐야 할 것:", ...errors, ...notes].join("\n"));
  process.exit(2);
}
if (notes.length > 0) {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: ["[post-edit-check] 확인할 것:", ...notes].join("\n"),
      },
    }),
  );
}
process.exit(0);

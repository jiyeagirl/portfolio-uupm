#!/usr/bin/env node
// Stop: a project created by scaffold.sh carries a `.visual-pending` marker
// until its visual verification loop (CLAUDE.md 4절 "시각 검증과 리뷰") is done.
//
// Only projects this session actually wrote to are checked, so a forgotten
// marker on some other project never interrupts unrelated work. The Stop hook
// runs at the end of every turn; `stop_hook_active` lets the second attempt in
// the same turn through, so this reminds at most once per turn and never loops.
//
// A project scaffolded with --with-admin keeps its admin screens in
// components/admin/ but is captured through the `<name>-admin` URL, so those
// files are compared against `<name>-admin/.visual/report.json` instead.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const input = JSON.parse(readFileSync(0, "utf8"));
if (input.stop_hook_active) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const projectsDir = path.join(root, "projects");
if (!existsSync(projectsDir) || !input.transcript_path || !existsSync(input.transcript_path)) {
  process.exit(0);
}

// projects/<category>/<name> directories written to in this session. The
// "-admin" suffix is folded into its main project.
const touched = new Set();
for (const line of readFileSync(input.transcript_path, "utf8").split("\n")) {
  if (!line.includes('"tool_use"') || !line.includes("/projects/")) continue;
  let entry;
  try {
    entry = JSON.parse(line);
  } catch {
    continue;
  }
  if (entry.type !== "assistant") continue;
  for (const c of entry.message?.content ?? []) {
    if (c.type !== "tool_use" || !["Write", "Edit", "MultiEdit"].includes(c.name)) continue;
    const rel = path.relative(root, c.input?.file_path ?? "").split(path.sep).join("/"); // Windows 경로 구분자 정규화
    const m = rel.match(/^projects\/([^/]+)\/([^/]+)\//);
    if (m) touched.add(`${m[1]}/${m[2].replace(/-admin$/, "")}`);
  }
}
if (touched.size === 0) process.exit(0);

const newestCodeMtime = (dir, { skipAdmin = false } = {}) => {
  let newest = 0;
  if (!existsSync(dir)) return newest;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "screenshots" || entry.name === "assets") continue;
    if (skipAdmin && entry.name === "admin") continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) newest = Math.max(newest, newestCodeMtime(p, { skipAdmin }));
    else if (/\.(tsx|ts|css)$/.test(entry.name)) newest = Math.max(newest, statSync(p).mtimeMs);
  }
  return newest;
};

const reportState = (reportPath, codeMtime) => {
  if (!existsSync(reportPath)) return "캡처 기록(.visual/report.json)이 없다";
  if (codeMtime > statSync(reportPath).mtimeMs) return "마지막 캡처 이후 코드가 바뀌었다";
  return null;
};

const pending = [];
for (const key of touched) {
  const [category, name] = key.split("/");
  const dir = path.join(projectsDir, category, name);
  if (!existsSync(path.join(dir, ".visual-pending"))) continue;
  if (!existsSync(path.join(dir, "src", "index.tsx"))) continue;

  const adminDir = path.join(projectsDir, category, `${name}-admin`);
  const hasAdmin = existsSync(path.join(adminDir, "src", "index.tsx"));

  const reference = path.join(dir, "_reference.md");
  const preset = existsSync(reference)
    ? readFileSync(reference, "utf8").match(/^- 프리셋: *(app|web|console)/m)?.[1]
    : undefined;
  const deviceFlag = preset === "web" ? " --device=web" : preset === "console" ? " --device=console" : "";
  const main = reportState(
    path.join(dir, ".visual", "report.json"),
    newestCodeMtime(dir, { skipAdmin: hasAdmin }),
  );
  pending.push(
    `  - ${key}: ${main ? `${main} (npm run visual -- ${category} ${name} <화면...>${deviceFlag})` : "캡처는 최신이다. 리뷰 루프를 마쳤다면 .visual-pending을 지운다"}`,
  );

  if (hasAdmin) {
    const admin = reportState(
      path.join(adminDir, ".visual", "report.json"),
      newestCodeMtime(path.join(dir, "components", "admin")),
    );
    if (admin) {
      pending.push(`  - ${key}-admin: ${admin} (npm run visual -- ${category} ${name}-admin <화면...> --device=console)`);
    }
  }
}

if (pending.length === 0) process.exit(0);

console.log(
  JSON.stringify({
    decision: "block",
    reason: [
      "[visual-gate] 이번 세션에서 작업한 새 프로젝트의 시각 검증 루프가 끝나지 않았다:",
      ...pending,
      "CLAUDE.md 4절을 진행한다. npm run visual로 모든 화면을 캡처하고, 리뷰어 3개(review-domain, review-ux, review-visual)를 병렬로 띄워 판정받아 " +
        "고친 뒤(최대 2라운드) .visual-pending을 삭제한다. 사용자가 검증 전에 멈추라고 했거나 이번 작업이 " +
        "화면 빌드가 아니었다면, 그 사실을 요약에 적고 그대로 끝내도 된다.",
    ].join("\n"),
  }),
);
process.exit(0);

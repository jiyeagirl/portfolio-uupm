#!/usr/bin/env node
// PreToolUse(Write): 디자인 intake가 끝나기 전에 새 UI 파일(.tsx)을 만들지 못하게 막음.
// 확인 항목: .intake.json, design-system/<slug>/MASTER.md, pages/<preset>.md(프로젝트 판단 절 작성), design.md
// -admin 프로젝트는 형제 메인 프로젝트의 intake를 따름.
import { readFileSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

let input = "";
for await (const chunk of process.stdin) input += chunk;
let data;
try {
  data = JSON.parse(input);
} catch {
  process.exit(0);
}

const root = data.cwd || process.cwd();
const file = data.tool_input?.file_path;
if (!file || !file.endsWith(".tsx") || existsSync(file)) process.exit(0); // 새 .tsx만 검사

const rel = relative(root, file).split(sep);
// projects/<category>/<project>/(src|components)/...
if (rel[0] !== "projects" || rel.length < 5 || !["src", "components"].includes(rel[3])) process.exit(0);

let project = join(root, "projects", rel[1], rel[2]);
if (rel[2].endsWith("-admin")) {
  const main = join(root, "projects", rel[1], rel[2].replace(/-admin$/, ""));
  if (existsSync(main)) project = main;
}
const projRel = relative(root, project);
const problems = [];

const intakePath = join(project, ".intake.json");
let intake = null;
if (!existsSync(intakePath)) {
  problems.push(`${projRel}/.intake.json 없음. design-intake 스킬을 먼저 실행해야 함`);
} else {
  try {
    intake = JSON.parse(readFileSync(intakePath, "utf8"));
  } catch {
    problems.push(".intake.json을 읽을 수 없음. intake 재실행 필요");
  }
}

if (intake) {
  const dsDir = join(project, "design-system", intake.slug);
  if (!existsSync(join(dsDir, "MASTER.md"))) problems.push(`design-system/${intake.slug}/MASTER.md 없음`);
  const ov = join(dsDir, "pages", `${intake.preset}.md`);
  if (!existsSync(ov)) {
    problems.push(`design-system/${intake.slug}/pages/${intake.preset}.md 없음`);
  } else {
    const text = readFileSync(ov, "utf8");
    const judged = text.split("## 프로젝트 판단")[1] || "";
    if (judged.includes("상태명 / 글자 / 배경 / 아이콘") || judged.includes("(에이전트가 작성)") || judged.split("\n").filter((l) => l.trim().startsWith("-")).length < 2) {
      problems.push(`pages/${intake.preset}.md의 '프로젝트 판단' 절이 템플릿 그대로임. 상태 색, 셸 선택, 보조 검색 결과를 채워야 함`);
    }
  }
  if (intake.status === "warn" && !existsSync(join(project, ".intake-ack"))) {
    problems.push(
      `intake 경고가 해결되지 않음: ${(intake.warnings || []).join(" / ")}. 질의를 바꿔 재실행하거나, 경고를 검토하고 그대로 가기로 했으면 이유를 design.md에 적고 ${projRel}/.intake-ack 파일을 만듦`,
    );
  }
}
const designMd = join(project, "design.md");
if (!existsSync(designMd)) {
  problems.push(`${projRel}/design.md 없음. 적용 판단과 근거를 먼저 씀`);
} else {
  const dm = readFileSync(designMd, "utf8");
  if (!/^해석\s*:/m.test(dm)) problems.push(`${projRel}/design.md에 '해석:' 줄이 없음. design-intake SKILL.md 5단계 형식으로 씀`);
  // 사용자 웹과 앱은 "틀리지 않음" 위에 인상이 있어야 함 (references/art-direction.md)
  if (intake && (intake.preset === "web" || intake.preset === "app")) {
    const section = (name) => (dm.split(new RegExp(`^## ${name}.*$`, "m"))[1] || "").split(/^## /m)[0];
    if (!/^## 아트 디렉션/m.test(dm)) {
      problems.push(`${projRel}/design.md에 '## 아트 디렉션' 절이 없음. references/art-direction.md 절차로 무드, 레퍼런스 3개, 시그니처 2개 이상을 씀`);
    }
    const added = section("더한 것").split("\n").filter((l) => l.trim().startsWith("-")).length;
    if (added < 2) problems.push(`${projRel}/design.md의 '## 더한 것'이 2줄 미만. 버리기만 하면 화면이 무난해짐`);
  }
}

if (problems.length) {
  process.stderr.write(`[design-gate] ${relative(root, file)} 작성 전에 해결 필요:\n- ${problems.join("\n- ")}\n자세한 순서는 .claude/skills/design-intake/SKILL.md\n`);
  process.exit(2);
}
process.exit(0);

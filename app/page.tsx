import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { ArrowUpRight, FolderSimple } from "@phosphor-icons/react/ssr";

type ProjectEntry = { category: string; project: string };

function discoverProjects(): ProjectEntry[] {
  const projectsRoot = path.join(process.cwd(), "projects");
  if (!fs.existsSync(projectsRoot)) return [];

  const entries: ProjectEntry[] = [];
  const categories = fs
    .readdirSync(projectsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

  for (const category of categories) {
    const categoryPath = path.join(projectsRoot, category.name);
    const projects = fs
      .readdirSync(categoryPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory());

    for (const project of projects) {
      const hasEntryPoint = ["index.tsx", "index.ts"].some((file) =>
        fs.existsSync(path.join(categoryPath, project.name, "src", file)),
      );
      if (hasEntryPoint) {
        entries.push({ category: category.name, project: project.name });
      }
    }
  }

  return entries;
}

function toLabel(slug: string) {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export default function WorkspaceHome() {
  const projects = discoverProjects();

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-[1000px] px-6 py-20 lg:px-10">
        <p className="text-[13px] font-medium tracking-[0.06em] text-muted">
          PORTFOLIO WORKSPACE
        </p>
        <h1 className="mt-3 text-[34px] font-bold leading-tight tracking-tight lg:text-[42px]">
          진행 중인 프로젝트
        </h1>
        <p className="mt-3 max-w-[52ch] text-[15px] leading-[1.7] text-muted">
          카테고리별로 정리된 포트폴리오 목업 프로젝트 목록입니다. 각 항목을
          선택하면 해당 프로젝트가 렌더링됩니다.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {projects.map(({ category, project }) => (
            <Link
              key={`${category}/${project}`}
              href={`/${category}/${project}`}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-surface-elevated p-6 transition-colors hover:border-accent/40"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-[12px] font-medium tracking-[0.04em] text-muted">
                  <FolderSimple size={14} weight="regular" />
                  {toLabel(category)}
                </div>
                <ArrowUpRight
                  size={18}
                  weight="regular"
                  className="text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                />
              </div>
              <h2 className="mt-6 text-[20px] font-semibold tracking-tight">
                {toLabel(project)}
              </h2>
              <p className="mt-1 text-[13px] text-muted">/{category}/{project}</p>
            </Link>
          ))}
        </div>

        {projects.length === 0 && (
          <p className="mt-12 text-[14px] text-muted">
            아직 등록된 프로젝트가 없습니다. `projects/&lt;category&gt;/&lt;project&gt;/src/index.tsx`를
            추가하면 이곳에 자동으로 표시됩니다.
          </p>
        )}
      </div>
    </main>
  );
}

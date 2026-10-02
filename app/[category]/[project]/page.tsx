import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Metadata is read from a separate, non-"use client" `src/meta.ts` module.
// A dynamic import of a "use client" module's named exports (other than the
// default component) does not carry real data across the client boundary
// when evaluated from a Server Component, so `meta` cannot live in `src/index`.
async function loadMeta(category: string, project: string) {
  try {
    const mod = (await import(`@/projects/${category}/${project}/src/meta`)) as {
      meta?: { title?: string; description?: string };
    };
    return mod.meta;
  } catch {
    return undefined;
  }
}

async function loadComponent(category: string, project: string) {
  try {
    const mod = (await import(`@/projects/${category}/${project}/src/index`)) as {
      default?: React.ComponentType;
    };
    return mod.default ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; project: string }>;
}): Promise<Metadata> {
  const { category, project } = await params;
  const meta = await loadMeta(category, project);

  return {
    title: meta?.title ?? project,
    description: meta?.description,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ category: string; project: string }>;
}) {
  const { category, project } = await params;
  const Component = await loadComponent(category, project);
  if (!Component) notFound();

  return <Component />;
}

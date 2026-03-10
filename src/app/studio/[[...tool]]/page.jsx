import { isSanityConfigured, projectId } from "@/sanity/env";

export const metadata = {
  title: "Austin Leads Studio",
  description: "Embedded Sanity Studio for the Austin Leads platform.",
};

export default function StudioPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-20">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Studio setup</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
          Sanity is configured in the repo and ready for content modeling.
        </h1>
        <p className="mt-4 text-base leading-8 text-muted-foreground">
          The schema, client, and publishing hooks are in place. This route stays as the CMS launchpad
          for now because the current Sanity studio runtime is not building cleanly in this Next 16
          setup yet.
        </p>
        <div className="mt-6 grid gap-3 rounded-2xl border border-border bg-muted/30 p-5 text-sm leading-7 text-muted-foreground">
          <div>
            <strong className="text-foreground">Project ID:</strong> {projectId || "not configured"}
          </div>
          <div>
            <strong className="text-foreground">Dataset:</strong>{" "}
            {isSanityConfigured() ? "configured" : "missing credentials"}
          </div>
          <div>
            <strong className="text-foreground">Schemas:</strong> <code>src/sanity/schemaTypes</code>
          </div>
          <div>
            <strong className="text-foreground">Publish flow:</strong> queue jobs can already hand off to
            Sanity when write credentials are present.
          </div>
        </div>
        <p className="mt-6 text-sm leading-7 text-muted-foreground">
          Configure <code className="rounded bg-muted px-1.5 py-0.5">NEXT_PUBLIC_SANITY_PROJECT_ID</code>,
          <code className="ml-1 rounded bg-muted px-1.5 py-0.5">NEXT_PUBLIC_SANITY_DATASET</code>, and
          <code className="ml-1 rounded bg-muted px-1.5 py-0.5">SANITY_API_WRITE_TOKEN</code> to enable
          live data reads and mutations from the app.
        </p>
      </div>
    </main>
  );
}

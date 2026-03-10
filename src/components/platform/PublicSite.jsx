import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHeroOverlayAppearance, hexToRgba } from "@/lib/platform/heroAppearance";

function HeroSection({ section }) {
  const heroImageUrl = section.heroImage?.urls?.regular || section.heroImage?.urls?.small;
  const hasHeroImage = Boolean(heroImageUrl);
  const heroTextColor = section.heroTextColor || (hasHeroImage ? "#ffffff" : "");
  const { overlayStyle } = getHeroOverlayAppearance(section);
  const heroMutedColor = heroTextColor ? hexToRgba(heroTextColor, 0.82) : undefined;
  const heroTextStyle = heroTextColor ? { color: heroTextColor } : undefined;
  const heroMutedStyle = heroMutedColor ? { color: heroMutedColor } : undefined;
  const badgeStyle = heroTextColor
    ? {
        color: heroTextColor,
        borderColor: hexToRgba(heroTextColor, 0.24),
        backgroundColor: hexToRgba(heroTextColor, 0.08),
      }
    : undefined;

  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.8),transparent_52%),linear-gradient(180deg,var(--site-surface),rgba(255,255,255,0.92))]">
      {hasHeroImage ? (
        <>
          <div className="absolute inset-0">
            <img
              alt={section.heroImage.alt || section.title}
              className="h-full w-full object-cover"
              src={heroImageUrl}
            />
          </div>
          <div
            className="absolute inset-0"
            style={overlayStyle}
          />
        </>
      ) : null}
      <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-[1.35fr_0.95fr] lg:px-10">
        <div className="space-y-6">
          <Badge
            variant="outline"
            className={heroTextColor ? "border-transparent bg-transparent" : "border-primary/20 bg-primary/5 text-foreground"}
            style={badgeStyle}
          >
            {section.eyebrow}
          </Badge>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-4xl tracking-tight text-foreground md:text-6xl" style={heroTextStyle}>
              {section.title}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground" style={heroMutedStyle}>
              {section.body}
            </p>
          </div>
          {section.actions?.length ? (
            <div className="flex flex-wrap gap-3 pt-2">
              {section.actions.map((action) => (
                <Button asChild key={action.href} variant={action.variant || "default"} size="lg">
                  <Link href={action.href}>{action.label}</Link>
                </Button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="space-y-4">
          {heroImageUrl ? (
            <Card className="shadow-theme-glass overflow-hidden border-white/15 bg-white/8 backdrop-blur">
              <CardContent className="space-y-2 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground" style={heroMutedStyle}>
                  Selected hero image
                </div>
                <p className="text-xs leading-6 text-muted-foreground" style={heroMutedStyle}>
                  Photo by{" "}
                  <a
                    className="underline-offset-4 hover:underline"
                    href={section.heroImage.creditUrl}
                    rel="noreferrer"
                    style={heroTextStyle}
                    target="_blank"
                  >
                    {section.heroImage.creditName}
                  </a>{" "}
                  on{" "}
                  <a
                    className="underline-offset-4 hover:underline"
                    href={section.heroImage.unsplashUrl}
                    rel="noreferrer"
                    style={heroTextStyle}
                    target="_blank"
                  >
                    Unsplash
                  </a>
                  .
                </p>
              </CardContent>
            </Card>
          ) : null}

          <Card className={hasHeroImage ? "shadow-theme-glass border-white/15 bg-white/8 backdrop-blur" : "shadow-theme-glass-soft border-border/70 bg-background/80 backdrop-blur"}>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground" style={heroMutedStyle}>
                Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {section.metrics?.map((metric) => (
                <div
                  className={hasHeroImage ? "rounded-xl border border-white/15 bg-white/8 px-4 py-4" : "rounded-xl border border-border/70 bg-card/90 px-4 py-4"}
                  key={metric.label}
                >
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground" style={heroMutedStyle}>
                    {metric.label}
                  </div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground" style={heroTextStyle}>
                    {metric.value}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function StorySection({ section }) {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-5xl px-6 py-24 text-center lg:px-10">
        <Badge variant="outline" className="border-secondary/20 bg-secondary/5 text-foreground">
          {section.eyebrow}
        </Badge>
        <h2 className="mx-auto mt-6 max-w-4xl text-3xl tracking-tight text-foreground md:text-5xl">
          {section.title}
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">{section.body}</p>
      </div>
    </section>
  );
}

function CardGridSection({ section }) {
  return (
    <section className="border-b border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,246,242,0.96))]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-8 max-w-3xl">
          <h2 className="text-3xl tracking-tight text-foreground md:text-4xl">
            {section.title}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {section.items?.map((item) => (
            <Card key={item.title} className="shadow-theme-sm border-border/80 bg-card/95">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">{item.title || item.question}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">
                {item.body || item.answer}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepsSection({ section }) {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-10 max-w-3xl">
          <h2 className="text-3xl tracking-tight text-foreground md:text-4xl">
            {section.title}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {section.items?.map((item, index) => (
            <Card key={item.title} className="border-border/80 bg-card">
              <CardHeader className="gap-4">
                <Badge className="w-fit rounded-full bg-secondary/90 px-3 py-1 text-secondary-foreground">
                  Step {index + 1}
                </Badge>
                <CardTitle className="text-xl text-foreground">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">{item.body}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection({ section }) {
  return (
    <section className="border-b border-border/60 bg-[linear-gradient(180deg,rgba(249,247,244,0.98),rgba(255,255,255,0.98))]">
      <div className="mx-auto max-w-5xl px-6 py-20 lg:px-10">
        <div className="mb-10 max-w-3xl">
          <h2 className="text-3xl tracking-tight text-foreground md:text-4xl">
            {section.title}
          </h2>
        </div>
        <div className="space-y-4">
          {section.items?.map((item) => (
            <Card key={item.question} className="border-border/80 bg-card">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">{item.question}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">{item.answer}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection({ section }) {
  return (
    <section className="bg-secondary py-20 text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[1.4fr_0.8fr] lg:px-10">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-secondary-foreground/65">
            Platform next step
          </p>
          <h2 className="mt-4 text-3xl tracking-tight md:text-4xl">{section.title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-secondary-foreground/78">{section.body}</p>
        </div>
        <div className="flex items-end justify-start lg:justify-end">
          <Button asChild size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
            <Link href={section.ctaHref || "/dashboard"}>{section.ctaLabel || "Continue"}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

const sectionRenderers = {
  hero: HeroSection,
  story: StorySection,
  highlights: CardGridSection,
  faq: FaqSection,
  steps: StepsSection,
  cta: CtaSection,
};

export default function PublicSite({ site, page, pathname, navigation, jsonLd }) {
  const style = {
    "--site-primary": site.brand?.primary || "var(--color-primary)",
    "--site-secondary": site.brand?.secondary || "var(--color-secondary)",
    "--site-accent": site.brand?.accent || "var(--color-secondary-500)",
    "--site-surface": site.brand?.surface || "var(--color-warm-bg)",
  };

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{
        ...style,
        backgroundColor: "var(--site-surface)",
      }}
    >
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-10">
          <Link href="/" className="flex min-w-0 flex-col">
            <span className="text-sm uppercase tracking-[0.22em] text-muted-foreground">{site.brand?.eyebrow}</span>
            <span className="text-xl font-semibold tracking-tight text-foreground">{site.name}</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Button asChild>
            <Link href="/dashboard">Ops dashboard</Link>
          </Button>
        </div>
      </header>

      <main>
        {page.sections.map((section, index) => {
          const Component = sectionRenderers[section.type];

          if (!Component) {
            return null;
          }

          return <Component key={`${section.type}-${index}`} section={section} pathname={pathname} />;
        })}
      </main>

      <footer className="border-t border-border/60 bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 lg:flex-row lg:items-end lg:justify-between lg:px-10">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{site.categoryLabel}</p>
            <h2 className="text-2xl tracking-tight text-foreground">{site.name}</h2>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{site.seo?.description}</p>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>{site.organization?.phone}</div>
            <div>{site.organization?.email}</div>
            <div>{site.organization?.serviceArea?.join(" · ")}</div>
          </div>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
    </div>
  );
}

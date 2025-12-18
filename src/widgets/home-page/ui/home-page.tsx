import Link from "next/link";

import {
  BadgeCheck,
  ExternalLink,
  Github,
  GraduationCap,
  Mail,
  MapPin,
  Sparkles,
  Trophy,
} from "lucide-react";

import type { Achievement } from "@/shared/config/site";
import { siteConfig } from "@/shared/config/site";
import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { SiteHeader } from "@/widgets/site-header/ui/site-header";

const achievementIconMap: Record<
  NonNullable<Achievement["icon"]>,
  React.ComponentType<{ className?: string }>
> = {
  trophy: Trophy,
  badge: BadgeCheck,
  sparkles: Sparkles,
  graduation: GraduationCap,
};

function withBasePath(path: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}

function resolveAchievementMediaHref(
  media: NonNullable<Achievement["media"]>[number],
) {
  if (media.href) return media.href;
  if (media.file) return withBasePath(`/achievements/${media.file}`);
  return null;
}

function AchievementIcon({ icon }: { icon?: Achievement["icon"] }) {
  if (!icon) return null;
  const Icon = achievementIconMap[icon];
  return <Icon className="text-muted-foreground h-4 w-4" />;
}

export function HomePage() {
  return (
    <div className="from-background to-muted/30 min-h-screen bg-gradient-to-b">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <section className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm sm:p-10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2">
              {siteConfig.roles.map((role) => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))}
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                {siteConfig.name}
              </h1>
              <p className="text-muted-foreground max-w-2xl text-base leading-7 sm:text-lg">
                {siteConfig.summary}
              </p>

              <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {siteConfig.location}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="#projects"
                className={cn(buttonVariants({ size: "lg" }))}
              >
                {siteConfig.ui.home.hero.projectsCtaLabel}
              </a>
              <Link
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                )}
              >
                <Github className="h-4 w-4" />
                {siteConfig.ui.home.hero.githubLabel}
              </Link>
              <a
                href="#contact"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                )}
              >
                {siteConfig.ui.home.hero.contactCtaLabel}
              </a>
            </div>
          </div>
        </section>

        <section id="about" className="scroll-mt-24 pt-12">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{siteConfig.ui.home.about.title}</CardTitle>
                <CardDescription>
                  {siteConfig.ui.home.about.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {siteConfig.ui.home.about.paragraphs.map((paragraph, index) => (
                  <p
                    key={`${siteConfig.ui.home.about.title}-${index}`}
                    className="text-muted-foreground text-sm leading-6"
                  >
                    {paragraph}
                  </p>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{siteConfig.ui.home.focus.title}</CardTitle>
                <CardDescription>
                  {siteConfig.ui.home.focus.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {siteConfig.ui.home.focus.items.map((item) => (
                  <div
                    key={item.title}
                    className="bg-background rounded-lg border px-4 py-3"
                  >
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-muted-foreground text-sm">
                      {item.description}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="achievements" className="scroll-mt-24 pt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                {siteConfig.ui.home.achievements.title}
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                {siteConfig.ui.home.achievements.description}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {siteConfig.achievements.map((item) => (
              <Card key={`${item.title}-${item.date}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AchievementIcon icon={item.icon} />
                    {item.title}
                  </CardTitle>
                  <CardDescription>{item.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-6">
                    {item.description}
                  </p>

                  {item.media?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.media
                        .map((media) => {
                          const href = resolveAchievementMediaHref(media);
                          if (!href) return null;

                          return (
                            <a
                              key={`${item.title}-${media.label}-${href}`}
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              className={cn(
                                buttonVariants({
                                  variant: "outline",
                                  size: "sm",
                                }),
                              )}
                            >
                              <ExternalLink className="h-4 w-4" />
                              {media.label}
                            </a>
                          );
                        })
                        .filter(Boolean)}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="skills" className="scroll-mt-24 pt-12">
          <h2 className="text-xl font-semibold tracking-tight">
            {siteConfig.ui.home.skills.title}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {siteConfig.ui.home.skills.description}
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  {siteConfig.ui.home.skills.cards.core.title}
                </CardTitle>
                <CardDescription>
                  {siteConfig.ui.home.skills.cards.core.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {siteConfig.skills.core.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {siteConfig.ui.home.skills.cards.tooling.title}
                </CardTitle>
                <CardDescription>
                  {siteConfig.ui.home.skills.cards.tooling.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {siteConfig.skills.tooling.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {siteConfig.ui.home.skills.cards.soft.title}
                </CardTitle>
                <CardDescription>
                  {siteConfig.ui.home.skills.cards.soft.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {siteConfig.skills.soft.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="projects" className="scroll-mt-24 pt-12">
          <h2 className="text-xl font-semibold tracking-tight">
            {siteConfig.ui.home.projects.title}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {siteConfig.ui.home.projects.description}
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {siteConfig.projects.map((project) => (
              <Card key={project.title} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </CardContent>

                <CardFooter className="mt-auto gap-3">
                  {project.repo ? (
                    <Link
                      href={project.repo}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                      )}
                    >
                      <Github className="h-4 w-4" />
                      {siteConfig.ui.home.projects.repoLabel}
                    </Link>
                  ) : null}

                  {project.href ? (
                    <Link
                      href={project.href}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(buttonVariants({ size: "sm" }))}
                    >
                      <ExternalLink className="h-4 w-4" />
                      {siteConfig.ui.home.projects.demoLabel}
                    </Link>
                  ) : null}
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <section id="contact" className="scroll-mt-24 pt-12">
          <Card>
            <CardHeader>
              <CardTitle>{siteConfig.ui.home.contact.title}</CardTitle>
              <CardDescription>
                {siteConfig.ui.home.contact.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Link
                href={siteConfig.links.email}
                className={cn(buttonVariants({ size: "lg" }))}
              >
                <Mail className="h-4 w-4" />
                {siteConfig.ui.home.contact.emailLabel}
              </Link>
              <Link
                href={siteConfig.links.telegram}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                )}
              >
                <Sparkles className="h-4 w-4" />
                {siteConfig.ui.home.contact.telegramLabel}
              </Link>
            </CardContent>
            <CardFooter className="text-muted-foreground text-xs">
              {siteConfig.ui.home.contact.footerNote}
            </CardFooter>
          </Card>
        </section>

        <footer className="text-muted-foreground mt-12 border-t py-8 text-center text-xs">
          © {new Date().getFullYear()} {siteConfig.name}
        </footer>
      </main>
    </div>
  );
}

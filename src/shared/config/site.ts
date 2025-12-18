import site from "@/shared/content/site.json";

export type AchievementMedia = {
  href?: string;
  file?: string;
  label: string;
  type?: "image" | "pdf" | "link";
};

export type Achievement = {
  title: string;
  description: string;
  date: string;
  icon?: "trophy" | "badge" | "sparkles" | "graduation";
  media?: AchievementMedia[];
};

export type Project = {
  title: string;
  description: string;
  tags: string[];
  href?: string;
  repo?: string;
};

export type NavItem = {
  href: string;
  label: string;
};

export type SiteConfig = {
  name: string;
  headline: string;
  summary: string;
  location: string;
  roles: string[];
  links: {
    github: string;
    email: string;
    telegram: string;
  };
  achievements: Achievement[];
  skills: {
    core: string[];
    tooling: string[];
    soft: string[];
  };
  projects: Project[];
  ui: {
    navigation: {
      items: NavItem[];
      mobileMenuTitle: string;
      githubLabel: string;
      openMenuAriaLabel: string;
      closeMenuAriaLabel: string;
    };
    home: {
      hero: {
        projectsCtaLabel: string;
        contactCtaLabel: string;
        githubLabel: string;
      };
      about: {
        title: string;
        description: string;
        paragraphs: string[];
      };
      focus: {
        title: string;
        description: string;
        items: Array<{
          title: string;
          description: string;
        }>;
      };
      achievements: {
        title: string;
        description: string;
      };
      skills: {
        title: string;
        description: string;
        cards: {
          core: {
            title: string;
            description: string;
          };
          tooling: {
            title: string;
            description: string;
          };
          soft: {
            title: string;
            description: string;
          };
        };
      };
      projects: {
        title: string;
        description: string;
        repoLabel: string;
        demoLabel: string;
      };
      contact: {
        title: string;
        description: string;
        emailLabel: string;
        telegramLabel: string;
        footerNote: string;
      };
    };
  };
};

export const siteConfig: SiteConfig = site as SiteConfig;

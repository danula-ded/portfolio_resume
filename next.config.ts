import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const githubRepo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const githubBasePath =
  isGithubActions && githubRepo && !githubRepo.endsWith(".github.io")
    ? `/${githubRepo}`
    : "";

const resolvedBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? githubBasePath;

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: resolvedBasePath,
  assetPrefix: resolvedBasePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: resolvedBasePath,
  },
};

export default nextConfig;

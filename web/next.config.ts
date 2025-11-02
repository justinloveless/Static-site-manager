import type { NextConfig } from "next";

const repoName = process.env.NEXT_PUBLIC_BASE_PATH?.trim().replace(/^\/+|\/+$/g, "") ?? "";
const inferredBasePath = repoName ? `/${repoName}` : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: inferredBasePath || undefined,
  assetPrefix: inferredBasePath ? `${inferredBasePath}/` : undefined,
};

export default nextConfig;

import type { NextConfig } from "next";

const basePath = "/Static-site-manager";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: basePath,
  assetPrefix: `${basePath}/`,
};

export default nextConfig;

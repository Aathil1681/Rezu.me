import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ["chrome-aws-lambda", "puppeteer-core"],
  },
};

export default nextConfig;

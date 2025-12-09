import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: [
    "chrome-aws-lambda",
    "puppeteer-core",
    "@sparticuz/chromium",
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...config.externals,
        "chrome-aws-lambda",
        "puppeteer-core",
        "@sparticuz/chromium",
      ];
    }
    return config;
  },
};

export default nextConfig;

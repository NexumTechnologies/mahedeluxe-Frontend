import type { NextConfig } from "next";

const buildId =
  process.env.APP_BUILD_ID ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.RAILWAY_GIT_COMMIT_SHA ||
  process.env.RENDER_GIT_COMMIT ||
  new Date().toISOString().replace(/\D/g, "").slice(0, 14);

const noStoreHeaders = [
  {
    key: "Cache-Control",
    value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  },
  {
    key: "Pragma",
    value: "no-cache",
  },
  {
    key: "Expires",
    value: "0",
  },
  {
    key: "Surrogate-Control",
    value: "no-store",
  },
];

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_BUILD_ID: buildId,
  },
  generateBuildId: async () => buildId,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: noStoreHeaders,
      },
      {
        source: "/api/version",
        headers: noStoreHeaders,
      },
    ];
  },
};

export default nextConfig;

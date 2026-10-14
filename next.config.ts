import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // media uploads go through a server action
    serverActions: { bodySizeLimit: "16mb" },
  },
};

export default nextConfig;

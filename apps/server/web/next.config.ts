import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  images: {
    remotePatterns: [
      {
        hostname: "resumemk.xyz",
      },
    ],
  },
};

export default nextConfig;

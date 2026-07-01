import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for Docker/Coolify deployments — bundles only the
  // production dependencies actually needed into .next/standalone.
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "shahname.s3.ir-thr-at1.arvanstorage.ir",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
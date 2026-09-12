import type { NextConfig } from "next";

const publicUploadBaseUrl = process.env.ARVAN_S3_PUBLIC_BASE_URL?.trim();
const publicUploadUrl = publicUploadBaseUrl
  ? new URL(publicUploadBaseUrl)
  : null;
const publicUploadHostname =
  publicUploadUrl?.hostname ?? "shahname.s3.ir-thr-at1.arvanstorage.ir";
const publicUploadProtocol =
  publicUploadUrl?.protocol.replace(":", "") ?? "https";

const nextConfig: NextConfig = {
  // Standalone output for Docker/Coolify deployments — bundles only the
  // production dependencies actually needed into .next/standalone.
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: publicUploadProtocol as "http" | "https",
        hostname: publicUploadHostname,
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

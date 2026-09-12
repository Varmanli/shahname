import type { NextConfig } from "next";

const publicUploadBaseUrl = process.env.ARVAN_S3_PUBLIC_BASE_URL?.trim();
const publicUploadUrl = publicUploadBaseUrl
  ? new URL(publicUploadBaseUrl)
  : null;

const nextConfig: NextConfig = {
  // Standalone output for Docker/Coolify deployments — bundles only the
  // production dependencies actually needed into .next/standalone.
  output: "standalone",
  ...(publicUploadUrl
    ? {
        images: {
          remotePatterns: [
            {
              protocol: publicUploadUrl.protocol.replace(":", "") as "http" | "https",
              hostname: publicUploadUrl.hostname,
              pathname: "/**",
            },
          ],
        },
      }
    : {}),
};

export default nextConfig;

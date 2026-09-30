import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal self-contained server in .next/standalone, used by the Docker image.
  output: "standalone",
};

export default nextConfig;

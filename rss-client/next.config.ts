import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@latrobe/api-contract"],
  turbopack: { root: process.cwd() },
};
export default nextConfig;

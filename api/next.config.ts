import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["sequelize", "sqlite3"],
  transpilePackages: ["@latrobe/api-contract"],
  turbopack: { root: process.cwd() },
};

export default nextConfig;

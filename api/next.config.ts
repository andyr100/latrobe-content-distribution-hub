import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["sequelize", "sqlite3"],
  turbopack: { root: process.cwd() },
};

export default nextConfig;

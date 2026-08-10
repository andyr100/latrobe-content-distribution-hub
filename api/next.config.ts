import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["sequelize", "sqlite3"],
};

export default nextConfig;

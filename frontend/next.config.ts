import { execFileSync } from "node:child_process";
import type { NextConfig } from "next";

function git(command: string[]) {
  try {
    return execFileSync("git", command, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

const history = git(["log", "-12", "--date=short", "--pretty=format:%h%x1f%ad%x1f%s"])
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [hash, date, message] = line.split("\x1f");
    return { hash, date, message };
  });

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: { root: process.cwd() },
  env: {
    NEXT_PUBLIC_GIT_BRANCH:
      process.env.GIT_BRANCH || git(["branch", "--show-current"]) || "docker-build",
    NEXT_PUBLIC_GIT_COMMIT:
      process.env.GIT_COMMIT_SHA || git(["rev-parse", "--short", "HEAD"]) || "unavailable",
    NEXT_PUBLIC_GIT_HISTORY: JSON.stringify(history),
  },
};

export default nextConfig;

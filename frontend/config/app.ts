export type GitCommit = { hash: string; date: string; message: string };

function gitCommits(): GitCommit[] {
  try {
    return JSON.parse(process.env.NEXT_PUBLIC_GIT_HISTORY ?? "[]") as GitCommit[];
  } catch {
    return [];
  }
}

export const appConfig = {
  name: "La Trobe Content Distribution Hub",
  assessment: "Cloud Based Applications — Assessment 2",
  version: "2.0.0",
  student: { name: "Andy Rea", number: "22809185" },
  git: {
    branch: process.env.NEXT_PUBLIC_GIT_BRANCH ?? "unknown",
    commit: process.env.NEXT_PUBLIC_GIT_COMMIT ?? "unknown",
    commits: gitCommits(),
    repository: "https://github.com/andyr100/latrobe-content-distribution-hub",
  },
} as const;

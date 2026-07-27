export const appConfig = {
  name: "La Trobe Content Distribution Hub",
  assessment: "Cloud Based Applications — Assessment 1",
  version: "1.0.0",
  git: {
    commitCount: 31,
    branch: "main",
    recentCommits: [
      { hash: "86b969e", message: "merge: settings reset and hydration fixes" },
      { hash: "6dc38d5", message: "fix(settings): add workspace reset and align subscription toggles" },
      { hash: "01ccccc", message: "merge: final documentation and release" },
      { hash: "c2aa142", message: "fix(accessibility): improve keyboard contrast and responsive behaviour" },
    ],
  },
  student: {
    name: "REPLACE WITH REAL NAME",
    number: "REPLACE WITH REAL STUDENT NUMBER",
  },
} as const;

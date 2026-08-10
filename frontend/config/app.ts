export const appConfig = {
  name: "La Trobe Content Distribution Hub",
  assessment: "Cloud Based Applications — Assessment 2",
  version: "2.0.0",
  student: { name: "Andy Rea", number: "22809185" },
  git: {
    commitCount: 41,
    branch: "feature/a2-split-full-stack",
    commits: [
      { hash: "43d0386", date: "27 Jul 2026, 21:25", message: "chore(git): ignore MP4 video files" },
      { hash: "e7b391b", date: "27 Jul 2026, 20:55", message: "fix(theme): restore theme transition duration" },
      { hash: "1cf3676", date: "27 Jul 2026, 20:54", message: "docs(readme): document application and architecture" },
      { hash: "26ef05e", date: "27 Jul 2026, 20:52", message: "fix(theme): prevent startup theme fade" },
      { hash: "df898c3", date: "27 Jul 2026, 20:02", message: "feat(posts): add post deletion controls" },
      { hash: "afc8e71", date: "27 Jul 2026, 19:29", message: "docs(project): add student details" },
      { hash: "76f33b4", date: "27 Jul 2026, 15:57", message: "feat(channels): add persistent horizontal channel layout" },
      { hash: "a4fa888", date: "27 Jul 2026, 15:50", message: "feat(settings): add commit times and kebab control" },
      { hash: "90aa494", date: "27 Jul 2026, 15:44", message: "feat(settings): add expandable chronological Git history" },
      { hash: "cf8960e", date: "27 Jul 2026, 15:41", message: "feat(settings): show project git commit history" },
    ],
  },
} as const;

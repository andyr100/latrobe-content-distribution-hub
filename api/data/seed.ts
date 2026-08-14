import type { Transaction } from "sequelize";
import { Feed, Post, PostFeed, RequestCounter, RssUser, User } from "@/models";

const users = [
  {
    id: "administrator",
    name: "Administrator",
    email: "administrator@latrobe.example",
    role: "Administrator",
  },
  {
    id: "sarah-williams",
    name: "Dr Sarah Williams",
    email: "sarah.williams@latrobe.example",
    role: "Lecturer",
  },
  {
    id: "michael-chen",
    name: "Prof Michael Chen",
    email: "michael.chen@latrobe.example",
    role: "Lecturer",
  },
  {
    id: "emily-taylor",
    name: "Dr Emily Taylor",
    email: "emily.taylor@latrobe.example",
    role: "Lecturer",
  },
] as const;

const rssUsers = [
  ["ava-nguyen", "Ava Nguyen", "ava.nguyen@student.latrobe.example"],
  ["liam-wilson", "Liam Wilson", "liam.wilson@student.latrobe.example"],
  ["mia-patel", "Mia Patel", "mia.patel@student.latrobe.example"],
  ["noah-brown", "Noah Brown", "noah.brown@student.latrobe.example"],
  ["olivia-kim", "Olivia Kim", "olivia.kim@student.latrobe.example"],
  ["ethan-jones", "Ethan Jones", "ethan.jones@student.latrobe.example"],
] as const;

const feeds = [
  [
    "internships",
    "INTERNSHIPS",
    "Internships",
    "Placements, internships and early-career opportunities.",
  ],
  [
    "hackathons",
    "HACKATHONS",
    "Hackathons",
    "Build events, team formation and competition updates.",
  ],
  ["csit-news", "CSITNEWS", "CSIT News", "News and community updates for CSIT students."],
  ["ai-coding", "AICODING", "AI Coding", "Practical AI-assisted software development."],
  [
    "frontier-llms",
    "FRONTIERLLMS",
    "Frontier LLMs",
    "Emerging large-language-model research and practice.",
  ],
  [
    "cloud-devops",
    "CLOUDDEVOPS",
    "Cloud & DevOps",
    "Cloud platforms, deployment and operational practice.",
  ],
  [
    "cybersecurity",
    "CYBERSECURITY",
    "Cybersecurity",
    "Security learning, events and industry guidance.",
  ],
  [
    "data-analytics",
    "DATAANALYTICS",
    "Data & Analytics",
    "Data practice, analytics skills and career insight.",
  ],
] as const;

const posts = [
  [
    1,
    "Internship application workshop",
    "Bring your CV to a practical workshop on finding placements, tailoring applications and preparing for interviews.",
    "sarah-williams",
    "2026-08-07T02:00:00.000Z",
    ["internships"],
  ],
  [
    2,
    "Semester placement roundup",
    "A new roundup of host organisations and placement stories is available for students planning their next career step.",
    "administrator",
    "2026-08-06T01:00:00.000Z",
    ["internships", "csit-news"],
  ],
  [
    3,
    "Spring build weekend announced",
    "Registrations are open for a collaborative weekend of prototyping, mentoring and presentations.",
    "michael-chen",
    "2026-08-05T03:00:00.000Z",
    ["hackathons", "ai-coding"],
  ],
  [
    4,
    "Hackathon team formation guide",
    "Use this short guide to form a balanced team, scope a useful problem and organise your build time.",
    "emily-taylor",
    "2026-08-04T04:00:00.000Z",
    ["hackathons"],
  ],
  [
    5,
    "CSIT student showcase",
    "This month’s showcase highlights student projects in software, data, infrastructure and security.",
    "administrator",
    "2026-08-03T01:00:00.000Z",
    ["csit-news"],
  ],
  [
    6,
    "CSIT technology digest",
    "A concise digest of technology trends, student activities and upcoming opportunities across the community.",
    "michael-chen",
    "2026-08-02T02:00:00.000Z",
    ["csit-news", "data-analytics"],
  ],
  [
    7,
    "AI coding lab toolkit update",
    "The lab toolkit now includes example prompts, test fixtures and guidance for reviewing AI-generated code.",
    "sarah-williams",
    "2026-08-01T03:00:00.000Z",
    ["ai-coding"],
  ],
  [
    8,
    "Prompt engineering code review",
    "Explore a repeatable approach for using prompts, tests and human review to improve AI-assisted changes.",
    "emily-taylor",
    "2026-07-31T04:00:00.000Z",
    ["ai-coding", "frontier-llms"],
  ],
  [
    9,
    "Frontier LLM reading group",
    "Join the reading group for a discussion of current model capabilities, evaluation methods and responsible use.",
    "michael-chen",
    "2026-07-30T01:00:00.000Z",
    ["frontier-llms"],
  ],
  [
    10,
    "Evaluating LLM outputs",
    "A new learning resource explains how to create evaluation sets and interpret quality, safety and reliability signals.",
    "sarah-williams",
    "2026-07-29T02:00:00.000Z",
    ["frontier-llms", "data-analytics"],
  ],
  [
    11,
    "Cloud deployment clinic",
    "Bring a deployment question to this hands-on clinic covering containers, observability and incident readiness.",
    "emily-taylor",
    "2026-07-28T03:00:00.000Z",
    ["cloud-devops"],
  ],
  [
    12,
    "CI/CD template refresh",
    "The shared CI/CD template has been refreshed with clearer checks, release notes and environment guidance.",
    "michael-chen",
    "2026-07-27T04:00:00.000Z",
    ["cloud-devops"],
  ],
  [
    13,
    "Security capture-the-flag night",
    "Form a team for an evening of practical challenges covering web security, forensics and secure design.",
    "administrator",
    "2026-07-26T01:00:00.000Z",
    ["cybersecurity", "hackathons"],
  ],
  [
    14,
    "Secure coding checklist",
    "Use this checklist when reviewing code for input handling, dependencies, authentication and secrets management.",
    "sarah-williams",
    "2026-07-25T02:00:00.000Z",
    ["cybersecurity", "ai-coding"],
  ],
  [
    15,
    "Data visualisation practice session",
    "A guided session on choosing charts, checking assumptions and communicating a clear data story.",
    "emily-taylor",
    "2026-07-24T03:00:00.000Z",
    ["data-analytics"],
  ],
  [
    16,
    "Data careers industry panel",
    "Hear from analysts and data engineers about entry pathways, portfolios and skills employers value.",
    "michael-chen",
    "2026-07-23T04:00:00.000Z",
    ["data-analytics", "internships"],
  ],
] as const;

export async function seedDatabase(transaction: Transaction) {
  for (const user of users)
    await User.findOrCreate({ where: { id: user.id }, defaults: { ...user }, transaction });
  for (const [id, name, email] of rssUsers)
    await RssUser.findOrCreate({
      where: { id },
      defaults: { id, name, email, role: "Student" },
      transaction,
    });
  for (const [id, code, title, description] of feeds) {
    await Feed.findOrCreate({
      where: { id },
      defaults: { id, code, title, description, slug: id },
      transaction,
    });
  }
  for (const [id, title, body, authorId, publishedAt, feedIds] of posts) {
    await Post.findOrCreate({
      where: { id },
      defaults: {
        id,
        title,
        body,
        authorId,
        imageUrl: null,
        externalLink: null,
        publishedAt: new Date(publishedAt),
      },
      transaction,
    });
    for (const feedId of feedIds)
      await PostFeed.findOrCreate({
        where: { postId: id, feedId },
        defaults: { postId: id, feedId },
        transaction,
      });
  }
  await RequestCounter.findOrCreate({
    where: { key: "rss-client-requests" },
    defaults: { key: "rss-client-requests", count: 0 },
    transaction,
  });
}

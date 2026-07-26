import type { Channel, Classification, ExternalArticle, InternalPost } from "@/types";

export const classifications: Classification[] = [
  "University News", "Subject News", "Assessment Information", "Examination Information",
  "Timetable Changes", "Assignment Updates", "Industry News", "Career Opportunities",
  "Student Services", "General Announcement",
];

export const seedChannels: Channel[] = [
  ["ltcse4cba", "LTCSE4CBA", "Cloud Based Applications", "Semester 2, 2026", true, 8],
  ["ltcse3dbf", "LTCSE3DBF", "Database Fundamentals", "Semester 2, 2026", true, 12],
  ["ltcse3aim", "LTCSE3AIM", "Artificial Intelligence Methods", "Semester 2, 2026", true, 10],
  ["ltcse2web", "LTCSE2WEB", "Web Development", "Semester 2, 2026", true, 15],
  ["ltcse3net", "LTCSE3NET", "Computer Networks", "Semester 1, 2026", true, 6],
  ["ltcse2sec", "LTCSE2SEC", "Cybersecurity Fundamentals", "Semester 2, 2026", true, 9],
  ["ltcse3dmi", "LTCSE3DMI", "Data Mining", "Semester 1, 2026", true, 7],
  ["ltcse4mla", "LTCSE4MLA", "Machine Learning Applications", "Semester 2, 2026", true, 11],
  ["ltinf2hci", "LTINF2HCI", "Human–Computer Interaction", "Semester 2, 2026", true, 5],
  ["ltinf3pmt", "LTINF3PMT", "Project Management", "Semester 2, 2026", true, 13],
  ["ltcse2swe", "LTCSE2SWE", "Software Engineering", "Semester 1, 2026", true, 8],
  ["ltinf1itf", "LTINF1ITF", "Information Technology Fundamentals", "Semester 1, 2026", false, 4],
].map(([id, code, subjectName, semester, active, postCount]) => ({ id, code, subjectName, semester, active, postCount } as Channel));

export const feedSources = [
  { id: "microsoft-ai", name: "Microsoft AI Blog", description: "Responsible AI, research and practical adoption." },
  { id: "aws-news", name: "AWS News", description: "Cloud services, architecture and platform updates." },
  { id: "google-developers", name: "Google Developers", description: "Developer tools, web platforms and engineering." },
  { id: "stack-overflow", name: "Stack Overflow Blog", description: "Software practice and developer community insight." },
  { id: "higher-education", name: "Higher Education News", description: "Teaching, learning and university sector trends." },
] as const;

const articleTopics: Record<string, string[]> = {
  "microsoft-ai": ["Practical patterns for smaller language models", "A framework for responsible classroom AI", "Making multimodal tools more accessible", "New approaches to efficient model evaluation", "From research prototype to reliable AI service", "Designing transparent AI experiences", "How agents support knowledge work", "Teaching teams explore generative AI", "Safer foundations for enterprise copilots", "Measuring the environmental cost of AI"],
  "aws-news": ["Serverless workflows for busy teaching teams", "A simpler path to resilient cloud applications", "Cost visibility patterns for student projects", "Event-driven design in practice", "New tools for responsible cloud operations", "Building accessible services at the edge", "Observability essentials for small teams", "Modern data pipelines without the overhead", "Security habits for first cloud deployments", "Scaling an application from prototype to pilot"],
  "google-developers": ["A faster feedback loop for web developers", "Modern browser capabilities for inclusive forms", "What is new in web performance tooling", "Designing helpful offline experiences", "Practical testing patterns for component teams", "New ways to profile JavaScript applications", "A guide to accessible interaction states", "Safer dependency management for developers", "Building adaptable interfaces with the web platform", "Developer communities share open source lessons"],
  "stack-overflow": ["Why good documentation is part of the product", "What junior developers need from code review", "The quiet value of boring architecture", "How teams make technical decisions visible", "Debugging habits that save an afternoon", "Developers rethink the role of AI assistance", "Making legacy code safer to change", "What maintainers wish contributors understood", "The skills behind effective platform teams", "When a small abstraction is enough"],
  "higher-education": ["Universities expand flexible digital learning", "Student belonging shapes online participation", "Assessment design evolves for an AI-enabled campus", "Industry partnerships create new project opportunities", "Accessible course materials improve outcomes", "Teaching teams adopt more authentic assessment", "Regional campuses invest in connected learning", "Graduate employability programs broaden their reach", "Libraries build new digital capability programs", "Universities explore responsible learning analytics"],
};

export const externalArticles: ExternalArticle[] = feedSources.flatMap((feed, feedIndex) =>
  articleTopics[feed.id].map((title, index) => ({
    id: `${feed.id}-${String(index + 1).padStart(2, "0")}`,
    feedId: feed.id,
    title,
    summary: `A concise, fictional briefing from ${feed.name} examining ${title.toLowerCase()} and the practical implications for university technology teams.`,
    classification: classifications[(feedIndex * 2 + index) % classifications.length],
    publishedAt: new Date(Date.UTC(2026, 6, 25 - index - feedIndex, 9 + (index % 7), 15)).toISOString(),
  }))
).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export const seedPosts: InternalPost[] = [
  ["post-01", "Assessment preparation guide", "The assessment preparation guide is now available. Review the checklist before the next workshop and bring any questions to class.", "Assessment Information", "sarah-williams", "Dr Sarah Williams", "2026-07-25T06:10:00.000Z", ["ltcse4cba", "ltcse2web", "ltcse2swe"]],
  ["post-02", "Week five timetable update", "Tuesday's lecture will begin 30 minutes later. The room and online link remain unchanged.", "Timetable Changes", "emily-taylor", "Dr Emily Taylor", "2026-07-24T03:30:00.000Z", ["ltcse3dbf"]],
  ["post-03", "Industry guest lecture: cloud resilience", "Join our guest engineer for a practical session on designing resilient services and responding to production incidents.", "Industry News", "michael-chen", "Prof Michael Chen", "2026-07-22T01:00:00.000Z", ["ltcse4cba", "ltcse3net"]],
  ["post-04", "Semester census date reminder", "Please review your enrolment before the census date and contact Student Services if you need advice.", "University News", "administrator", "Administrator", "2026-07-20T00:20:00.000Z", ["ltcse4cba", "ltcse3dbf", "ltcse3aim", "ltcse2web"]],
  ["post-05", "Database lab files updated", "The lab dataset has been corrected and the updated files are now ready for this week's practical.", "Subject News", "sarah-williams", "Dr Sarah Williams", "2026-07-18T04:45:00.000Z", ["ltcse3dbf"]],
  ["post-06", "Graduate program applications open", "Applications are now open for several technology graduate programs. Check eligibility and closing dates early.", "Career Opportunities", "administrator", "Administrator", "2026-07-16T02:15:00.000Z", ["ltcse4cba", "ltcse3aim", "ltcse4mla"]],
  ["post-07", "Examination format confirmed", "The final examination format and permitted materials have been confirmed in the subject guide.", "Examination Information", "michael-chen", "Prof Michael Chen", "2026-07-14T07:30:00.000Z", ["ltcse3net", "ltcse2sec"]],
  ["post-08", "Peer mentoring sessions", "Weekly peer mentoring sessions are available in the Learning Commons for students seeking additional support.", "Student Services", "emily-taylor", "Dr Emily Taylor", "2026-07-12T05:40:00.000Z", ["ltinf1itf", "ltcse2web"]],
].map(([id, title, body, classification, authorId, authorName, publishedAt, channelIds]) => ({ id, title, body, classification, authorId, authorName, publishedAt, channelIds, status: "Published" } as InternalPost));

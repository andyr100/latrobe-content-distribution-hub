import { Op, Sequelize } from "sequelize";
import { seedDatabase } from "../data/seed";
import { runMigrations } from "../lib/migrations";
import {
  Feed,
  FeedStatusEvent,
  initialiseModels,
  Post,
  PostFeed,
  RequestLog,
  RssUser,
  User,
} from "../models";

const storage = process.env.DATABASE_STORAGE ?? "./data/content-hub.sqlite";
const sequelize = new Sequelize({ dialect: "sqlite", storage, logging: false });
const syntheticSource = "synthetic-90d";
const syntheticPostPrefix = "[Synthetic 90d]";
const clientTypes = ["browser", "mobile_app", "rss_reader", "jmeter", "direct"] as const;

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 4_294_967_296;
  };
}

function dayAt(dayOffset: number, hour: number, minute: number) {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dayOffset, hour, minute),
  );
}

async function main() {
  const random = seeded(22_809_185);
  try {
    initialiseModels(sequelize);
    await sequelize.authenticate();
    await runMigrations(sequelize);
    await sequelize.transaction(async (transaction) => {
      await seedDatabase(transaction);
      await RequestLog.destroy({ where: { source: syntheticSource }, transaction });
      await FeedStatusEvent.destroy({
        where: { message: "[SYNTHETIC] 90-day feed status" },
        transaction,
      });
      const existingPosts = await Post.findAll({
        where: { title: { [Op.like]: syntheticPostPrefix + "%" } },
        attributes: ["id"],
        transaction,
      });
      if (existingPosts.length) {
        const postIds = existingPosts.map((post) => post.id);
        await PostFeed.destroy({ where: { postId: postIds }, transaction });
        await Post.destroy({ where: { id: postIds }, transaction });
      }

      const [feeds, rssUsers, authors] = await Promise.all([
        Feed.findAll({ order: [["id", "ASC"]], transaction }),
        RssUser.findAll({ order: [["id", "ASC"]], transaction }),
        User.findAll({ order: [["id", "ASC"]], transaction }),
      ]);
      if (!feeds.length || !rssUsers.length || !authors.length) {
        throw new Error("Seed feeds, RSS users and publishing authors before simulating traffic.");
      }

      const requestLogs = [];
      const posts: Array<{
        title: string;
        body: string;
        authorId: string;
        imageUrl: null;
        externalLink: null;
        publishedAt: Date;
      }> = [];
      const postFeedIndexes: number[] = [];

      for (let day = 89; day >= 0; day -= 1) {
        const requestsToday = 24 + Math.floor(random() * 28) + (day < 30 ? 8 : 0);
        for (let index = 0; index < requestsToday; index += 1) {
          const feed =
            feeds[(day * 3 + index * 5 + Math.floor(random() * feeds.length)) % feeds.length];
          const clientType = clientTypes[(day + index * 2) % clientTypes.length];
          const rssUser =
            clientType === "direct" && index % 3 === 0
              ? null
              : rssUsers[(day + index) % rssUsers.length];
          const success = random() > 0.045;
          const requestedAt = dayAt(day, 7 + Math.floor(random() * 14), Math.floor(random() * 60));
          const durationMs = Math.round(
            42 +
              random() * 165 +
              (clientType === "jmeter" ? random() * 55 : 0) +
              (success ? 0 : 130),
          );
          requestLogs.push({
            clientId: clientType + "-synthetic-" + ((day + index) % 18),
            clientType,
            rssUserId: rssUser?.id ?? null,
            feedId: feed.id,
            endpoint: "/rss/" + feed.code,
            method: "GET",
            statusCode: success ? 200 : [404, 429, 500, 503][Math.floor(random() * 4)],
            success,
            durationMs,
            requestedAt,
            userAgent: "La Trobe 90-day dashboard data generator",
            source: syntheticSource,
            createdAt: requestedAt,
            updatedAt: requestedAt,
          });
        }

        const postsToday = 1 + (random() > 0.28 ? 1 : 0) + (day % 7 === 2 ? 1 : 0);
        for (let index = 0; index < postsToday; index += 1) {
          const publishedAt = dayAt(
            day,
            8 + ((day + index * 3) % 9),
            10 + ((day * 7 + index * 11) % 45),
          );
          posts.push({
            title: syntheticPostPrefix + " " + (90 - day) + "-" + (index + 1),
            body: "Synthetic publishing history used to demonstrate Hub Intelligence charts.",
            authorId: authors[(day + index) % authors.length].id,
            imageUrl: null,
            externalLink: null,
            publishedAt,
          });
          postFeedIndexes.push((day * 2 + index) % feeds.length);
        }
      }

      await RequestLog.bulkCreate(requestLogs, { transaction });
      const createdPosts = await Post.bulkCreate(posts, { transaction, returning: true });
      await PostFeed.bulkCreate(
        createdPosts.map((post, index) => ({
          postId: post.id,
          feedId: feeds[postFeedIndexes[index]].id,
        })),
        { transaction },
      );

      const checkedAt = new Date();
      await FeedStatusEvent.bulkCreate(
        feeds.map((feed, index) => ({
          feedId: feed.id,
          status: "HEALTHY" as const,
          itemCount: 2 + (index % 4),
          httpStatus: 200,
          latencyMs: 55 + index * 13,
          message: "[SYNTHETIC] 90-day feed status",
          checkedAt,
          createdAt: checkedAt,
          updatedAt: checkedAt,
        })),
        { transaction },
      );
      console.log(
        "Created " +
          requestLogs.length +
          " synthetic RSS requests and " +
          createdPosts.length +
          " synthetic posts across 90 days in " +
          storage +
          ".",
      );
    });
  } finally {
    await sequelize.close();
  }
}

void main();

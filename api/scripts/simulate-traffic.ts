import { Sequelize } from "sequelize";
import { seedDatabase } from "../data/seed";
import { runMigrations } from "../lib/migrations";
import { initialiseModels, Alert, Feed, FeedStatusEvent, RequestLog } from "../models";

const storage = process.env.DATABASE_STORAGE ?? "./data/content-hub.sqlite";
const sequelize = new Sequelize({ dialect: "sqlite", storage, logging: false });
const clients = ["lms-library", "lms-engineering", "mobile-reader", "jmeter-demo"];

async function main() {
  try {
    initialiseModels(sequelize);
    await sequelize.authenticate();
    await runMigrations(sequelize);
    await sequelize.transaction(async (transaction) => {
      await seedDatabase(transaction);
      await RequestLog.destroy({ where: { source: "simulation" }, transaction });
      await FeedStatusEvent.destroy({ where: { message: "[DEMO] simulated status" }, transaction });
      await Alert.destroy({ where: { type: "DEMO_WARNING" }, transaction });

      const feeds = await Feed.findAll({ order: [["id", "ASC"]], transaction });
      const now = Date.now();
      const logs = Array.from({ length: 96 }, (_, index) => {
        const feed = feeds[index % feeds.length];
        const success = index % 19 !== 0;
        const requestedAt = new Date(now - (95 - index) * 30 * 60_000);
        return {
          clientId: clients[index % clients.length],
          feedId: feed.id,
          endpoint: `/rss/${feed.code}`,
          method: "GET",
          statusCode: success ? 200 : 503,
          success,
          durationMs: 28 + ((index * 17) % 240),
          requestedAt,
          userAgent: "Assessment 3 deterministic simulator",
          source: "simulation",
          createdAt: requestedAt,
          updatedAt: requestedAt,
        };
      });
      await RequestLog.bulkCreate(logs, { transaction });

      for (const [index, feed] of feeds.entries()) {
        const status = index === 6 ? "WARNING" : index === 7 ? "EMPTY" : "HEALTHY";
        await FeedStatusEvent.create(
          {
            feedId: feed.id,
            status,
            itemCount: status === "EMPTY" ? 0 : 2 + (index % 4),
            httpStatus: status === "WARNING" ? 503 : 200,
            latencyMs: 35 + index * 11,
            message: "[DEMO] simulated status",
            checkedAt: new Date(now - index * 60_000),
          },
          { transaction },
        );
      }
      await Alert.create(
        {
          feedId: feeds[6]?.id ?? null,
          type: "DEMO_WARNING",
          severity: "WARNING",
          message: "Demonstration warning: a simulated RSS check returned a temporary error.",
          resolved: false,
          resolvedAt: null,
        },
        { transaction },
      );
    });
    console.log(`Assessment 3 operational demo data is ready in ${storage}`);
  } finally {
    await sequelize.close();
  }
}

void main();

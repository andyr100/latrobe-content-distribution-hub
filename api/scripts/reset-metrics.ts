import { Sequelize } from "sequelize";
import { runMigrations } from "../lib/migrations";
import { Alert, FeedStatusEvent, initialiseModels, RequestCounter, RequestLog } from "../models";

const storage = process.env.DATABASE_STORAGE ?? "./data/content-hub.sqlite";
const sequelize = new Sequelize({ dialect: "sqlite", storage, logging: false });

try {
  initialiseModels(sequelize);
  await sequelize.authenticate();
  await runMigrations(sequelize);
  await sequelize.transaction(async (transaction) => {
    await Alert.destroy({ where: {}, truncate: false, transaction });
    await FeedStatusEvent.destroy({ where: {}, truncate: false, transaction });
    await RequestLog.destroy({ where: {}, truncate: false, transaction });
    await RequestCounter.update(
      { count: 0 },
      { where: { key: "rss-client-requests" }, transaction },
    );
  });
  console.log(`Operational metrics were cleared from ${storage}; core content was preserved.`);
} finally {
  await sequelize.close();
}

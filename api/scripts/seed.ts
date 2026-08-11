import { Sequelize } from "sequelize";
import { seedDatabase } from "../data/seed";
import { runMigrations } from "../lib/migrations";
import { initialiseModels } from "../models";

const storage = process.env.DATABASE_STORAGE ?? "./data/content-hub.sqlite";
const sequelize = new Sequelize({ dialect: "sqlite", storage, logging: false });

try {
  initialiseModels(sequelize);
  await sequelize.authenticate();
  await runMigrations(sequelize);
  await sequelize.transaction(async (transaction) => seedDatabase(transaction));
  console.log(`Seed data is current for ${storage}`);
} finally {
  await sequelize.close();
}

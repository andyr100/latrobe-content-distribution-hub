import { Sequelize } from "sequelize";
import { runMigrations } from "../lib/migrations";

const storage = process.env.DATABASE_STORAGE ?? "./data/content-hub.sqlite";
const sequelize = new Sequelize({ dialect: "sqlite", storage, logging: false });

try {
  await sequelize.authenticate();
  await runMigrations(sequelize);
  console.log(`Migrations are current for ${storage}`);
} finally {
  await sequelize.close();
}

import fs from "node:fs";
import path from "node:path";
import { Sequelize } from "sequelize";
import { seedDatabase } from "@/data/seed";
import { initialiseModels } from "@/models";

const storage = process.env.DATABASE_STORAGE ?? path.join(/* turbopackIgnore: true */ process.cwd(), "data", "content-hub.sqlite");
fs.mkdirSync(path.dirname(storage), { recursive: true });

const globalDatabase = globalThis as typeof globalThis & {
  contentHubSequelize?: Sequelize;
  contentHubInitialisation?: Promise<Sequelize>;
};

export const sequelize = globalDatabase.contentHubSequelize ?? new Sequelize({
  dialect: "sqlite",
  storage,
  logging: process.env.NODE_ENV === "development" ? console.debug : false,
});

if (process.env.NODE_ENV !== "production") globalDatabase.contentHubSequelize = sequelize;
initialiseModels(sequelize);

export function initialiseDatabase(): Promise<Sequelize> {
  if (!globalDatabase.contentHubInitialisation) {
    globalDatabase.contentHubInitialisation = (async () => {
      await sequelize.authenticate();
      await sequelize.sync();
      await sequelize.transaction(async (transaction) => seedDatabase(transaction));
      return sequelize;
    })().catch((error) => {
      globalDatabase.contentHubInitialisation = undefined;
      throw error;
    });
  }
  return globalDatabase.contentHubInitialisation;
}

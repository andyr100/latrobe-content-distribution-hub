import { DataTypes, type Sequelize } from "sequelize";
import { feedSchemaMigration } from "@/migrations/001-feed-schema";
import { rebuildPostFeedsMigration } from "@/migrations/002-rebuild-post-feeds";
import { operationalMetricsMigration } from "@/migrations/003-operational-metrics";

const migrations = [feedSchemaMigration, rebuildPostFeedsMigration, operationalMetricsMigration];

export async function runMigrations(sequelize: Sequelize) {
  const queryInterface = sequelize.getQueryInterface();
  const tables = new Set((await queryInterface.showAllTables()).map(String));
  if (!tables.has("SchemaMigrations")) {
    await queryInterface.createTable("SchemaMigrations", {
      name: { type: DataTypes.STRING, primaryKey: true },
      appliedAt: { type: DataTypes.DATE, allowNull: false },
    });
  }

  const [records] = await sequelize.query("SELECT name FROM SchemaMigrations");
  const applied = new Set((records as Array<{ name: string }>).map((record) => record.name));

  for (const migration of migrations) {
    if (applied.has(migration.name)) continue;
    await sequelize.transaction(async (transaction) => {
      await migration.up(sequelize, transaction);
      await sequelize
        .getQueryInterface()
        .bulkInsert("SchemaMigrations", [{ name: migration.name, appliedAt: new Date() }], {
          transaction,
        });
    });
  }
}

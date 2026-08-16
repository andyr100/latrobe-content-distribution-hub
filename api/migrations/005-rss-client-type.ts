import { DataTypes, QueryTypes, type Sequelize, type Transaction } from "sequelize";

function normaliseLegacyClientType(value: string | null) {
  const source = (value ?? "").trim().toLowerCase();
  if (source.includes("jmeter")) return "jmeter";
  if (source === "rss-client" || source.includes("rss-reader") || source.includes("feed-reader"))
    return "rss_reader";
  if (source.includes("mobile")) return "mobile_app";
  if (source.includes("browser")) return "browser";
  return "direct";
}

export const rssClientTypeMigration = {
  name: "005-rss-client-type",
  async up(sequelize: Sequelize, transaction: Transaction) {
    const queryInterface = sequelize.getQueryInterface();
    const columns = await queryInterface.describeTable("RequestLogs");
    if (!columns.clientType) {
      await queryInterface.addColumn(
        "RequestLogs",
        "clientType",
        { type: DataTypes.STRING(30), allowNull: false, defaultValue: "direct" },
        { transaction },
      );
      const rows = await sequelize.query<{ id: number; source: string | null }>(
        "SELECT id, source FROM RequestLogs",
        { type: QueryTypes.SELECT, transaction },
      );
      for (const row of rows) {
        await sequelize.query("UPDATE RequestLogs SET clientType = :clientType WHERE id = :id", {
          replacements: { id: row.id, clientType: normaliseLegacyClientType(row.source) },
          type: QueryTypes.UPDATE,
          transaction,
        });
      }
      await queryInterface.addIndex("RequestLogs", ["clientType", "requestedAt"], {
        name: "request_logs_client_type_requested_at",
        transaction,
      });
    }
  },
};

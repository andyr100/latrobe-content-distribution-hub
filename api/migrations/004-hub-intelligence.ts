import { DataTypes, type Sequelize, type Transaction } from "sequelize";

export const hubIntelligenceMigration = {
  name: "004-hub-intelligence",
  async up(sequelize: Sequelize, transaction: Transaction) {
    const queryInterface = sequelize.getQueryInterface();
    const tables = new Set((await queryInterface.showAllTables()).map(String));
    if (!tables.has("RssUsers")) {
      await queryInterface.createTable(
        "RssUsers",
        {
          id: { type: DataTypes.STRING, primaryKey: true },
          name: { type: DataTypes.STRING, allowNull: false },
          email: { type: DataTypes.STRING, allowNull: false, unique: true },
          role: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "Student" },
          createdAt: { type: DataTypes.DATE, allowNull: false },
          updatedAt: { type: DataTypes.DATE, allowNull: false },
        },
        { transaction },
      );
    }
    const columns = await queryInterface.describeTable("RequestLogs");
    if (!columns.rssUserId) {
      await queryInterface.addColumn(
        "RequestLogs",
        "rssUserId",
        {
          type: DataTypes.STRING,
          allowNull: true,
          references: { model: "RssUsers", key: "id" },
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        },
        { transaction },
      );
      await queryInterface.addIndex("RequestLogs", ["rssUserId"], {
        name: "request_logs_rss_user_id",
        transaction,
      });
    }
  },
};

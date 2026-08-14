import { DataTypes, type Sequelize, type Transaction } from "sequelize";

export const operationalMetricsMigration = {
  name: "003-operational-metrics",
  async up(sequelize: Sequelize, transaction: Transaction) {
    const queryInterface = sequelize.getQueryInterface();
    const tables = new Set((await queryInterface.showAllTables()).map(String));

    if (!tables.has("RequestLogs")) {
      await queryInterface.createTable(
        "RequestLogs",
        {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
          clientId: { type: DataTypes.STRING(100), allowNull: false },
          feedId: {
            type: DataTypes.STRING,
            allowNull: true,
            references: { model: "Feeds", key: "id" },
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
          },
          endpoint: { type: DataTypes.STRING(255), allowNull: false },
          method: { type: DataTypes.STRING(10), allowNull: false },
          statusCode: { type: DataTypes.INTEGER, allowNull: false },
          success: { type: DataTypes.BOOLEAN, allowNull: false },
          durationMs: { type: DataTypes.INTEGER, allowNull: false },
          requestedAt: { type: DataTypes.DATE, allowNull: false },
          userAgent: { type: DataTypes.STRING(500), allowNull: true },
          source: { type: DataTypes.STRING(50), allowNull: true },
          createdAt: { type: DataTypes.DATE, allowNull: false },
          updatedAt: { type: DataTypes.DATE, allowNull: false },
        },
        { transaction },
      );
      await queryInterface.addIndex("RequestLogs", ["requestedAt"], {
        name: "request_logs_requested_at",
        transaction,
      });
      await queryInterface.addIndex("RequestLogs", ["clientId"], {
        name: "request_logs_client_id",
        transaction,
      });
      await queryInterface.addIndex("RequestLogs", ["feedId"], {
        name: "request_logs_feed_id",
        transaction,
      });
      await queryInterface.addIndex("RequestLogs", ["feedId", "requestedAt"], {
        name: "request_logs_feed_requested_at",
        transaction,
      });
    }

    if (!tables.has("FeedStatusEvents")) {
      await queryInterface.createTable(
        "FeedStatusEvents",
        {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
          feedId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: { model: "Feeds", key: "id" },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          },
          status: { type: DataTypes.STRING(20), allowNull: false },
          itemCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
          httpStatus: { type: DataTypes.INTEGER, allowNull: false },
          latencyMs: { type: DataTypes.INTEGER, allowNull: false },
          message: { type: DataTypes.STRING(500), allowNull: true },
          checkedAt: { type: DataTypes.DATE, allowNull: false },
          createdAt: { type: DataTypes.DATE, allowNull: false },
          updatedAt: { type: DataTypes.DATE, allowNull: false },
        },
        { transaction },
      );
      await queryInterface.addIndex("FeedStatusEvents", ["checkedAt"], {
        name: "feed_status_checked_at",
        transaction,
      });
      await queryInterface.addIndex("FeedStatusEvents", ["feedId", "checkedAt"], {
        name: "feed_status_feed_checked_at",
        transaction,
      });
    }

    if (!tables.has("Alerts")) {
      await queryInterface.createTable(
        "Alerts",
        {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
          feedId: {
            type: DataTypes.STRING,
            allowNull: true,
            references: { model: "Feeds", key: "id" },
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
          },
          type: { type: DataTypes.STRING(50), allowNull: false },
          severity: { type: DataTypes.STRING(20), allowNull: false },
          message: { type: DataTypes.STRING(500), allowNull: false },
          resolved: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
          resolvedAt: { type: DataTypes.DATE, allowNull: true },
          createdAt: { type: DataTypes.DATE, allowNull: false },
          updatedAt: { type: DataTypes.DATE, allowNull: false },
        },
        { transaction },
      );
      await queryInterface.addIndex("Alerts", ["createdAt"], {
        name: "alerts_created_at",
        transaction,
      });
      await queryInterface.addIndex("Alerts", ["resolved", "severity"], {
        name: "alerts_resolved_severity",
        transaction,
      });
      await queryInterface.addIndex("Alerts", ["feedId"], {
        name: "alerts_feed_id",
        transaction,
      });
    }
  },
};

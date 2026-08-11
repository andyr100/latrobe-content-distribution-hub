import { DataTypes, type QueryInterface, type Sequelize, type Transaction } from "sequelize";

async function tableNames(queryInterface: QueryInterface) {
  return new Set((await queryInterface.showAllTables()).map(String));
}

async function addIndexIfMissing(
  queryInterface: QueryInterface,
  table: string,
  fields: string[],
  name: string,
  transaction: Transaction,
  unique = false,
) {
  const indexes = (await queryInterface.showIndex(table, {
    transaction,
  })) as Array<{ name?: string }>;
  if (!indexes.some((index) => index.name === name)) {
    await queryInterface.addIndex(table, fields, { name, unique, transaction });
  }
}

export const feedSchemaMigration = {
  name: "001-feed-schema",
  async up(sequelize: Sequelize, transaction: Transaction) {
    const queryInterface = sequelize.getQueryInterface();
    const existing = await tableNames(queryInterface);

    if (!existing.has("Users")) {
      await queryInterface.createTable(
        "Users",
        {
          id: { type: DataTypes.STRING, primaryKey: true },
          name: { type: DataTypes.STRING, allowNull: false },
          email: { type: DataTypes.STRING, allowNull: false, unique: true },
          role: { type: DataTypes.STRING, allowNull: false },
          createdAt: { type: DataTypes.DATE, allowNull: false },
          updatedAt: { type: DataTypes.DATE, allowNull: false },
        },
        { transaction },
      );
    }

    if (existing.has("Topics") && !existing.has("Feeds")) {
      await queryInterface.renameTable("Topics", "Feeds", { transaction });
      await queryInterface.renameColumn("Feeds", "name", "title", {
        transaction,
      });
      await queryInterface.addColumn(
        "Feeds",
        "slug",
        { type: DataTypes.STRING(80), allowNull: true },
        { transaction },
      );
      await sequelize.query("UPDATE Feeds SET slug = id WHERE slug IS NULL", {
        transaction,
      });
      await queryInterface.changeColumn(
        "Feeds",
        "slug",
        { type: DataTypes.STRING(80), allowNull: false, unique: true },
        { transaction },
      );
    } else if (!existing.has("Feeds")) {
      await queryInterface.createTable(
        "Feeds",
        {
          id: { type: DataTypes.STRING, primaryKey: true },
          code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
          title: { type: DataTypes.STRING, allowNull: false },
          description: { type: DataTypes.TEXT, allowNull: false },
          slug: { type: DataTypes.STRING(80), allowNull: false, unique: true },
          createdAt: { type: DataTypes.DATE, allowNull: false },
          updatedAt: { type: DataTypes.DATE, allowNull: false },
        },
        { transaction },
      );
    }

    if (!existing.has("Posts")) {
      await queryInterface.createTable(
        "Posts",
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          title: { type: DataTypes.STRING(100), allowNull: false },
          body: { type: DataTypes.TEXT, allowNull: false },
          authorId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: { model: "Users", key: "id" },
            onDelete: "RESTRICT",
            onUpdate: "CASCADE",
          },
          imageUrl: { type: DataTypes.STRING, allowNull: true },
          externalLink: { type: DataTypes.STRING, allowNull: true },
          publishedAt: { type: DataTypes.DATE, allowNull: false },
          createdAt: { type: DataTypes.DATE, allowNull: false },
          updatedAt: { type: DataTypes.DATE, allowNull: false },
        },
        { transaction },
      );
    } else {
      const postColumns = await queryInterface.describeTable("Posts");
      if (postColumns.classification)
        await queryInterface.removeColumn("Posts", "classification", {
          transaction,
        });
    }

    if (existing.has("PostTopics") && !existing.has("PostFeeds")) {
      await queryInterface.renameTable("PostTopics", "PostFeeds", {
        transaction,
      });
      await queryInterface.renameColumn("PostFeeds", "topicId", "feedId", {
        transaction,
      });
    } else if (!existing.has("PostFeeds")) {
      await queryInterface.createTable(
        "PostFeeds",
        {
          postId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: { model: "Posts", key: "id" },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          },
          feedId: {
            type: DataTypes.STRING,
            primaryKey: true,
            references: { model: "Feeds", key: "id" },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          },
          createdAt: { type: DataTypes.DATE, allowNull: false },
          updatedAt: { type: DataTypes.DATE, allowNull: false },
        },
        { transaction },
      );
    }

    if (!existing.has("RequestCounters")) {
      await queryInterface.createTable(
        "RequestCounters",
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          key: { type: DataTypes.STRING, allowNull: false, unique: true },
          count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
          updatedAt: { type: DataTypes.DATE, allowNull: false },
        },
        { transaction },
      );
    }

    await addIndexIfMissing(
      queryInterface,
      "Posts",
      ["publishedAt"],
      "posts_published_at",
      transaction,
    );
    await addIndexIfMissing(queryInterface, "Posts", ["authorId"], "posts_author_id", transaction);
    await addIndexIfMissing(
      queryInterface,
      "PostFeeds",
      ["postId", "feedId"],
      "post_feeds_unique",
      transaction,
      true,
    );
    await addIndexIfMissing(
      queryInterface,
      "PostFeeds",
      ["feedId"],
      "post_feeds_feed_id",
      transaction,
    );
  },
};

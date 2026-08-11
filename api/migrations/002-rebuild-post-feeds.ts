import type { Sequelize, Transaction } from "sequelize";

export const rebuildPostFeedsMigration = {
  name: "002-rebuild-post-feeds",
  async up(sequelize: Sequelize, transaction: Transaction) {
    await sequelize.query(
      `CREATE TABLE PostFeeds_rebuilt (
        postId INTEGER NOT NULL REFERENCES Posts(id) ON DELETE CASCADE ON UPDATE CASCADE,
        feedId VARCHAR(255) NOT NULL REFERENCES Feeds(id) ON DELETE CASCADE ON UPDATE CASCADE,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        PRIMARY KEY (postId, feedId)
      )`,
      { transaction },
    );
    await sequelize.query(
      `INSERT OR IGNORE INTO PostFeeds_rebuilt (postId, feedId, createdAt, updatedAt)
       SELECT postId, feedId, createdAt, updatedAt FROM PostFeeds`,
      { transaction },
    );
    await sequelize.query("DROP TABLE PostFeeds", { transaction });
    await sequelize.query("ALTER TABLE PostFeeds_rebuilt RENAME TO PostFeeds", { transaction });
    await sequelize.query(
      "CREATE UNIQUE INDEX post_feeds_post_feed_unique ON PostFeeds (postId, feedId)",
      { transaction },
    );
    await sequelize.query("CREATE INDEX post_feeds_feed_id ON PostFeeds (feedId)", { transaction });
  },
};

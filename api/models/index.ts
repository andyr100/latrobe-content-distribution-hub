import type { Sequelize } from "sequelize";
import { Feed, initialiseFeed } from "./Feed";
import { Post, initialisePost } from "./Post";
import { initialisePostFeed, PostFeed } from "./PostFeed";
import { initialiseRequestCounter, RequestCounter } from "./RequestCounter";
import { initialiseUser, User } from "./User";
import { Alert, initialiseAlert } from "./Alert";
import { FeedStatusEvent, initialiseFeedStatusEvent } from "./FeedStatusEvent";
import { initialiseRequestLog, RequestLog } from "./RequestLog";
import { initialiseRssUser, RssUser } from "./RssUser";

export type { AlertSeverity } from "./Alert";
export type { FeedStatus } from "./FeedStatusEvent";

export { Alert, Feed, FeedStatusEvent, Post, PostFeed, RequestCounter, RequestLog, RssUser, User };

let modelsInitialised = false;

export function initialiseModels(sequelize: Sequelize) {
  if (modelsInitialised) return;

  initialiseUser(sequelize);
  initialisePost(sequelize);
  initialiseFeed(sequelize);
  initialisePostFeed(sequelize);
  initialiseRequestCounter(sequelize);
  initialiseRequestLog(sequelize);
  initialiseRssUser(sequelize);
  initialiseFeedStatusEvent(sequelize);
  initialiseAlert(sequelize);

  User.hasMany(Post, {
    foreignKey: "authorId",
    as: "posts",
    onDelete: "RESTRICT",
  });
  Post.belongsTo(User, {
    foreignKey: "authorId",
    as: "author",
    onDelete: "RESTRICT",
  });
  Post.belongsToMany(Feed, {
    through: PostFeed,
    foreignKey: "postId",
    otherKey: "feedId",
    as: "feeds",
    onDelete: "CASCADE",
  });
  Feed.belongsToMany(Post, {
    through: PostFeed,
    foreignKey: "feedId",
    otherKey: "postId",
    as: "posts",
    onDelete: "CASCADE",
  });
  Feed.hasMany(RequestLog, { foreignKey: "feedId", as: "requestLogs", onDelete: "SET NULL" });
  RequestLog.belongsTo(Feed, { foreignKey: "feedId", as: "feed", onDelete: "SET NULL" });
  RssUser.hasMany(RequestLog, { foreignKey: "rssUserId", as: "requestLogs", onDelete: "SET NULL" });
  RequestLog.belongsTo(RssUser, { foreignKey: "rssUserId", as: "rssUser", onDelete: "SET NULL" });
  Feed.hasMany(FeedStatusEvent, {
    foreignKey: "feedId",
    as: "statusEvents",
    onDelete: "CASCADE",
  });
  FeedStatusEvent.belongsTo(Feed, {
    foreignKey: "feedId",
    as: "feed",
    onDelete: "CASCADE",
  });
  Feed.hasMany(Alert, { foreignKey: "feedId", as: "alerts", onDelete: "SET NULL" });
  Alert.belongsTo(Feed, { foreignKey: "feedId", as: "feed", onDelete: "SET NULL" });

  modelsInitialised = true;
}

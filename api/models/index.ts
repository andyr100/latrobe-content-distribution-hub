import type { Sequelize } from "sequelize";
import { Feed, initialiseFeed } from "./Feed";
import { Post, initialisePost } from "./Post";
import { initialisePostFeed, PostFeed } from "./PostFeed";
import { initialiseRequestCounter, RequestCounter } from "./RequestCounter";
import { initialiseUser, User } from "./User";

export { Feed, Post, PostFeed, RequestCounter, User };

let modelsInitialised = false;

export function initialiseModels(sequelize: Sequelize) {
  if (modelsInitialised) return;

  initialiseUser(sequelize);
  initialisePost(sequelize);
  initialiseFeed(sequelize);
  initialisePostFeed(sequelize);
  initialiseRequestCounter(sequelize);

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

  modelsInitialised = true;
}

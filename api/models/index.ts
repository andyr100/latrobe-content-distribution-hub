import { DataTypes, Model, Sequelize } from "sequelize";

export class User extends Model { declare id: string; declare name: string; declare email: string; declare role: "Administrator" | "Lecturer"; }
export class Post extends Model { declare id: number; declare title: string; declare body: string; declare classification: string; declare authorId: string; declare imageUrl: string | null; declare externalLink: string | null; declare publishedAt: Date; }
export class Topic extends Model { declare id: string; declare code: string; declare name: string; declare description: string; }
export class PostTopic extends Model { declare postId: number; declare topicId: string; }
export class RequestCounter extends Model { declare id: number; declare key: string; declare count: number; }

let modelsInitialised = false;
export function initialiseModels(sequelize: Sequelize) {
  if (modelsInitialised) return;
  User.init({ id: { type: DataTypes.STRING, primaryKey: true }, name: { type: DataTypes.STRING, allowNull: false }, email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } }, role: { type: DataTypes.ENUM("Administrator", "Lecturer"), allowNull: false } }, { sequelize, modelName: "User" });
  Post.init({ id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, title: { type: DataTypes.STRING(100), allowNull: false }, body: { type: DataTypes.TEXT, allowNull: false }, classification: { type: DataTypes.STRING, allowNull: false }, authorId: { type: DataTypes.STRING, allowNull: false }, imageUrl: { type: DataTypes.STRING, allowNull: true }, externalLink: { type: DataTypes.STRING, allowNull: true }, publishedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW } }, { sequelize, modelName: "Post" });
  Topic.init({ id: { type: DataTypes.STRING, primaryKey: true }, code: { type: DataTypes.STRING(20), allowNull: false, unique: true }, name: { type: DataTypes.STRING, allowNull: false }, description: { type: DataTypes.TEXT, allowNull: false } }, { sequelize, modelName: "Topic" });
  PostTopic.init({ postId: { type: DataTypes.INTEGER, primaryKey: true }, topicId: { type: DataTypes.STRING, primaryKey: true } }, { sequelize, modelName: "PostTopic", indexes: [{ unique: true, fields: ["postId", "topicId"] }] });
  RequestCounter.init({ id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, key: { type: DataTypes.STRING, allowNull: false, unique: true }, count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 } }, { sequelize, modelName: "RequestCounter", updatedAt: true, createdAt: false });
  User.hasMany(Post, { foreignKey: "authorId", as: "posts" }); Post.belongsTo(User, { foreignKey: "authorId", as: "author" });
  Post.belongsToMany(Topic, { through: PostTopic, foreignKey: "postId", otherKey: "topicId", as: "topics" }); Topic.belongsToMany(Post, { through: PostTopic, foreignKey: "topicId", otherKey: "postId", as: "posts" });
  modelsInitialised = true;
}

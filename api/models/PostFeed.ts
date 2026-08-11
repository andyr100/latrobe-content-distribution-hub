import { DataTypes, Model, type Sequelize } from "sequelize";

export class PostFeed extends Model {
  declare postId: number;
  declare feedId: string;
}

export function initialisePostFeed(sequelize: Sequelize) {
  PostFeed.init(
    {
      postId: { type: DataTypes.INTEGER, primaryKey: true },
      feedId: { type: DataTypes.STRING, primaryKey: true },
    },
    {
      sequelize,
      modelName: "PostFeed",
      tableName: "PostFeeds",
      indexes: [{ unique: true, fields: ["postId", "feedId"] }, { fields: ["feedId"] }],
    },
  );
}

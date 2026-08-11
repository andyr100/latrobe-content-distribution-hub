import { DataTypes, Model, type Sequelize } from "sequelize";

export class Post extends Model {
  declare id: number;
  declare title: string;
  declare body: string;
  declare authorId: string;
  declare imageUrl: string | null;
  declare externalLink: string | null;
  declare publishedAt: Date;
}

export function initialisePost(sequelize: Sequelize) {
  Post.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING(100), allowNull: false },
      body: { type: DataTypes.TEXT, allowNull: false },
      authorId: { type: DataTypes.STRING, allowNull: false },
      imageUrl: { type: DataTypes.STRING, allowNull: true },
      externalLink: { type: DataTypes.STRING, allowNull: true },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Post",
      tableName: "Posts",
      indexes: [{ fields: ["publishedAt"] }, { fields: ["authorId"] }],
    },
  );
}

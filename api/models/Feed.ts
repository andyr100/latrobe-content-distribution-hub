import { DataTypes, Model, type Sequelize } from "sequelize";

export class Feed extends Model {
  declare id: string;
  declare code: string;
  declare title: string;
  declare description: string;
  declare slug: string;
}

export function initialiseFeed(sequelize: Sequelize) {
  Feed.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      slug: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    },
    { sequelize, modelName: "Feed", tableName: "Feeds" },
  );
}

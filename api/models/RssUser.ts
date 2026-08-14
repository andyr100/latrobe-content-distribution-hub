import { DataTypes, Model, type Sequelize } from "sequelize";

export class RssUser extends Model {
  declare id: string;
  declare name: string;
  declare email: string;
  declare role: "Student";
}

export function initialiseRssUser(sequelize: Sequelize) {
  RssUser.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      role: { type: DataTypes.ENUM("Student"), allowNull: false, defaultValue: "Student" },
    },
    { sequelize, modelName: "RssUser", tableName: "RssUsers" },
  );
}

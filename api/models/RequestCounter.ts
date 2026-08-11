import { DataTypes, Model, type Sequelize } from "sequelize";

export class RequestCounter extends Model {
  declare id: number;
  declare key: string;
  declare count: number;
}

export function initialiseRequestCounter(sequelize: Sequelize) {
  RequestCounter.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      key: { type: DataTypes.STRING, allowNull: false, unique: true },
      count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    {
      sequelize,
      modelName: "RequestCounter",
      tableName: "RequestCounters",
      updatedAt: true,
      createdAt: false,
    },
  );
}

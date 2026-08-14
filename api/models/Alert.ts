import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from "sequelize";

export type AlertSeverity = "INFO" | "WARNING" | "ERROR";

export class Alert extends Model<InferAttributes<Alert>, InferCreationAttributes<Alert>> {
  declare id: CreationOptional<number>;
  declare feedId: string | null;
  declare type: string;
  declare severity: AlertSeverity;
  declare message: string;
  declare resolved: CreationOptional<boolean>;
  declare resolvedAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function initialiseAlert(sequelize: Sequelize) {
  Alert.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      feedId: { type: DataTypes.STRING, allowNull: true },
      type: { type: DataTypes.STRING(50), allowNull: false },
      severity: { type: DataTypes.STRING(20), allowNull: false },
      message: { type: DataTypes.STRING(500), allowNull: false },
      resolved: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      resolvedAt: { type: DataTypes.DATE, allowNull: true },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Alert",
      tableName: "Alerts",
      indexes: [
        { fields: ["createdAt"] },
        { fields: ["resolved", "severity"] },
        { fields: ["feedId"] },
      ],
    },
  );
}

import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from "sequelize";

export class RequestLog extends Model<
  InferAttributes<RequestLog>,
  InferCreationAttributes<RequestLog>
> {
  declare id: CreationOptional<number>;
  declare clientId: string;
  declare rssUserId: string | null;
  declare feedId: string | null;
  declare endpoint: string;
  declare method: string;
  declare statusCode: number;
  declare success: boolean;
  declare durationMs: number;
  declare requestedAt: Date;
  declare userAgent: string | null;
  declare source: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function initialiseRequestLog(sequelize: Sequelize) {
  RequestLog.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      clientId: { type: DataTypes.STRING(100), allowNull: false },
      rssUserId: { type: DataTypes.STRING, allowNull: true },
      feedId: { type: DataTypes.STRING, allowNull: true },
      endpoint: { type: DataTypes.STRING(255), allowNull: false },
      method: { type: DataTypes.STRING(10), allowNull: false },
      statusCode: { type: DataTypes.INTEGER, allowNull: false },
      success: { type: DataTypes.BOOLEAN, allowNull: false },
      durationMs: { type: DataTypes.INTEGER, allowNull: false },
      requestedAt: { type: DataTypes.DATE, allowNull: false },
      userAgent: { type: DataTypes.STRING(500), allowNull: true },
      source: { type: DataTypes.STRING(50), allowNull: true },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "RequestLog",
      tableName: "RequestLogs",
      indexes: [
        { fields: ["requestedAt"] },
        { fields: ["clientId"] },
        { fields: ["rssUserId"] },
        { fields: ["feedId"] },
        { fields: ["feedId", "requestedAt"] },
      ],
    },
  );
}

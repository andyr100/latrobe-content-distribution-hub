import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from "sequelize";

export type FeedStatus = "HEALTHY" | "EMPTY" | "WARNING" | "ERROR";

export class FeedStatusEvent extends Model<
  InferAttributes<FeedStatusEvent>,
  InferCreationAttributes<FeedStatusEvent>
> {
  declare id: CreationOptional<number>;
  declare feedId: string;
  declare status: FeedStatus;
  declare itemCount: number;
  declare httpStatus: number;
  declare latencyMs: number;
  declare message: string | null;
  declare checkedAt: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function initialiseFeedStatusEvent(sequelize: Sequelize) {
  FeedStatusEvent.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      feedId: { type: DataTypes.STRING, allowNull: false },
      status: { type: DataTypes.STRING(20), allowNull: false },
      itemCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      httpStatus: { type: DataTypes.INTEGER, allowNull: false },
      latencyMs: { type: DataTypes.INTEGER, allowNull: false },
      message: { type: DataTypes.STRING(500), allowNull: true },
      checkedAt: { type: DataTypes.DATE, allowNull: false },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "FeedStatusEvent",
      tableName: "FeedStatusEvents",
      indexes: [{ fields: ["checkedAt"] }, { fields: ["feedId", "checkedAt"] }],
    },
  );
}

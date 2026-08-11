import { DataTypes, Model, type Sequelize } from "sequelize";

export class User extends Model {
  declare id: string;
  declare name: string;
  declare email: string;
  declare role: "Administrator" | "Lecturer";
}

export function initialiseUser(sequelize: Sequelize) {
  User.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      role: {
        type: DataTypes.ENUM("Administrator", "Lecturer"),
        allowNull: false,
      },
    },
    { sequelize, modelName: "User", tableName: "Users" },
  );
}

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Cargo from "./cargoModels.js";

const Users = sequelize.define("users", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cargo_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Cargo,
            key: 'id'
        },
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    tableName: "users",
    timestamps: true,
    updatedAt: true
})

export default Users
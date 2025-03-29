import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Users = sequelize.define("User", {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cargo: {
        type: DataTypes.ENUM,
        values:['funcionario','administrador','suporte','cliente'],
        allowNull: false
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    tableName: "Users",
    timestamps: true,
    updatedAt: true
})

export default Users
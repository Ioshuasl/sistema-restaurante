import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Cargo = sequelize.define('Cargo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    descricao: {
        type: DataTypes.STRING,
        allowNull: true
    },
    admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    tableName: 'cargos',
    timestamps: false
});

export default Cargo;
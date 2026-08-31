import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const CategoriaProduto = sequelize.define('categoria_produtos',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nomeCategoriaProduto: {
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    tableName: 'categoria_produtos',
    timestamps: true
})

export default CategoriaProduto
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
    },
    tipoMenu: {
        type: DataTypes.ENUM('dia', 'noite', 'ambos'),
        allowNull: false,
        defaultValue: 'ambos',
        comment: 'Cardápio: dia, noite ou ambos'
    }
},{
    tableName: 'categoria_produtos',
    timestamps: true
})

export default CategoriaProduto
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
        defaultValue: 'dia',
        comment: 'Cardápio: dia, noite ou ambos'
    },
    ordem: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Ordem de exibição no cardápio (menor = primeiro)'
    }
},{
    tableName: 'categoria_produtos',
    timestamps: true
})

export default CategoriaProduto
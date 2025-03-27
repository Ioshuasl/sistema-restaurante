import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import CategoriaProduto from "./categoriaProdutoModels.js";

const Produto = sequelize.define('Produto',{
    nomeProduto: {
        type: DataTypes.STRING,
        allowNull:false
    },
    valorProduto: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    isAtivo: {
        type: DataTypes.BOOLEAN
    },
    categoriaProduto_id: {
        type: DataTypes.INTEGER,
        references: {
            model: CategoriaProduto,
            key: 'id'
        }
    }
},{
    tableName: 'Produtos',
    timestamps: true
})

Produto.belongsTo(CategoriaProduto, {foreignKey:'categoriaProduto_id'})

export default Produto
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import GrupoOpcao from "./grupoOpcaoModels.js";

const SubProduto = sequelize.define("subprodutos", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nomeSubProduto: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isAtivo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    valorAdicional: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    grupoOpcao_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: GrupoOpcao, 
            key: "id"
        },
        onDelete: 'CASCADE'
    }
},{
    tableName: "subprodutos",
    timestamps: true
});

export default SubProduto;
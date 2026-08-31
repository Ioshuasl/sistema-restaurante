import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Produto from "./produtoModels.js";

const GrupoOpcao = sequelize.define('grupoopcoes', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nomeGrupo: {
        type: DataTypes.STRING,
        allowNull: false // Ex: "Escolha seu Arroz", "Carnes", "Saladas"
    },
    minEscolhas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1 // Quantidade mínima de itens que o cliente DEVE escolher
    },
    maxEscolhas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1 // Quantidade máxima de itens que o cliente PODE escolher
    },
    produto_id: { // Chave estrangeira para o Produto (Marmita)
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Produto,
            key: 'id'
        },
        onDelete: 'CASCADE' // Se deletar o Produto, deleta o grupo
    }
}, {
    tableName: 'grupoopcoes',
    timestamps: true
});

export default GrupoOpcao;
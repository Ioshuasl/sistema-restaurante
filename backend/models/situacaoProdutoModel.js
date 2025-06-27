import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Pedido from "./pedidoModels.js";

const SituacaoPedido = sequelize.define('situacaopedidos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descricao: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pedido_id: {
        type: DataTypes.INTEGER,
        references:{
            model: Pedido,
            key:'id'
        },
        allowNull: false
    }
}, {
    tableName: 'situacaopedidos',
    timestamps: false
})

export default SituacaoPedido
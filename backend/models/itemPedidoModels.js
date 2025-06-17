import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Pedido from "./pedidoModels.js";
import Produto from "./produtoModels.js";

const ItemPedido = sequelize.define('itenspedidos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    pedidoId: {
        type: DataTypes.INTEGER,
        references: {
            model: Pedido, 
            key: 'id'
        },
        allowNull: false
    },
    produtoId: {
        type: DataTypes.INTEGER,
        references: {
            model: Produto,
            key: 'id'
        },
        allowNull: false
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    precoUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'itenspedidos',
    timestamps: false // Geralmente não precisa de timestamps aqui
});

export default ItemPedido;
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Pedido = sequelize.define('Pedido',{
    produtosPedido:{
        type: DataTypes.JSONB,
        allowNull: false
    },
    valorPedido: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    formaPagamento_id: {
        type: DataTypes.INTEGER,
        references:{
            model: 'FormaPagamento',
            key: 'id'
        },
        allowNull: false
    },
    isRetiradaEstabelecimento: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    nomeCliente:{
        type: DataTypes.STRING,
        allowNull: false
    },
    enderecoCliente: {
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    tableName:'produtos',
    timestamps: true
})

export default Pedido
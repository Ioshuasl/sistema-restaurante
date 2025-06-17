import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import FormaPagamento from "./formaPagamentoModels.js";

const Pedido = sequelize.define('pedidos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    valorTotalPedido: {
        type: DataTypes.DECIMAL(10, 2), // DECIMAL é mais preciso para valores monetários que FLOAT.
        allowNull: false
    },
    formaPagamento_id: {
        type: DataTypes.INTEGER,
        references: {
            model: FormaPagamento, // Garanta que 'FormaPagamento' é o nome da tabela correto.
            key: 'id'
        },
        allowNull: false
    },
    isRetiradaEstabelecimento: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    nomeCliente: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // Opcional: O endereço só é obrigatório se não for para retirada no estabelecimento.
    enderecoCliente: {
        type: DataTypes.STRING,
        allowNull: true // Pode ser nulo se isRetiradaEstabelecimento for true.
    }
}, {
    // CORREÇÃO CRÍTICA: O nome da tabela foi corrigido.
    tableName: 'pedidos',
    timestamps: true
});

export default Pedido;
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
    situacaoPedido: {
        type: DataTypes.ENUM('preparando','entrega','finalizado'),
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
    telefoneCliente: {
        type: DataTypes.STRING(15), // Formato "(00) 00000-0000"
        allowNull: false
    },
    //dados relacionados ao endereço de entrega do cliente
    cepCliente: {
        type: DataTypes.STRING(9), // Formato "00000-000"
        allowNull: false
    },
    tipoLogadouroCliente: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Rua'
    },
    logadouroCliente: {
        type: DataTypes.STRING,
        allowNull: false
    },
    numeroCliente: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quadraCliente: {
        type: DataTypes.STRING,
        allowNull: true // Campos como quadra e lote podem não ser aplicáveis a todos os endereços
    },
    loteCliente: {
        type: DataTypes.STRING,
        allowNull: true // Permitir nulo para maior flexibilidade
    },
    bairroCliente: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cidadeCliente: {
        type: DataTypes.STRING,
        allowNull: false
    },
    estadoCliente: {
        type: DataTypes.STRING(2), //UF (ex: "GO", "SP")
        allowNull: false
    }
}, {
    tableName: 'pedidos',
    timestamps: true
});

export default Pedido;
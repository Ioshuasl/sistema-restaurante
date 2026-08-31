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
    numeroDiario: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1 // Começa com 1 se falhar a lógica
    },
    valorTotalPedido: {
        type: DataTypes.DECIMAL(10, 2), // DECIMAL é mais preciso para valores monetários que FLOAT.
        allowNull: false
    },
    situacaoPedido: {
        type: DataTypes.ENUM('preparando', 'entrega', 'finalizado', 'cancelado'),
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
        type: DataTypes.STRING(9),
        allowNull: true // Alterado de false para true
    },
    tipoLogadouroCliente: {
        type: DataTypes.STRING,
        allowNull: true, // Alterado de false para true
        defaultValue: 'Rua'
    },
    logadouroCliente: { // Aproveite para corrigir a grafia se quiser (Logradouro)
        type: DataTypes.STRING,
        allowNull: true // Alterado de false para true
    },
    numeroCliente: {
        type: DataTypes.STRING,
        allowNull: true // Alterado de false para true
    },
    quadraCliente: {
        type: DataTypes.STRING,
        allowNull: true // Alterado de false para true
    },
    loteCliente: {
        type: DataTypes.STRING,
        allowNull: true // Alterado de false para true
    },
    // Quadra e Lote já eram true, mantêm-se assim
    bairroCliente: {
        type: DataTypes.STRING,
        allowNull: true // Alterado de false para true
    },
    cidadeCliente: {
        type: DataTypes.STRING,
        allowNull: true // Alterado de false para true
    },
    estadoCliente: {
        type: DataTypes.STRING(2),
        allowNull: true // Alterado de false para true
    },
    tempoEspera: {
        type: DataTypes.STRING,
        allowNull: true // Pode ser nulo se não for informado
    },
    observacao: { // Novo campo para instruções do cliente
        type: DataTypes.TEXT,
        allowNull: true // Opcional, pois nem todo pedido tem observação
    }
}, {
    tableName: 'pedidos',
    timestamps: true
});

export default Pedido;
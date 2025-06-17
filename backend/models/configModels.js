import { DataTypes } from "sequelize";
import sequelize from "../config/database.js"; // Ajuste o caminho se necessário

const Config = sequelize.define('config', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    cnpj: {
        type: DataTypes.STRING(18), // Ex: "00.000.000/0000-00"
        allowNull: false,
        unique: true, // Garante que não haja outra configuração com o mesmo CNPJ
        validate: {
            notEmpty: {
                msg: "O CNPJ não pode ser vazio."
            }
        }
    },
    razaoSocial: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "A Razão Social não pode ser vazia."
            }
        }
    },
    nomeFantasia: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "O Nome Fantasia não pode ser vazio."
            }
        }
    },
    cep: {
        type: DataTypes.STRING(9), // Formato "00000-000"
        allowNull: false
    },
    tipoLogadouro: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Rua'
    },
    logadouro: {
        type: DataTypes.STRING,
        allowNull: false
    },
    numero: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quadra: {
        type: DataTypes.STRING,
        allowNull: true // Campos como quadra e lote podem não ser aplicáveis a todos os endereços
    },
    lote: {
        type: DataTypes.STRING,
        allowNull: true // Permitir nulo para maior flexibilidade
    },
    bairro: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cidade: {
        type: DataTypes.STRING,
        allowNull: false
    },
    estado: {
        type: DataTypes.STRING(2), //UF (ex: "GO", "SP")
        allowNull: false
    },
    telefone: {
        type: DataTypes.STRING(15), // Formato "(00) 00000-0000"
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: {
                msg: "Por favor, insira um formato de e-mail válido."
            }
        }
    },
    taxaEntrega: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            isDecimal: true,
            min: 0
        }
    }
}, {
    tableName: 'config',
    timestamps: true 
});

export default Config;
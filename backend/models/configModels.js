import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Config = sequelize.define('config', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    cnpj: {
        type: DataTypes.STRING(18),
        allowNull: false,
        unique: true,
        validate: { notEmpty: { msg: "O CNPJ não pode ser vazio." } }
    },
    razaoSocial: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: { msg: "A Razão Social não pode ser vazia." } }
    },
    nomeFantasia: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: { msg: "O Nome Fantasia não pode ser vazio." } }
    },
    cep: {
        type: DataTypes.STRING(9),
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
        allowNull: true
    },
    lote: {
        type: DataTypes.STRING,
        allowNull: true
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
        type: DataTypes.STRING(2),
        allowNull: false
    },
    telefone: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: { msg: "E-mail inválido." } }
    },
    taxaEntrega: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    tipoChavePix: {
        type: DataTypes.ENUM('cpf', 'cnpj', 'email', 'telefone', 'aleatoria'),
        allowNull: true,
        defaultValue: 'cnpj'
    },
    chavePix: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    evolutionInstanceName: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
    },
    urlAgenteImpressao: {
        type: DataTypes.STRING,
        allowNull: true
    },
    nomeImpressora: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // --- CAMPOS DE APARÊNCIA E LAYOUT ---
    menuLayout: {
        type: DataTypes.ENUM('modern', 'compact', 'minimalist'),
        allowNull: false,
        defaultValue: 'modern'
    },
    primaryColor: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '#dc2626', // Vermelho padrão
        validate: {
            is: /^#([0-9a-f]{3}){1,2}$/i // Valida se é um código Hexadecimal
        }
    },
    fontFamily: {
        type: DataTypes.ENUM('sans', 'serif', 'mono', 'poppins'),
        allowNull: false,
        defaultValue: 'sans'
    },
    borderRadius: {
        type: DataTypes.ENUM('0px', '8px', '16px', '9999px'),
        allowNull: false,
        defaultValue: '16px'
    },
    showBanner: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    bannerImage: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isValidBanner(value) {
                if (value == null || value === '') return;
                // Aceita URL absoluta ou caminho relativo de upload
                const ok =
                    /^https?:\/\//i.test(value) ||
                    value.startsWith('/uploads/');
                if (!ok) {
                    throw new Error('bannerImage deve ser uma URL ou caminho /uploads/…');
                }
            }
        }
    },
    horariosFuncionamento: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [
            {
                dia: 0, aberto: true, inicio: "11:00", fim: "23:00",
                periodos: {
                    dia: { ativo: true, inicio: "11:00", fim: "15:00" },
                    noite: { ativo: true, inicio: "18:00", fim: "23:00" }
                }
            },
            {
                dia: 1, aberto: true, inicio: "11:00", fim: "23:00",
                periodos: {
                    dia: { ativo: true, inicio: "11:00", fim: "15:00" },
                    noite: { ativo: true, inicio: "18:00", fim: "23:00" }
                }
            },
            {
                dia: 2, aberto: true, inicio: "11:00", fim: "23:00",
                periodos: {
                    dia: { ativo: true, inicio: "11:00", fim: "15:00" },
                    noite: { ativo: true, inicio: "18:00", fim: "23:00" }
                }
            },
            {
                dia: 3, aberto: true, inicio: "11:00", fim: "23:00",
                periodos: {
                    dia: { ativo: true, inicio: "11:00", fim: "15:00" },
                    noite: { ativo: true, inicio: "18:00", fim: "23:00" }
                }
            },
            {
                dia: 4, aberto: true, inicio: "11:00", fim: "23:00",
                periodos: {
                    dia: { ativo: true, inicio: "11:00", fim: "15:00" },
                    noite: { ativo: true, inicio: "18:00", fim: "23:00" }
                }
            },
            {
                dia: 5, aberto: true, inicio: "11:00", fim: "23:00",
                periodos: {
                    dia: { ativo: true, inicio: "11:00", fim: "15:00" },
                    noite: { ativo: true, inicio: "18:00", fim: "23:00" }
                }
            },
            {
                dia: 6, aberto: true, inicio: "11:00", fim: "23:00",
                periodos: {
                    dia: { ativo: true, inicio: "11:00", fim: "15:00" },
                    noite: { ativo: true, inicio: "18:00", fim: "23:00" }
                }
            }
        ],
        comment: "Horários semanais: por dia, Almoço (dia) e Jantar (noite) com ativo/inicio/fim"
    },
    periodosCardapio: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {
            dia: { inicio: "11:00", fim: "15:00" },
            noite: { inicio: "18:00", fim: "23:00" }
        },
        comment: "Template padrão de períodos; horários efetivos ficam em horariosFuncionamento[].periodos"
    },
}, {
    tableName: 'config',
    timestamps: true
});

export default Config;
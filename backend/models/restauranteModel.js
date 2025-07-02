import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const Restaurante = sequelize.define('Restaurante', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cnpj: {
        type: DataTypes.STRING,
        allowNull:false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telefone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cep: {
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    tableName:"Restaurantes"
})

export default Restaurante
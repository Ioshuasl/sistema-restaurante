import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const FormaPagamento = sequelize.define('FormaPagamento',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nomeFormaPagamento: {
        type: DataTypes.STRING,
        allowNull:false
    }
},{
    tableName:'FormaPagamento',
    timestamps: true
})

export default FormaPagamento
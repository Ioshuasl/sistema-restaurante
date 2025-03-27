import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Pedido from "./pedidoModels.js";

const FormaPagamento = sequelize.define('FormaPagamento',{
    nomeFormaPagamento: {
        type: DataTypes.STRING,
        allowNull:false
    }
},{
    tableName:'FormaPagamento',
    timestamps: true
})

FormaPagamento.hasMany(Pedido, {foreignKey:'formaPagamento_id'})

export default FormaPagamento
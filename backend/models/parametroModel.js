import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Restaurante from "./restauranteModel.js";

const Parametro = sequelize.define('Parametro',{
    taxaFrete: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    restaurante_id:{
        type: DataTypes.INTEGER,
        references: {
            model:Restaurante,
            key:'id'
        },
        allowNull:false
    }
},{
    tableName:"Parametros"
})

export default Parametro
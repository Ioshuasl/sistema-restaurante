import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Produto from "./produtoModels.js";

const CategoriaProduto = sequelize.define('CategoriaProduto',{
    nomeCategoriaProduto: {
        type: DataTypes.STRING
    }
})

CategoriaProduto.hasMany(Produto,{foreignKey:'categoriaProduto_id'})

export default CategoriaProduto
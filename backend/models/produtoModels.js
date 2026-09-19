import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import CategoriaProduto from '../models/categoriaProdutoModels.js'

const Produto = sequelize.define('produtos',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nomeProduto: {
        type: DataTypes.STRING,
        allowNull:false
    },
    valorProduto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    descricao: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isAtivo: {
        type: DataTypes.BOOLEAN
    },
    tipoMenu: {
        type: DataTypes.ENUM('dia', 'noite', 'ambos'),
        allowNull: false,
        defaultValue: 'ambos',
        comment: 'Cardápio: dia (marmitas), noite (espetinhos) ou ambos'
    },
    categoriaProduto_id: {
        type: DataTypes.INTEGER,
        references: {
            model: CategoriaProduto,
            key: 'id'
        }
    }
},{
    tableName: 'produtos',
    timestamps: true
})

export default Produto
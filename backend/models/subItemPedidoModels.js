import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import ItemPedido from './itemPedidoModels.js';
import SubProduto from './subProdutoModels.js';

const SubItemPedido = sequelize.define('subitempedido', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    itemPedidoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: ItemPedido,
            key: 'id'
        }
    },
    subProdutoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: SubProduto,
            key: 'id'
        }
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    precoAdicional: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    }
}, {
    tableName: 'subitempedido',
    timestamps: false
});

export default SubItemPedido;

import sequelize from "../config/database.js";
import Cargo from "./cargoModels.js";
import Users from "./usermodels.js";
import CategoriaProduto from "./categoriaProdutoModels.js";
import Produto from "./produtoModels.js";
import GrupoOpcao from "./grupoOpcaoModels.js";
import SubProduto from "./subProdutoModels.js";
import FormaPagamento from "./formaPagamentoModels.js";
import Pedido from "./pedidoModels.js";
import ItemPedido from "./itemPedidoModels.js";
import SubItemPedido from "./subItemPedidoModels.js";
import Config from "./configModels.js";

// --- RELACIONAMENTOS ---

// 1. Usuários e Cargos
Cargo.hasMany(Users, { foreignKey: 'cargo_id' });
Users.belongsTo(Cargo, { foreignKey: 'cargo_id' });

// 2. Catálogo de Produtos
CategoriaProduto.hasMany(Produto, { foreignKey: 'categoriaProduto_id' });
Produto.belongsTo(CategoriaProduto, { foreignKey: 'categoriaProduto_id' });

// 3. Customização (Marmitas/Combos)
Produto.hasMany(GrupoOpcao, { foreignKey: 'produto_id', as: 'gruposOpcoes', onDelete: 'CASCADE' });
GrupoOpcao.belongsTo(Produto, { foreignKey: 'produto_id' });

GrupoOpcao.hasMany(SubProduto, { foreignKey: 'grupoOpcao_id', as: 'opcoes', onDelete: 'CASCADE' });
SubProduto.belongsTo(GrupoOpcao, { foreignKey: 'grupoOpcao_id' });

// 4. Vendas (Pedidos)
FormaPagamento.hasMany(Pedido, { foreignKey: 'formaPagamento_id' });
Pedido.belongsTo(FormaPagamento, { foreignKey: 'formaPagamento_id' });

Pedido.hasMany(ItemPedido, { foreignKey: 'pedidoId', as: 'itensPedido' });
ItemPedido.belongsTo(Pedido, { foreignKey: 'pedidoId' });

// 5. Itens e Sub-itens do Pedido
Produto.hasMany(ItemPedido, { foreignKey: 'produtoId' });
ItemPedido.belongsTo(Produto, { foreignKey: 'produtoId' });

ItemPedido.hasMany(SubItemPedido, { foreignKey: 'itemPedidoId', as: 'subItensPedido' });
SubItemPedido.belongsTo(ItemPedido, { foreignKey: 'itemPedidoId' });

SubProduto.hasMany(SubItemPedido, { foreignKey: 'subProdutoId' });
SubItemPedido.belongsTo(SubProduto, { foreignKey: 'subProdutoId' });

export {
    sequelize,
    Cargo,
    Users,
    CategoriaProduto,
    Produto,
    GrupoOpcao,
    SubProduto,
    FormaPagamento,
    Pedido,
    ItemPedido,
    SubItemPedido,
    Config
};
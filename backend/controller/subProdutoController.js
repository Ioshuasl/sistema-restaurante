// controller/subProdutoController.js
import { Produto, SubProduto } from "../models/index.js";

class SubProdutoController {
  // criar subproduto vinculado a um produto
  async createSubProduto({ nomeSubProduto, valorAdicional, isAtivo, produto_id }) {
    try {
      // verifica se produto existe
      const produto = await Produto.findByPk(produto_id);
      if (!produto) {
        return { message: "Produto pai não encontrado.", subproduto: null };
      }

      const subproduto = await SubProduto.create({
        nomeSubProduto,
        valorAdicional,
        isAtivo,
        produto_id,
      });

      return subproduto;
    } catch (error) {
      console.error(error);
      return { message: "Erro ao criar subproduto", error };
    }
  }

  // listar todos os subprodutos (opcionalmente filtrar por produto_id)
  async findAllSubProdutos(produto_id = null) {
    try {
      const where = produto_id ? { produto_id } : undefined;
      const subprodutos = await SubProduto.findAll({ where });
      return subprodutos;
    } catch (error) {
      console.error(error);
      return { message: "Erro ao buscar subprodutos", error };
    }
  }

  // listar apenas subprodutos ativos de um produto
  async findAllAtivosByProduto(produto_id) {
    try {
      const subprodutos = await SubProduto.findAll({
        where: { produto_id, isAtivo: true },
      });
      return subprodutos;
    } catch (error) {
      console.error(error);
      return { message: "Erro ao buscar subprodutos ativos", error };
    }
  }

  // buscar subproduto por id
  async findSubProduto(id) {
    try {
      const subproduto = await SubProduto.findByPk(id);
      return subproduto;
    } catch (error) {
      console.error(error);
      return { message: "Erro ao buscar subproduto", error };
    }
  }

  // atualizar subproduto
  async updateSubProduto(id, dataUpdate) {
    try {
      const subproduto = await SubProduto.findByPk(id);
      if (!subproduto) {
        return { message: "Subproduto não encontrado", subproduto: null };
      }

      // se produto_id for alterado, verifica se o novo produto existe
      if (dataUpdate.produto_id && dataUpdate.produto_id !== subproduto.produto_id) {
        const novoProduto = await Produto.findByPk(dataUpdate.produto_id);
        if (!novoProduto) {
          return { message: "Novo produto pai não encontrado", subproduto: null };
        }
      }

      // aplica alterações e salva
      Object.assign(subproduto, dataUpdate);
      await subproduto.save();

      return { message: "Subproduto atualizado com sucesso", subproduto };
    } catch (error) {
      console.error(error);
      return { message: "Erro ao atualizar subproduto", error };
    }
  }

  // excluir subproduto
  async deleteSubProduto(id) {
    try {
      const subproduto = await SubProduto.findByPk(id);
      if (!subproduto) {
        return { message: "Subproduto não encontrado", subproduto: null };
      }

      await SubProduto.destroy({ where: { id } });
      return { message: "Subproduto excluído com sucesso", subproduto };
    } catch (error) {
      console.error(error);
      return { message: "Erro ao excluir subproduto", error };
    }
  }

  // ativar/desativar subproduto
  async toggleSubProdutoAtivo(id) {
    try {
      const subproduto = await SubProduto.findByPk(id);
      if (!subproduto) {
        return { message: "Subproduto não encontrado", subproduto: null };
      }

      subproduto.isAtivo = !subproduto.isAtivo;
      await subproduto.save();

      return { message: "Status do subproduto atualizado", subproduto };
    } catch (error) {
      console.error(error);
      return { message: "Erro ao alternar status do subproduto", error };
    }
  }
}

export default new SubProdutoController();

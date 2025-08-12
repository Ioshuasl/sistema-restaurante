import Produto from "../models/produtoModels.js"
import CategoriaProduto from "../models/categoriaProdutoModels.js"
import fs from 'fs/promises';
import path from 'path';

Produto.belongsTo(CategoriaProduto, {foreignKey:'categoriaProduto_id'})
CategoriaProduto.hasMany(Produto,{foreignKey:'categoriaProduto_id'})

class ProdutoController{

    //funcao para criar produto
    async createProduto(nomeProduto, valorProduto,image, isAtivo, categoriaProduto_id){

        //verificar se a categoria de produto selecionado existe
        const verificarCategoriaProduto = await CategoriaProduto.findByPk(categoriaProduto_id)
        console.log(verificarCategoriaProduto)

        try {
            const produto = await Produto.create(nomeProduto, valorProduto,image, isAtivo, categoriaProduto_id)
            return produto
        } catch (error) {
            console.error(error)
            return {message: "Erro ao tentar executar a função",error}
        }
    }

    //funcao para encontrar todos os produtos cadastrados no sistema
    async findAndCountAllProdutos(){
        try {
            const produtos = await Produto.findAndCountAll()
            return produtos
        } catch (error) {
            console.error(error)
            return {message: "Erro ao tentar executar a função",error}
        }
    }

    //funcao para encontrar todos os produtos que estiverem ativos no sistema
    async findAllProdutosAtivos(){
        try {
            const produtos = await Produto.findAll({
                where:{
                    isAtivo: true
                }
            })
            return produtos
        } catch (error) {
            console.error(error)
            return {message: "Erro ao tentar encontrar apenas os produtos ativos", error}
        }
    }

    //funcao para encontrar produto por ID
    async findProduto(id){
        try {
            const produto = await Produto.findByPk(id)
            return produto
        } catch (error) {
            console.error(error)
            return {message: "Erro ao tentar executar a função",error}
        }
    }

    //funcao para atualizar produto
    async updateProduto(id, dataUpdate) {
        try {
            // 1. Encontrar o produto atual para obter a imagem antiga
            const produtoAtual = await Produto.findByPk(id);

            if (!produtoAtual) {
                return { message: "Produto não encontrado", produto: null };
            }

            // 2. Extrair a URL da imagem antiga
            const imagemAntiga = produtoAtual.image;

            // 3. Atualizar o produto no banco de dados
            const produto = await Produto.update(dataUpdate, {
                where: { id: id }
            });

            // 4. Se a imagem foi alterada e a imagem antiga existe, excluí-la
            if (dataUpdate.image && dataUpdate.image !== imagemAntiga) {
                // Extrai o nome do arquivo da URL completa
                const nomeArquivoAntigo = path.basename(imagemAntiga);
                const caminhoArquivoAntigo = path.join(process.cwd(), 'public', 'uploads', nomeArquivoAntigo);

                try {
                    // Verifica se o arquivo existe antes de tentar excluir
                    await fs.access(caminhoArquivoAntigo);
                    await fs.unlink(caminhoArquivoAntigo);
                    console.log(`Imagem antiga ${nomeArquivoAntigo} excluída com sucesso.`);
                } catch (err) {
                    console.error(`Erro ao excluir imagem antiga ${nomeArquivoAntigo}:`, err);
                }
            }

            return { message: "Produto atualizado com sucesso", produto };
        } catch (error) {
            console.error(error);
            return { message: "Erro ao tentar executar a função", error };
        }
    }

    //funcao para excluir produto
    async deleteProduto(id){
        try {
            // 1. Encontrar o produto para obter a URL da imagem antes de deletá-lo
            const produtoParaDeletar = await Produto.findByPk(id);

            if (!produtoParaDeletar) {
                return { message: "Produto não encontrado.", produto: null };
            }

            const imagemParaDeletar = produtoParaDeletar.image;

            // 2. Excluir o produto do banco de dados
            const produto = await Produto.destroy({
                where: {id:id}
            })
            
            // 3. Excluir o arquivo de imagem do servidor, se a imagem existir
            if (imagemParaDeletar) {
                // Extrai o nome do arquivo da URL completa
                const nomeArquivo = path.basename(imagemParaDeletar);
                const caminhoArquivo = path.join(process.cwd(), 'public', 'uploads', nomeArquivo);

                try {
                    // Verifica se o arquivo existe antes de tentar excluir
                    await fs.access(caminhoArquivo);
                    await fs.unlink(caminhoArquivo);
                    console.log(`Imagem ${nomeArquivo} excluída com sucesso.`);
                } catch (err) {
                    console.error(`Erro ao excluir imagem ${nomeArquivo}:`, err);
                    // O erro pode ser ignorado se o arquivo já não existir, mas é bom logar.
                }
            }

            return {message:"Produto excluído com sucesso", produto}
        } catch (error) {
            console.error(error)
            return {message: "Erro ao tentar executar a função",error}
        }
    }
    
    //funcao para ativar ou desativar produto do sistema
    async toggleProdutoAtivo(id){

        const produto = await Produto.findByPk(id)

        //verificando se o produto foi encontrado antes de fazer as alteracoes
        if (produto){
            console.log("Produto encontrado, continua a funcao")
        } else {
            return {message: "Produto nao encontrado no sistema"}
        }

        try {
            //alternando o boolean do produto
            produto.isAtivo = !produto.isAtivo
            //salvando as alteracoes
            await produto.save()
            return produto
        } catch (error) {
            return {message:"Erro ao tentar modificar produto", error}
        }
    }
}

export default new ProdutoController()
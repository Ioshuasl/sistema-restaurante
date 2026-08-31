
import fs from 'fs/promises';
import path from 'path';
import { Sequelize, Op, fn, col, where, literal } from 'sequelize';
import { sequelize, CategoriaProduto, Produto, GrupoOpcao, SubProduto } from "../models/index.js";


// --- HELPER PARA INCLUDES ---
// Define a estrutura de inclusão aninhada para reuso
const includeGruposEopcoes = {
    model: GrupoOpcao,
    as: 'gruposOpcoes',
    include: {
        model: SubProduto,
        as: 'opcoes'
    }
};


class ProdutoController {

    // --- FUNÇÃO createProduto REFATORADA E CORRIGIDA ---
    async createProduto(nomeProduto, descricao, valorProduto, image, isAtivo, categoriaProduto_id, gruposOpcoes = []) {
        
        // Inicia uma transação
        const t = await sequelize.transaction();

        try {
            // 1. Verificar se a categoria existe
            const verificarCategoriaProduto = await CategoriaProduto.findByPk(categoriaProduto_id);
            if (!verificarCategoriaProduto) {
                await t.rollback();
                return { message: "Categoria de produto não encontrada." };
            }

            // 2. Criar o produto (dentro da transação)
            const produto = await Produto.create({
                nomeProduto,
                valorProduto,
                descricao,
                image,
                isAtivo,
                categoriaProduto_id
            }, { transaction: t });

            // 3. Criar os grupos e suas opções (subprodutos)
            if (gruposOpcoes && gruposOpcoes.length > 0) {
                for (const grupoData of gruposOpcoes) {
                    // Separa os dados do grupo (nome, min, max) dos dados das opções
                    // E remove o 'id' (ex: id: 0) enviado pelo frontend para grupos novos
                    const { id: grupoIdDescartado, opcoes, ...dadosGrupo } = grupoData;
                    
                    // Cria o GrupoOpcao
                    const grupo = await GrupoOpcao.create({
                        ...dadosGrupo,
                        produto_id: produto.id // Vincula ao produto recém-criado
                    }, { transaction: t });

                    // Cria os SubProdutos (opções) vinculados a este grupo
                    if (opcoes && opcoes.length > 0) {
                        
                        // *** CORREÇÃO DO BUG id: 0 ***
                        // Mapeia os subprodutos, removendo o 'id' enviado (ex: id: 0)
                        // para que o auto-incremento do banco funcione.
                        const subprodutosParaCriar = opcoes.map(sp => {
                            const { id, ...novaOpcaoData } = sp; // <-- Desestrutura o ID (removendo-o)
                            return {
                                ...novaOpcaoData, // <-- Passa só o resto dos dados
                                grupoOpcao_id: grupo.id
                            };
                        });
                        
                        await SubProduto.bulkCreate(subprodutosParaCriar, { transaction: t });
                    }
                }
            }

            // 4. Se tudo deu certo, "commita" a transação
            await t.commit();

            // 5. Retornar produto completo com os grupos e subprodutos
            const produtoComSubprodutos = await Produto.findByPk(produto.id, {
                include: [includeGruposEopcoes] // Usa o helper
            });

            return produtoComSubprodutos;
        } catch (error) {
            // 6. Se algo deu errado, "desfaz" a transação
            await t.rollback();
            console.error(error);
            return { message: "Erro ao tentar executar a função", error };
        }
    }

    // --- FUNÇÃO findAndCountAllProdutos REFATORADA ---
    async findAndCountAllProdutos() {
        try {
            const produtos = await Produto.findAndCountAll({
                include: [includeGruposEopcoes] // Usa o helper
            })
            return produtos
        } catch (error) {
            console.error(error)
            return { message: "Erro ao tentar executar a função", error }
        }
    }

    // --- FUNÇÃO findAllProdutosAtivos REFATORADA ---
    async findAllProdutosAtivos() {
        try {
            const produtos = await Produto.findAll({
                where: {
                    isAtivo: true
                },
                include: [includeGruposEopcoes] // Usa o helper
            })
            return produtos
        } catch (error) {
            console.error(error)
            return { message: "Erro ao tentar encontrar apenas os produtos ativos", error }
        }
    }

    // --- FUNÇÃO findProduto REFATORADA ---
    async findProduto(id) {
        try {
            const produto = await Produto.findByPk(id, {
                include: [includeGruposEopcoes] // Usa o helper
            })
            return produto
        } catch (error) {
            console.error(error)
            return { message: "Erro ao tentar executar a função", error }
        }
    }

    // --- FUNÇÃO updateProduto REFATORADA E CORRIGIDA ---
    async updateProduto(id, dataUpdate) {
        
        // Inicia uma transação
        const t = await sequelize.transaction();

        try {
            // 1. Encontrar o produto atual
            const produtoAtual = await Produto.findByPk(id);

            if (!produtoAtual) {
                await t.rollback();
                return { message: "Produto não encontrado", produto: null };
            }

            // 2. Guardar a imagem antiga
            const imagemAntiga = produtoAtual.image;

            // 3. Separar dados do produto dos dados de grupos/opções
            const { gruposOpcoes, ...dadosProduto } = dataUpdate;

            // 4. Atualizar dados do produto
            await Produto.update(dadosProduto, { where: { id }, transaction: t });

            // 5. Se imagem foi alterada, excluir a antiga (fora da transação, pois é I/O)
            if (dadosProduto.image && dadosProduto.image !== imagemAntiga) {
                const nomeArquivoAntigo = path.basename(imagemAntiga);
                const caminhoArquivoAntigo = path.join(process.cwd(), 'public', 'uploads', nomeArquivoAntigo);
                try {
                    await fs.access(caminhoArquivoAntigo);
                    await fs.unlink(caminhoArquivoAntigo);
                } catch (err) {
                    console.error(`Erro ao excluir imagem antiga:`, err);
                }
            }

            // 6. Sincronizar Grupos e Opções (a parte complexa)
            if (gruposOpcoes && Array.isArray(gruposOpcoes)) {
                
                // 6a. Sincronizar Grupos: Excluir grupos que não vieram no update
                const grupoIds = gruposOpcoes.map(g => g.id).filter(Boolean); // Pega IDs dos grupos existentes
                await GrupoOpcao.destroy({
                    where: {
                        produto_id: id,
                        id: { [Op.notIn]: grupoIds }
                    },
                    transaction: t
                });

                // 6b. Atualizar ou Criar Grupos
                for (const grupoData of gruposOpcoes) {
                    const { opcoes, ...dadosGrupo } = grupoData;
                    let grupo;

                    if (dadosGrupo.id) {
                        // Atualiza grupo existente
                        await GrupoOpcao.update(dadosGrupo, {
                            where: { id: dadosGrupo.id, produto_id: id },
                            transaction: t
                        });
                        grupo = dadosGrupo;
                    } else {
                        // Cria novo grupo
                        // *** CORREÇÃO DO BUG id: 0 ***
                        const { id: grupoIdDescartado, ...novoGrupoData } = dadosGrupo; // <-- Desestrutura o ID
                        grupo = await GrupoOpcao.create({
                            ...novoGrupoData,
                            produto_id: id
                        }, { transaction: t });
                    }

                    // 6c. Sincronizar Opções (SubProdutos) dentro deste grupo
                    if (opcoes && Array.isArray(opcoes)) {
                        const opcaoIds = opcoes.map(o => o.id).filter(Boolean);
                        
                        // Excluir opções que não vieram no update
                        await SubProduto.destroy({
                            where: {
                                grupoOpcao_id: grupo.id,
                                id: { [Op.notIn]: opcaoIds }
                            },
                            transaction: t
                        });

                        // Atualizar ou Criar Opções
                        for (const opcaoData of opcoes) {
                            if (opcaoData.id) {
                                // Atualiza opção existente
                                await SubProduto.update(opcaoData, {
                                    where: { id: opcaoData.id, grupoOpcao_id: grupo.id },
                                    transaction: t
                                });
                            } else {
                                // Cria nova opção
                                // *** CORREÇÃO DO BUG id: 0 ***
                                const { id, ...novaOpcaoData } = opcaoData; // <-- Desestrutura o ID (removendo-o)
                                await SubProduto.create({
                                    ...novaOpcaoData, // <-- Passa só o resto dos dados
                                    grupoOpcao_id: grupo.id
                                }, { transaction: t });
                            }
                        }
                    }
                }
            }

            // 7. Se tudo deu certo, "commita"
            await t.commit();

            // 8. Retornar produto atualizado com subprodutos
            const produtoAtualizado = await Produto.findByPk(id, {
                include: [includeGruposEopcoes]
            });

            return { message: "Produto atualizado com sucesso", produto: produtoAtualizado };
        } catch (error) {
            // 9. Se algo deu errado, "desfaz"
            await t.rollback();
            console.error(error);
            return { message: "Erro ao tentar executar a função", error };
        }
    }

    // --- FUNÇÃO deleteProduto REFATORADA ---
    async deleteProduto(id) {
        try {
            // 1. Buscar produto para validação e imagem
            const produtoParaDeletar = await Produto.findByPk(id);

            if (!produtoParaDeletar) {
                return { message: "Produto não encontrado.", produto: null };
            }

            const imagemParaDeletar = produtoParaDeletar.image;

            // 2. Excluir o produto
            // A exclusão em cascata (onDelete: 'CASCADE') definida nos models
            // fará com que o Sequelize exclua GruposOpcoes e SubProdutos automaticamente.
            await produtoParaDeletar.destroy(); 

            // 3. Excluir a imagem do servidor
            if (imagemParaDeletar) {
                const nomeArquivo = path.basename(imagemParaDeletar);
                const caminhoArquivo = path.join(process.cwd(), 'public', 'uploads', nomeArquivo);
                try {
                    await fs.access(caminhoArquivo);
                    await fs.unlink(caminhoArquivo);
                } catch (err) {
                    console.error(`Erro ao excluir imagem:`, err);
                }
            }

            return { message: "Produto e seus grupos/opções excluídos com sucesso", produto: produtoParaDeletar };

        } catch (error) {
            console.error(error);
            return { message: "Erro ao tentar executar a função", error };
        }
    }


    // --- FUNÇÃO toggleProdutoAtivo (Sem alterações) ---
    async toggleProdutoAtivo(id) {

        const produto = await Produto.findByPk(id)

        //verificando se o produto foi encontrado antes de fazer as alteracoes
        if (!produto) {
            return { message: "Produto nao encontrado no sistema" }
        }

        try {
            //alternando o boolean do produto
            produto.isAtivo = !produto.isAtivo
            //salvando as alteracoes
            await produto.save()
            return produto
        } catch (error) {
            return { message: "Erro ao tentar modificar produto", error }
        }
    }
}

export default new ProdutoController()
import produtoController from '../controller/produtoController.js';
import express from 'express';
import cors from 'cors';
import { isAdmin, authenticateToken } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
// Os nomes dos schemas importados continuam os mesmos
import { createProdutoSchema, updateProdutoSchema } from '../validators/produtoValidator.js';

const produtoRoutes = express.Router();

// Usando o middleware do CORS para habilitar os recursos do domínio da página web
produtoRoutes.use(cors());

// Rota para criar um produto com subprodutos
produtoRoutes.post('/produto', authenticateToken, isAdmin, validate(createProdutoSchema), async (req, res) => {
    // --- ALTERAÇÃO AQUI ---
    // Destrutura 'gruposOpcoes' ao invés de 'subprodutos'
    const { nomeProduto, descricao, valorProduto, image, isAtivo, categoriaProduto_id, gruposOpcoes } = req.body;

    try {
        // --- ALTERAÇÃO AQUI ---
        // Passa 'gruposOpcoes' para o controller
        const produto = await produtoController.createProduto(nomeProduto, descricao, valorProduto, image, isAtivo, categoriaProduto_id, gruposOpcoes);
        return res.status(200).json(produto);
    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});

// Rota para encontrar todos os produtos com subprodutos
// (Nenhuma alteração necessária aqui)
produtoRoutes.get('/produto', async (req, res) => {
    try {
        const produtos = await produtoController.findAndCountAllProdutos();
        return res.status(200).json(produtos);
    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});

// Rota para encontrar um produto pelo id, incluindo os subprodutos
// (Nenhuma alteração necessária aqui)
produtoRoutes.get('/produto/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const produto = await produtoController.findProduto(id);
        return res.status(200).json(produto);
    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});

// Rota para atualizar um produto, incluindo os subprodutos
produtoRoutes.put('/produto/:id', authenticateToken, isAdmin, validate(updateProdutoSchema), async (req, res) => {
    const { id } = req.params;
    // --- ALTERAÇÃO AQUI ---
    // Destrutura 'gruposOpcoes' ao invés de 'subprodutos'
    const { nomeProduto, descricao, valorProduto, image, isAtivo, categoriaProduto_id, gruposOpcoes } = req.body;

    try {
        // --- ALTERAÇÃO AQUI ---
        // Passa 'gruposOpcoes' no objeto de update
        const produto = await produtoController.updateProduto(id, { nomeProduto, descricao, valorProduto, image, isAtivo, categoriaProduto_id, gruposOpcoes });
        return res.status(200).json(produto);
    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});

// Rota para deletar um produto (e seus subprodutos)
// (Nenhuma alteração necessária aqui)
produtoRoutes.delete('/produto/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const produto = await produtoController.deleteProduto(id);
        return res.status(200).json(produto);
    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});

// Rota para ativar ou desativar um produto (e seus subprodutos, se necessário)
// (Nenhuma alteração necessária aqui)
produtoRoutes.put('/produto/:id/toggle', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const produto = await produtoController.toggleProdutoAtivo(id);
        return res.status(200).json(produto);
    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});

export default produtoRoutes;
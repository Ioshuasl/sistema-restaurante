import subProdutoController from '../controller/subProdutoController.js';
import express from 'express';
import cors from 'cors';
import { isAdmin, authenticateToken } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { createSubProdutoSchema, updateSubProdutoSchema } from '../validators/subProdutoValidator.js';

const subProdutoRoutes = express.Router();

// Usando o middleware do CORS para habilitar os recursos do domínio da página web
subProdutoRoutes.use(cors());

// Rota para criar um subproduto vinculado a um produto
subProdutoRoutes.post('/subproduto', authenticateToken, isAdmin, validate(createSubProdutoSchema), async (req, res) => {
    const { nomeSubProduto, valorAdicional, isAtivo, produto_id } = req.body;

    try {
        const subproduto = await subProdutoController.createSubProduto({ nomeSubProduto, valorAdicional, isAtivo, produto_id });
        return res.status(200).json(subproduto);
    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});

// Rota para encontrar todos os subprodutos
subProdutoRoutes.get('/subproduto', async (req, res) => {
    try {
        const subprodutos = await subProdutoController.findAllSubProdutos();
        return res.status(200).json(subprodutos);
    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});

// Rota para encontrar todos os subprodutos de um produto específico
subProdutoRoutes.get('/subproduto/produto/:produto_id', async (req, res) => {
    const { produto_id } = req.params;

    try {
        const subprodutos = await subProdutoController.findAllSubProdutos(produto_id);
        return res.status(200).json(subprodutos);
    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});

// Rota para encontrar um subproduto pelo ID
subProdutoRoutes.get('/subproduto/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const subproduto = await subProdutoController.findSubProduto(id);
        return res.status(200).json(subproduto);
    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});

// Rota para atualizar um subproduto
subProdutoRoutes.put('/subproduto/:id', authenticateToken, isAdmin, validate(updateSubProdutoSchema), async (req, res) => {
    const { id } = req.params;
    const { nomeSubProduto, valorAdicional, isAtivo, produto_id } = req.body;

    try {
        const subproduto = await subProdutoController.updateSubProduto(id, { nomeSubProduto, valorAdicional, isAtivo, produto_id });
        return res.status(200).json(subproduto);
    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});

// Rota para excluir um subproduto
subProdutoRoutes.delete('/subproduto/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const subproduto = await subProdutoController.deleteSubProduto(id);
        return res.status(200).json(subproduto);
    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});

// Rota para ativar ou desativar um subproduto
subProdutoRoutes.put('/subproduto/:id/toggle', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const subproduto = await subProdutoController.toggleSubProdutoAtivo(id);
        return res.status(200).json(subproduto);
    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});

export default subProdutoRoutes;

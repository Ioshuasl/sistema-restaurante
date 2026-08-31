import express from 'express';
import cors from 'cors';
import pedidoController from '../controller/pedidoController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const dashboardRoutes = express.Router();

dashboardRoutes.use(cors());

// Rota para obter o rendimento mensal
dashboardRoutes.get('/dashboard/revenue', authenticateToken, async (req, res) => {
    try {
        const date = new Date();
        const currentYear = date.getFullYear();
        const currentMonth = date.getMonth() + 1; // getMonth() retorna 0 para Janeiro

        const revenue = await pedidoController.getMonthlyRevenue(currentYear, currentMonth);
        return res.status(200).json(revenue);
    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});

// Rota para obter a contagem de pedidos por mês
dashboardRoutes.get('/dashboard/orders', authenticateToken, async (req, res) => {
    try {
        const monthlyCounts = await pedidoController.getMonthlyOrderCounts();
        return res.status(200).json(monthlyCounts);
    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});

// Rota para obter a distribuição de formas de pagamento
dashboardRoutes.get('/dashboard/payments', authenticateToken, async (req, res) => {
    try {
        const distribution = await pedidoController.getPaymentMethodDistribution();
        return res.status(200).json(distribution);
    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});

export default dashboardRoutes;
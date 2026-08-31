import { Router } from 'express';
import produtoRoutes from './produtoRoutes.js';
import categoriaProdutoRoutes from './categoriaProdutoRoutes.js';
import formaPagamentoRoutes from './formaPagamentoRoutes.js';
import pedidoRoutes from './pedidoRoutes.js';
import userRoutes from './userRoutes.js';
import configRoutes from './configRoutes.js';
import cargoRoutes from './cargoRoutes.js';
import menuRoutes from './menuRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import subProdutoRoutes from './subProdutoRoutes.js';
import webhookRoutes from './webhookRoutes.js';

const router = Router();

// Agrupando todas as rotas
router.use(produtoRoutes);
router.use(categoriaProdutoRoutes);
router.use(formaPagamentoRoutes);
router.use(pedidoRoutes);
router.use(userRoutes);
router.use(configRoutes);
router.use(cargoRoutes);
router.use(menuRoutes);
router.use(uploadRoutes);
router.use(dashboardRoutes);
router.use(subProdutoRoutes);
router.use('/webhook', webhookRoutes);

export default router;
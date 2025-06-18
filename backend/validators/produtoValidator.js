// validators/produtoValidator.js
import * as yup from 'yup';

// Esquema para criar um produto
export const createProdutoSchema = yup.object({
    nomeProduto: yup.string().required("O nome do produto é obrigatório.").min(3),
    valorProduto: yup.number().required("O valor é obrigatório.").positive(),
    isAtivo: yup.boolean().default(true),
    categoriaProduto_id: yup.number().required("A categoria é obrigatória.").integer()
});

// Esquema para atualizar um produto (campos não são obrigatórios)
export const updateProdutoSchema = yup.object({
    nomeProduto: yup.string().min(3),
    valorProduto: yup.number().positive(),
    isAtivo: yup.boolean(),
    categoriaProduto_id: yup.number().integer()
});
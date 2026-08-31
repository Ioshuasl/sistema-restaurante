import * as yup from 'yup';

// Esquema para criar um subproduto
export const createSubProdutoSchema = yup.object({
    nomeSubProduto: yup.string().required("O nome do subproduto é obrigatório.").min(2),
    isAtivo: yup.boolean().default(true),
    produto_id: yup.number().required("O produto é obrigatório.").integer(),
    valorAdicional: yup
        .number()
        .min(0, "O valor adicional não pode ser negativo")
        .nullable(),
});

// Esquema para atualizar um subproduto
export const updateSubProdutoSchema = yup.object({
    nomeSubProduto: yup.string().min(2),
    isAtivo: yup.boolean(),
    produto_id: yup.number().integer(),
    valorAdicional: yup
        .number()
        .min(0, "O valor adicional não pode ser negativo")
        .nullable(),
});

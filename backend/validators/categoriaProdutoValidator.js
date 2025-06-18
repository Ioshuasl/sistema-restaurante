import * as yup from 'yup';

// Esquema para criar uma nova categoria
export const createCategoriaProdutoSchema = yup.object({
    nomeCategoriaProduto: yup.string()
        .required("O nome da categoria é obrigatório.")
        .min(3, "O nome da categoria deve ter no mínimo 3 caracteres.")
});

// Esquema para atualizar uma categoria (o nome é opcional)
export const updateCategoriaProdutoSchema = yup.object({
    nomeCategoriaProduto: yup.string()
        .min(3, "O nome da categoria deve ter no mínimo 3 caracteres.")
});
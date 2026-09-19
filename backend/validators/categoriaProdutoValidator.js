import * as yup from 'yup';

// Esquema para criar uma nova categoria
export const createCategoriaProdutoSchema = yup.object({
    nomeCategoriaProduto: yup.string()
        .required("O nome da categoria é obrigatório.")
        .min(3, "O nome da categoria deve ter no mínimo 3 caracteres."),
    tipoMenu: yup.string().oneOf(['dia', 'noite', 'ambos']).default('ambos'),
});

// Esquema para atualizar uma categoria (o nome é opcional)
export const updateCategoriaProdutoSchema = yup.object({
    nomeCategoriaProduto: yup.string()
        .min(3, "O nome da categoria deve ter no mínimo 3 caracteres."),
    tipoMenu: yup.string().oneOf(['dia', 'noite', 'ambos']),
});
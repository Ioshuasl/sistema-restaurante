import * as yup from 'yup';

export const createCategoriaProdutoSchema = yup.object({
    nomeCategoriaProduto: yup.string()
        .required("O nome da categoria é obrigatório.")
        .min(3, "O nome da categoria deve ter no mínimo 3 caracteres."),
    tipoMenu: yup.string().oneOf(['dia', 'noite', 'ambos']).default('dia'),
});

export const updateCategoriaProdutoSchema = yup.object({
    nomeCategoriaProduto: yup.string()
        .min(3, "O nome da categoria deve ter no mínimo 3 caracteres."),
    tipoMenu: yup.string().oneOf(['dia', 'noite', 'ambos']),
    ordem: yup.number().integer().min(0),
});

export const reorderCategoriaProdutoSchema = yup.object({
    orderedIds: yup
        .array()
        .of(yup.number().integer().positive().required())
        .min(1, "Informe ao menos uma categoria.")
        .required("A lista de IDs é obrigatória."),
});

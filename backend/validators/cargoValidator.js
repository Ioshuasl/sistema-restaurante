import * as yup from 'yup';

// Esquema para criar um novo cargo
export const createCargoSchema = yup.object({
    nome: yup.string()
        .required("O nome do cargo é obrigatório.")
        .min(3, "O nome do cargo deve ter no mínimo 3 caracteres."),
    descricao: yup.string().nullable()
});

// Esquema para atualizar um cargo
export const updateCargoSchema = yup.object({
    nome: yup.string()
        .min(3, "O nome do cargo deve ter no mínimo 3 caracteres."),
    descricao: yup.string().nullable()
});
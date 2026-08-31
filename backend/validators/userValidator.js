import * as yup from 'yup';

// Esquema para o corpo da requisição de login
export const loginSchema = yup.object({
    username: yup.string().required("O nome de usuário é obrigatório."),
    password: yup.string().required("A senha é obrigatória.")
});

// Esquema para a criação de um novo usuário
export const createUserSchema = yup.object({
    nome: yup.string().required("O nome é obrigatório.").min(3, "O nome deve ter no mínimo 3 caracteres."),
    cargo_id: yup.number()
        .integer("O ID da forma de pagamento deve ser um número inteiro.")
        .positive("O ID da forma de pagamento deve ser um número positivo."),
    username: yup.string().required("O nome de usuário é obrigatório.").min(4, "O nome de usuário deve ter no mínimo 4 caracteres."),
    password: yup.string().required("A senha é obrigatória.").min(8, "A senha deve ter no mínimo 8 caracteres.")
});

// Esquema para a atualização de um usuário (todos os campos são opcionais)
export const updateUserSchema = yup.object({
    nome: yup.string().min(3, "O nome deve ter no mínimo 3 caracteres."),
    cargo_id: yup.number()
        .integer("O ID da forma de pagamento deve ser um número inteiro.")
        .positive("O ID da forma de pagamento deve ser um número positivo."),
    isAdmin: yup.boolean(),
    username: yup.string().min(4, "O nome de usuário deve ter no mínimo 4 caracteres."),
    // A senha só é validada se for fornecida uma nova
    password: yup.string().min(8, "A nova senha deve ter no mínimo 8 caracteres.")
});
import * as yup from 'yup';

// Esquema para criar uma nova forma de pagamento
export const createFormaPagamentoSchema = yup.object({
    nomeFormaPagamento: yup.string()
        .required("O nome da forma de pagamento é obrigatório.")
        .min(3, "O nome deve ter no mínimo 3 caracteres.")
});

// Esquema para atualizar uma forma de pagamento (o nome é opcional)
export const updateFormaPagamentoSchema = yup.object({
    nomeFormaPagamento: yup.string()
        .min(3, "O nome deve ter no mínimo 3 caracteres.")
});
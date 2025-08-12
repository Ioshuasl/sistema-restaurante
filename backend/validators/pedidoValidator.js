import * as yup from 'yup';

// Esquema para a criação de um novo pedido
export const createPedidoSchema = yup.object({
    formaPagamento_id: yup.number()
        .required("A forma de pagamento é obrigatória.")
        .integer("O ID da forma de pagamento deve ser um número inteiro.")
        .positive("O ID da forma de pagamento deve ser um número positivo."),

    isRetiradaEstabelecimento: yup.boolean().required("É necessário informar se o pedido é para retirada."),

    nomeCliente: yup.string().required("O nome do cliente é obrigatório."),

    telefonetelefoneCliente: yup.string(),

    tipoLogadouroCliente: yup.string(),

    logadouroCliente: yup.string(),

    numeroCliente: yup.string(),

    quadraCliente: yup.string().nullable(),

    loteCliente: yup.string().nullable(),

    bairroCliente: yup.string(),

    cidadeCliente: yup.string(),

    estadoCliente: yup.string()
        .length(2, "O estado deve ser a sigla de 2 letras (UF)."),

    // Validação do array de produtos
    produtosPedido: yup.array().of(
        yup.object({
            produtoId: yup.number()
                .required("O ID do produto é obrigatório.")
                .integer("O ID do produto deve ser um número inteiro.")
                .positive("O ID do produto deve ser um número positivo."),
            quantidade: yup.number()
                .required("A quantidade do produto é obrigatória.")
                .integer("A quantidade deve ser um número inteiro.")
                .positive("A quantidade deve ser no mínimo 1.")
        })
    ).min(1, "O pedido deve conter pelo menos um item.").required("A lista de produtos é obrigatória.")
});
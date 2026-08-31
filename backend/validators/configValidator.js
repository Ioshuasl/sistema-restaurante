import * as yup from 'yup';

// Esquema para a atualização das configurações do sistema
export const updateConfigSchema = yup.object({
    razaoSocial: yup.string()
        .min(3, "A Razão Social deve ter no mínimo 3 caracteres."),

    nomeFantasia: yup.string()
        .min(3, "O Nome Fantasia deve ter no mínimo 3 caracteres."),

    tipoLogadouro: yup.string(),

    logadouro: yup.string(),

    numero: yup.string(),

    quadra: yup.string().nullable(),

    lote: yup.string().nullable(),

    bairro: yup.string(),

    cidade: yup.string(),

    estado: yup.string()
        .length(2, "O estado deve ser a sigla de 2 letras (UF)."),

    telefone: yup.string(),

    email: yup.string()
        .email("O formato do e-mail é inválido."),

    taxaEntrega: yup.number()
        .min(0, "A taxa de entrega não pode ser um valor negativo."),
    menuLayout: yup.string(),
    primaryColor: yup.string(),
    fontFamily: yup.string(),
    borderRadius: yup.string(),
    showBanner: yup.boolean(),
    bannerImage: yup.string().nullable()
});
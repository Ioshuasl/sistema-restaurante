import * as yup from 'yup';

const horarioDiaSchema = yup.object({
  dia: yup.number().integer().min(0).max(6).required(),
  aberto: yup.boolean().required(),
  inicio: yup.string().required(),
  fim: yup.string().required(),
});

// Esquema para a atualização das configurações do sistema
export const updateConfigSchema = yup.object({
  cnpj: yup.string(),

  razaoSocial: yup.string()
    .min(3, "A Razão Social deve ter no mínimo 3 caracteres."),

  nomeFantasia: yup.string()
    .min(3, "O Nome Fantasia deve ter no mínimo 3 caracteres."),

  cep: yup.string(),

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
    .transform((value) => (value === '' ? undefined : value))
    .email("O formato do e-mail é inválido."),

  taxaEntrega: yup.number()
    .min(0, "A taxa de entrega não pode ser um valor negativo."),

  menuLayout: yup.string(),
  primaryColor: yup.string(),
  fontFamily: yup.string(),
  borderRadius: yup.string(),
  showBanner: yup.boolean(),
  bannerImage: yup.string().nullable(),

  evolutionInstanceName: yup.string(),
  urlAgenteImpressao: yup.string(),
  nomeImpressora: yup.string(),
  horariosFuncionamento: yup.array().of(horarioDiaSchema),

  tipoChavePix: yup.string().oneOf(['cpf', 'cnpj', 'email', 'telefone', 'aleatoria']),
  chavePix: yup.string().nullable(),
});

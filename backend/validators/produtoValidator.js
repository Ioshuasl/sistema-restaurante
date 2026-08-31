import * as yup from 'yup';

// --- ESQUEMA ATUALIZADO ---
// Renomeado de subProdutoSchema para opcaoSchema para clareza
// Este esquema valida um SubProduto (Ingrediente/Opção)
const opcaoSchema = yup.object({
    id: yup.number().integer().optional(), // no update pode vir id
    nomeSubProduto: yup.string().required("O nome da opção é obrigatório.").min(2),
    isAtivo: yup.boolean().default(true),
    valorAdicional: yup.number().optional().default(0) // Importante adicionar
});

// --- NOVO ESQUEMA ---
// Esquema para validar o GrupoOpcao (Ex: "Carnes", "Saladas")
const grupoOpcaoSchema = yup.object({
    id: yup.number().integer().optional(),
    nomeGrupo: yup.string().required("O nome do grupo é obrigatório."),
    minEscolhas: yup.number().integer().required("Mínimo de escolhas é obrigatório.").min(0),
    maxEscolhas: yup.number().integer().required("Máximo de escolhas é obrigatório.").min(1),
    // Um grupo pode ter várias opções (SubProdutos)
    opcoes: yup.array().of(opcaoSchema).optional().min(0) 
});

// --- ESQUEMA ATUALIZADO ---
// Esquema para criar um produto
export const createProdutoSchema = yup.object({
    nomeProduto: yup.string().required("O nome do produto é obrigatório.").min(3),
    descricao: yup.string().optional(),
    valorProduto: yup.number().required("O valor é obrigatório.").positive(),
    image: yup.string().required("A imagem do produto é obrigatória."),
    isAtivo: yup.boolean().default(true),
    categoriaProduto_id: yup.number().required("A categoria é obrigatória.").integer(),
    
    // --- ALTERAÇÃO AQUI ---
    // Trocamos 'subprodutos' por 'gruposOpcoes'
    gruposOpcoes: yup.array().of(grupoOpcaoSchema).optional() 
});

// --- ESQUEMA ATUALIZADO ---
// Esquema para atualizar um produto
export const updateProdutoSchema = yup.object({
    nomeProduto: yup.string().min(3),
    descricao: yup.string().optional(),
    valorProduto: yup.number().positive(),
    image: yup.string(),
    isAtivo: yup.boolean(),
    categoriaProduto_id: yup.number().integer(),

    // --- ALTERAÇÃO AQUI ---
    // Trocamos 'subprodutos' por 'gruposOpcoes'
    gruposOpcoes: yup.array().of(grupoOpcaoSchema).optional()
});
import express from "express"
import sequelize from "./config/database.js"
import produtoRoutes from "./routes/produtoRoutes.js"
import categoriaProdutoRoutes from "./routes/categoriaProdutoRoutes.js"
import formaPagamentoRoutes from "./routes/formaPagamentoRoutes.js"
import pedidoRoutes from "./routes/pedidoRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import cors from "cors"

const app = express()
const PORT = 3300

//middleware para processar corpos de requisicao json
app.use(express.json())

//usando o middleware do cors para habilitar os recursos do dominio da pagina web
app.use(cors())

app.use('/api', produtoRoutes)
app.use('/api',categoriaProdutoRoutes)
app.use('/api',formaPagamentoRoutes)
app.use('/api',pedidoRoutes)
app.use('/api',userRoutes)

try {
    await sequelize.authenticate(); //verifica a conexão com o banco de dados
    console.log("Conexão com o banco de dados estabelecida com sucesso!");
    await sequelize.sync(); // Sincroniza os modelos com o banco de dados
    console.log("Modelos sincronizados com sucesso!");
} catch (error) {
    console.error("Falha ao conectar com o banco de dados:", error);
}

app.get('/', async(req,res) => {
    res.send("hello world")
})

app.listen(PORT, () => {
    console.log("Servidor rodando na porta ", PORT)
})
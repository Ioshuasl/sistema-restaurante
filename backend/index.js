import express from "express"
import sequelize from "./config/database.js"
import produtoRoutes from "./routes/produtoRoutes.js"
import categoriaProdutoRoutes from "./routes/categoriaProdutoRoutes.js"
import formaPagamentoRoutes from "./routes/formaPagamentoRoutes.js"
import pedidoRoutes from "./routes/pedidoRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import cors from "cors"
import configRoutes from "./routes/configRoutes.js"
import cargoRoutes from "./routes/cargoRoutes.js"
import dotenv from 'dotenv'
import menuRoutes from "./routes/menuRoutes.js"
import uploadRoutes from "./routes/uploadRoutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js"

dotenv.config()

const app = express()
const PORT = 3300

//middleware para processar corpos de requisicao json
app.use(express.json())

//usando o middleware do cors para habilitar os recursos do dominio da pagina web
app.use(cors())

// Serve a pasta 'uploads' como um recurso estático
app.use('/uploads', express.static('public/uploads'));
app.use('/api', produtoRoutes)
app.use('/api', categoriaProdutoRoutes)
app.use('/api', formaPagamentoRoutes)
app.use('/api', pedidoRoutes)
app.use('/api', userRoutes)
app.use('/api', configRoutes)
app.use('/api', cargoRoutes)
app.use('/api', menuRoutes)
// Usa a rota de upload
app.use('/api',uploadRoutes);
app.use('/api', dashboardRoutes)

try {
    await sequelize.authenticate(); //verifica a conexão com o banco de dados
    console.log("Conexão com o banco de dados estabelecida com sucesso!");
    await sequelize.sync(); // Sincroniza os modelos com o banco de dados
    console.log("Modelos sincronizados com sucesso!");
} catch (error) {
    console.error("Falha ao conectar com o banco de dados:", error);
}

app.get('/', async (req, res) => {
    res.send("hello world")
})

app.listen(PORT, () => {
    console.log("Servidor rodando na porta ", PORT)
})
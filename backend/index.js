import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import sequelize from "./config/database.js";
import "./models/index.js";
import apiRoutes from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Recursos estáticos
app.use('/uploads', express.static('public/uploads'));

// Prefixando todas as rotas da API com /api de uma só vez
app.use('/api', apiRoutes);

// Conexão com o banco e inicialização
try {
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso!");
    await sequelize.sync({ alter: true });
    console.log("Modelos sincronizados com sucesso!");
} catch (error) {
    console.error("Falha ao conectar com o banco de dados:", error);
}

app.get('/', (req, res) => {
    res.send("API do Restaurante rodando com sucesso!");
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
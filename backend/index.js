import express from "express";
import cors from "cors";
import compression from "compression";
import dotenv from 'dotenv';
import sequelize from "./config/database.js";
import "./models/index.js";
import apiRoutes from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());
app.use(express.json());
app.use(cors());

// Recursos estáticos com cache agressivo para imagens
app.use('/uploads', express.static('public/uploads', {
    maxAge: '7d',
    etag: true,
    lastModified: true,
    setHeaders(res) {
        res.set('Cache-Control', 'public, max-age=604800, s-maxage=604800, immutable');
    },
}));

// Prefixando todas as rotas da API com /api de uma só vez
app.use('/api', apiRoutes);

// Conexão com o banco e inicialização
try {
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso!");
    if (process.env.NODE_ENV !== 'production') {
        await sequelize.sync({ alter: true });
        console.log("Modelos sincronizados com sucesso!");
    }
} catch (error) {
    console.error("Falha ao conectar com o banco de dados:", error);
}

app.get('/', (req, res) => {
    res.send("API do Restaurante rodando com sucesso!");
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
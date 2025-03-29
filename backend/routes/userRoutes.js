import session from "express-session";
import userController from "../controller/userController.js";
import express from 'express'
import { isAdmin, userLogged } from "../validators/isAdmin.js";

const userRoutes = express.Router()

//definindo o middleware de sessao das rotas
userRoutes.use(session({
    secret: 'mySecret', // Chave secreta para assinar o cookie da sessão
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Defina como true se estiver usando HTTPS
}));

// Rota para processar o login
userRoutes.post('/login', async (req, res) => {
    const { username, password } = req.body; // Obtém os dados do formulário

    // Verifica se o usuário existe e se a senha está correta
    const user = await userController.loginUser(username,password)

    if (user) {
        // Armazena os dados do usuário na sessão
        req.session.user = {
            id: user.id,
            username: user.username,
            useremail: user.usermail,
            isAdmin: user.isAdmin
        };
        res.status(200).send('Login bem-sucedido! Você está logado.');
    } else {
        res.status(401).send('Usuário ou senha incorretos.');
    }
});

// Rota para acessar o painel de controle
userRoutes.get('/dashboard', async (req, res) => {
    if (req.session.user) {
        const user = await req.session.user
        return res.status(200).json(user)
    } else {
        return res.status(401).send('Você precisa estar logado para acessar esta página.');
    }
});

// Rota para logout
userRoutes.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err)
            return res.status(500).send('Erro ao fazer logout.');
        }
        res.status(200).send('Logout realizado com sucesso!');
    });
});

// Rota para criar usuário
userRoutes.post('/user', userLogged, isAdmin, async (req,res) => {
    const {nome, cargo, isAdmin, username, password} = req.body

    try {
        const user = await userController.createUser({nome, cargo, isAdmin, username, password})
        return res.status(200).json(user)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

//Rota para mostrar todos os usuário cadastrados no sistema
userRoutes.get('/user', async (req,res) => {
    try {
        const users = await userController.getUsers()
        return res.status(200).json(users)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

//Rota para encontrar um usuário pelo id
userRoutes.get('/user/:id', async (req,res) => {
    const {id} = req.params

    try {
        const user = await userController.getUser(id)
        return res.status(200).json(user)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

//Rota para atualizar um usuário
userRoutes.put('/user/:id', userLogged, isAdmin, async (req,res) => {
    const {id} = req.params
    const updatedData = req.body

    try {
        const user = await userController.updateUser(id,updatedData)
        return res.status(200).json(user)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

//Rota para deletar um usuáro
userRoutes.delete('/user/:id', userLogged, isAdmin, async (req,res) => {
    const {id} = req.params

    try {
        const user = await userController.deleteUser(id)
        return res.status(200).json(user)   
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

export default userRoutes
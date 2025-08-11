import userController from "../controller/userController.js";
import express from 'express'
import cors from "cors"
import { isAdmin, authenticateToken } from '../middlewares/authMiddleware.js'
import { validate } from "../middlewares/validationMiddleware.js";
import { loginSchema, createUserSchema, updateUserSchema } from '../validators/userValidator.js'

const userRoutes = express.Router()

//usando o middleware do cors para habilitar os recursos do dominio da pagina web
userRoutes.use(cors())

// Rota para processar o login
userRoutes.post('/login', validate(loginSchema), async (req, res) => {
    console.log(req.body)
    const { username, password } = req.body; // Obtém os dados do formulário

    try {
        const user = await userController.loginUser(username, password)
        res.status(200).json(user)
    } catch (error) {
        console.error(error)
        res.status(401).send(error);
    }
});

// Rota para acessar o painel de controle
userRoutes.get('/dashboard', authenticateToken, async (req, res) => {
    if (req.user) {
        const user = await req.user
        return res.status(200).json(user)
    } else {
        return res.status(401).send('Você precisa estar logado para acessar esta página.');
    }
});

userRoutes.get('/dashboard/admin', isAdmin, (req, res) => {
    res.send('Bem-vindo, painel de administrador!');
});

// Rota para criar o primeiro usuário
userRoutes.post('/first-user', validate(createUserSchema), async (req, res) => {
    console.log(req.body)
    const { nome, cargo_id, username, password } = req.body

    try {
        const user = await userController.createUser({ nome, cargo_id, username, password })
        return res.status(200).json(user)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

// Rota para criar usuário
userRoutes.post('/user', authenticateToken, isAdmin, validate(createUserSchema), async (req, res) => {
    const { nome, cargo_id, username, password } = req.body

    try {
        const user = await userController.createUser({ nome, cargo_id, username, password })
        return res.status(200).json(user)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

//Rota para mostrar todos os usuário cadastrados no sistema
userRoutes.get('/user', async (req, res) => {
    try {
        const users = await userController.getUsers()
        return res.status(200).json(users)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

//Rota para encontrar um usuário pelo id
userRoutes.get('/user/:id', async (req, res) => {
    const { id } = req.params

    try {
        const user = await userController.getUser(id)
        return res.status(200).json(user)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

//Rota para atualizar um usuário
userRoutes.put('/user/:id', authenticateToken, isAdmin, validate(updateUserSchema), async (req, res) => {
    const { id } = req.params
    const updatedData = req.body

    try {
        const user = await userController.updateUser(id, updatedData)
        return res.status(200).json(user)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

//Rota para deletar um usuáro
userRoutes.delete('/user/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params

    if (id === req.user.id) {
        return res.status(403).json({ message: "Você não pode se auto-excluir." });
    }

    try {
        const user = await userController.deleteUser(id)
        return res.status(200).json(user)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

export default userRoutes
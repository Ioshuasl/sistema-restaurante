import * as bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Op } from "sequelize";
import { Users, Cargo } from "../models/index.js";

class UserController {
    //funcao para cadastrar usuario
    async createUser({ nome, cargo_id, username, password }) {

        try {

            const existingUser = await Users.findOne({
                where: {
                    [Op.or]: [
                        { username: username },
                        { nome: nome }
                    ]
                }
            });

            if (existingUser) {
                return {
                    message: 'Nome ou username já estão em uso. Por favor, escolha outros.',
                    error: 'DUPLICATE_USER'
                };
            }

            const saltRounds = 10
            const hashedPassword = await bcrypt.hash(password, saltRounds)

            const user = await Users.create({ nome, cargo_id, username, password: hashedPassword })
            return { message: 'Usuário criado com sucesso', user }
        } catch (error) {
            console.error(error)
            return { message: "Erro ao tentar executar a função", error }
        }
    }

    //funcao para encontrar todos os usuarios encontrados no sistema
    async getUsers() {
        try {
            const users = await Users.findAll({
                include: [Cargo]
            })
            return users
        } catch (error) {
            console.error(error)
            return { message: "Erro ao tentar executar a função", error }
        }
    }

    //funcao para encontrar usuario pelo id 
    async getUser(id) {
        try {
            const user = await Users.findByPk(id)
            return user
        } catch (error) {
            console.error(error)
            return { message: "Erro ao tentar executar a função", error }
        }
    }

    //funcao para atualizar um usuario
    async updateUser(id, updatedData) {
        try {

            if (updatedData.password) {
                const saltRounds = 10;
                updatedData.password = await bcrypt.hash(updatedData.password, saltRounds);
            }

            const user = await Users.update(updatedData, {
                where: {
                    id: id
                }
            })

            const updatedUser = await Users.findByPk(id, {
                include: [Cargo]
            });
            return {
                message: 'Usuário atualizado com sucesso',
                user,
                updatedUser
            }
        } catch (error) {
            console.error(error)
            return { message: "Erro ao tentar executar a função", error }
        }
    }

    //funcao para deletar um usuario
    async deleteUser(id) {
        try {
            const user = await Users.destroy({
                where: {
                    id: id
                }
            })
            return { message: "Usuário excluido com sucesso", user }
        } catch (error) {
            console.error(error)
            return { message: "Erro ao tentar executar a função", error }
        }
    }

    //funcao de login do usuario
    async loginUser(username, password) {
        try {
            // Encontra o usuário e seu cargo
            const user = await Users.findOne({
                where: { username },
                include: [Cargo]
            });

            if (!user) {
                throw new Error("Credenciais inválidas");
            }

            const isPasswordMatch = await bcrypt.compare(password, user.password);


            if (!isPasswordMatch) {
                throw new Error("Credenciais inválidas");
            }


            //dados que você quer armazenar no token
            const payload = {
                id: user.id,
                username: user.username,
                cargo: user.Cargo.nome,
                admin: user.Cargo.admin
            };

            // 3. Assine o token com seu segredo e defina um tempo de expiração
            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '8h' } // Token expira em 8 horas
            );

            //token de volta para o cliente
            return {
                message: "Login bem-sucedido!",
                user: {
                    id: user.id,
                    nome: user.nome,
                    username: user.username,
                    cargo: user.Cargo.nome,
                    admin: user.Cargo.admin
                },
                token: token
            };

        } catch (error) {
            error.statusCode = 401;
            console.error(error)
            throw error;
        }
    }

    async logoutUser() {
        try {
            return { message: "Logout realizado com sucesso. Remova o token do armazenamento local." };
        } catch (error) {
            console.error(error);
            return { message: "Erro ao tentar realizar logout", error };
        }
    }
}

export default new UserController()
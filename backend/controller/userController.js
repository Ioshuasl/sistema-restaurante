import Users from "../models/usermodels.js"
import bcrypt from 'bcrypt'
import Cargo from "../models/cargoModels.js";
import jwt from 'jsonwebtoken'

Users.belongsTo(Cargo, { foreignKey: 'cargoId' });
Cargo.hasMany(Users, { foreignKey: 'cargoId' });

class UserController {
    //funcao para cadastrar usuario
    async createUser(nome, cargo_id, isAdmin, username, password) {

        const hashedPassword = await bcrypt.hash(password, 10)

        try {
            const user = await Users.create({nome, cargo_id, isAdmin, username, password:hashedPassword})
            return { message: 'Usuário criado com sucesso', user }
        } catch (error) {
            console.error(error)
            return { message: "Erro ao tentar executar a função", error }
        }
    }

    //funcao para encontrar todos os usuarios encontrados no sistema
    async getUsers() {
        try {
            const users = await Users.findAll()
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
            console.error
            return { message: "Erro ao tentar executar a função", error }
        }
    }

    //funcao para atualizar um usuario
    async updateUser(id, updatedData) {
        try {
            const user = await Users.update(updatedData, {
                where: {
                    id: id
                }
            })
            return { message: 'Usuário atualizado com sucesso', user }
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
                include: { model: Cargo, attributes: ['nome'] } // Inclui o nome do cargo
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
                cargo: user.Cargo.nome
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
                    username: user.username
                },
                token: token
            };

        } catch (error) {
            error.statusCode = 401; 
            throw error;
        }
    }
}

export default new UserController()
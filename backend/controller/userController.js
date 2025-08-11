import Users from "../models/usermodels.js"
import * as bcrypt from 'bcrypt'
import Cargo from "../models/cargoModels.js";
import jwt from 'jsonwebtoken'

Users.belongsTo(Cargo, { foreignKey: 'cargo_id' });
Cargo.hasMany(Users, { foreignKey: 'cargo_id' });

class UserController {
    //funcao para cadastrar usuario
    async createUser({ nome, cargo_id, username, password }) {

        console.log("senha sem criptografia: ", password)
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        console.log("senha criptografada: ", hashedPassword)

        try {
            const user = await Users.create({ nome, cargo_id, username, password: hashedPassword })
            console.log(user)
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
        console.log("chamando a função de login de usuário")
        try {
            // Encontra o usuário e seu cargo
            const user = await Users.findOne({
                where: { username },
                include: [Cargo]
            });
            console.log(user)

            if (!user) {
                throw new Error("Credenciais inválidas");
            }

            const isPasswordMatch = await bcrypt.compare(password, user.password);
            
            console.log("passowrd match? ", isPasswordMatch)
            
            if (!isPasswordMatch) {
                throw new Error("Credenciais inválidas");
            } else {
                console.log("Senha correta")
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
            console.log(error)
            throw error;
        }
    }
}

export default new UserController()
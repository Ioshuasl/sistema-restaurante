import Users from "../models/usermodels.js"

class UserController {

    //funcao para cadastrar usuario
    async createUser(nome, cargo, isAdmin, username, password){
        try {
            const user = await Users.create(nome, cargo, isAdmin, username, password)
            return {message: 'Usuário criado com sucesso',user}
        } catch (error) {
            console.error(error)
            return {message: "Erro ao tentar executar a função",error}
        }
    }

    //funcao para encontrar todos os usuarios encontrados no sistema
    async getUsers(){
        try {
            const users = await Users.findAll()
            return users
        } catch (error) {
            console.error(error)
            return {message: "Erro ao tentar executar a função",error}
        }
    }

    //funcao para encontrar usuario pelo id 
    async getUser(id) {
        try {
            const user = await Users.findByPk(id)
            return user
        } catch (error) {
            console.error
            return {message: "Erro ao tentar executar a função",error}
        }
    }

    //funcao para atualizar um usuario
    async updateUser(id,updatedData) {
        try {
            const user = await Users.update(updatedData,{
                where: {
                    id:id
                }
            })
            return {message: 'Usuário atualizado com sucesso', user}
        } catch (error) {
            console.error(error)
            return {message: "Erro ao tentar executar a função",error}
        }
    }

    //funcao para deletar um usuario
    async deleteUser(id){
        try {
            const user = await Users.destroy({
                where:{
                    id:id
                }
            })
            return {message: "Usuário excluido com sucesso",user}
        } catch (error) {
            console.error(error)
            return {message: "Erro ao tentar executar a função",error}
        }
    }

    //funcao de login do usuario
    async loginUser(username, password){
        try {
            const user = await Users.findOne({
                where: {
                    username: username,
                    password: password
                }
            })
            return user
        } catch (error) {
            console.error(error)
            return {message: "Erro ao tentar executar a função",error}
        }
    }
}

export default new UserController()
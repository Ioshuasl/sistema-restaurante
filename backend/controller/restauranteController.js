import Parametro from "../models/parametroModel.js";
import Restaurante from "../models/restauranteModel.js";

Parametro.belongsTo(Restaurante,{foreignKey:'restaurante_id'})
Restaurante.hasOne(Parametro,{foreignKey:'restaurante_id'})

class RestauranteController {

    //função para cadastrar Restaurante
    async createRestaurante(nome,cnpj,email,telefone,cep){
        try {
            const restaurante = await Restaurante.create(nome,cnpj,email,telefone,cep)
            console.log(restaurante)
            return restaurante
        } catch (error) {
            console.error(error)
            return {message:"Erro ao criar restaurante",error}
        }
    }

    //função para procurar todos os Restaurantes cadastrados
    async findAllRestaurante(){
        try {
            const restaurantes = await Restaurante.findAll()
            console.log(restaurantes)
            return restaurantes
        } catch (error) {
            console.error(error)
            return error
        }
    }

    //função para procurar Restaurante
    async findRestaurante(id){
        try {
            const restaurante = await Restaurante.findByPk(id)
            console.log(restaurante)
            return restaurante
        } catch (error) {
            console.error(error)
            return error
        }
    }

    //função para atualizar restaurante
    async updateRestaurante(id, updatedData){

        const restaurante = await Restaurante.findByPk(id)

        //verifica se o restaurante existe
        if(!restaurante){
            return {message:`Restaurante ${id} não encontrado`}
        }

        try {
            const restaurante = await Restaurante.update(updatedData,{
                where: {
                    id:id
                }
            })
            console.log(restaurante)
            return restaurante
        } catch (error) {
            console.error(error)
            return error
        }
    }

    //função para deletar restaurante
    async deleteRestaurante(id){
        try {
            const restaurante = await Restaurante.destroy({
                where: {
                    id:id
                }
            })
            console.log(restaurante)
            return restaurante
        } catch (error) {
            console.error(error)
            return error
        }
    }
}

export default new RestauranteController()
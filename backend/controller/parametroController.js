import Parametro from "../models/parametroModel.js";
import Restaurante from "../models/restauranteModel.js";

Parametro.belongsTo(Restaurante,{foreignKey:'restaurante_id'})
Restaurante.hasOne(Parametro,{foreignKey:'restaurante_id'})

class ParametroController{

    //função para criar os parametros de um restaurante
    async createParametro(taxafrete,restaurante_id){

        //busca o restaurante pelo id fornecido
        const restaurante = await Restaurante.findOne({
            where:{
                id:restaurante_id
            }
        })

        //verifica se o restaurante exsite
        if (!restaurante){
            return {message:"Restaurante não encontrado"}
        }

        try {
            const parametro = await Parametro.create(taxafrete,restaurante_id)
            console.log(parametro)
            return parametro
        } catch (error) {
            console.error(error)
            return {message:"Erro ao criar os parâmetros", error}
        }
    }

    //função para procurar os parametros de um determinado restaurante
    async findParametrosRestaurante(id){
        try {
            const parametro = await Parametro.findAll({
                where:{
                    restaurante_id: id
                }
            })
            console.log(parametro)
            return parametro
        } catch (error) {
            console.error(error)
            return error
        }
    }

    //função para atualizar os parametros de um determinado restaurante
    async updateParametroRestaurante(updatedData,restaurante_id){

        //busca o restaurante pelo id fornecido
        const restaurante = await Restaurante.findOne({
            where:{
                id:restaurante_id
            }
        })

        //verifica se o restaurante exsite
        if (!restaurante){
            return {message:"Restaurante não encontrado"}
        }

        try {
            const parametro = await Parametro.update(updatedData,{
                where:{
                    restaurante_id: restaurante_id
                }
            })
            console.log(parametro)
            return parametro
        } catch (error) {
            console.error(error)
            return error
        }
    }
}

export default new ParametroController()
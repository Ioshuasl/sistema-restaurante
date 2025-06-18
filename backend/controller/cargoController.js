import Cargo from "../models/cargoModels.js";

class CargoController {
    //função para adicionar cargo
    async createCargo(nome,descricao){
        try {
            const cargo = await Cargo.create({nome,descricao})
            return cargo
        } catch (error) {
            console.error(error)
            return error
        }
    }

    //função para listar todos os cargos
    async getCargos(){
        try {
            const cargos = await Cargo.findAndCountAll()
            return cargos
        } catch (error) {
            console.error(error)
            return error
        }
    }

    //função para listar cargo por id
    async getCargoById(id){
        try {
            const cargo = await Cargo.findByPk(id)
            return cargo
        } catch (error) {
            console.error(error)
            return error
        }
    }

    //função para atualizar cargo
    async updateCargo(id,updatedData){
        try {
            const cargo = await Cargo.update(updatedData,{
                where: {
                    id:id
                }
            })
            return cargo
        } catch (error) {
            console.error(error)
            return error
        }
    }

    //função para excluir cargo
    async deleteCargo(id){
        try {
            const cargo = await Cargo.destroy({
                where:{
                    id:id
                }
            })
            return cargo
        } catch (error) {
            console.error(error)
            return error
        }
    }
}

export default new CargoController()
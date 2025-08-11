import Cargo from "../models/cargoModels.js";
import Users from "../models/usermodels.js";

Users.belongsTo(Cargo, { foreignKey: 'cargo_id' });
Cargo.hasMany(Users, { foreignKey: 'cargo_id' });

class CargoController {
    //função para adicionar cargo
    async createCargo({nome, descricao, admin}){
        try {
            const cargo = await Cargo.create({nome,descricao, admin})
            return cargo
        } catch (error) {
            console.error(error)
            return error
        }
    }

    //função para listar todos os cargos
    async getCargos(){
        try {
            const cargos = await Cargo.findAndCountAll({
                include: [Users]
            })
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

        //verificar se esse cargo existe

        const validateCargo = await Cargo.findOne({
            where:{
                id:id
            }
        })

        if (!validateCargo){
            throw new Error(`O cargo com o id ${id} não existe`)
        }

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
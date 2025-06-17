import Config from "../models/configModels.js";

class ConfigController {

    //função para encontrar as configurações/parâmetros do sistema
    // se as configurações/parametros não tiver sido criado ainda, será criado com valores default
    async getOrCreateConfig(id) {
        try {
            const [config, created] = await Config.findOrCreate({
                where: { id: id },
                defaults: {
                    cnpj: '00.000.000/0000-00',
                    razaoSocial: 'NOME DA SUA EMPRESA',
                    nomeFantasia: 'NOME FANTASIA',
                    cep: '00000-000',
                    tipoLogadouro: 'Rua',
                    logadouro: 'Endereço Principal',
                    numero: 'S/N',
                    quadra: 'N/A',
                    lote: 'N/A',
                    bairro: 'Centro',
                    cidade: 'Sua Cidade',
                    estado: 'UF',
                    telefone: '(00) 00000-0000',
                    email: 'contato@suaempresa.com',
                    taxaEntrega: 0.00
                }
            })

            if (created) {
                console.log("Registro de configuração inicial criado com sucesso")
            }

            return config

        } catch (error) {
            console.error(error)
            return error
        }
    }

    //função para atualizar configuração do sistema/parâmetros
    async updateConfig(id, updatedData) {
        try {
            const config = await Config.findByPk(id)

            if (!config) {
                throw new Error("Registro de configuração não encontrado através do id.")
            }

            const updatedConfig = await config.update(updatedData)

            return updatedConfig

        } catch (error) {
            console.error(error)
            return error
        }
    }

}

export default new ConfigController()
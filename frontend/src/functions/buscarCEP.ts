import { limparNumero } from "./formatarNumero";
import { ToastContainer, toast } from 'react-toastify';

export async function buscarCEP(cep: string) {
    const cepFormatado = await limparNumero(cep);

    if (cepFormatado.length !== 8) {
        toast.error("CEP Inválido");
        return;
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cepFormatado}/json/`, {
            method: 'GET',
            headers: {
                "Accept": "*/*"
            },
        });
        const data = await response.json();
        if (data.erro) {
            toast.error("CEP não encontrado.");
            return;
        }
        console.log(data);
        return data;
    } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        toast.error("Ocorreu um erro ao buscar o CEP.");
    }
}

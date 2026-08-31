import { limparNumero } from "./formatarNumero";

export async function buscarCNPJ(cnpj:String) {
    const cnpjFormatado = await limparNumero(cnpj)

    if (cnpjFormatado.length !== 14) {
        return alert("CNPJ inválido.");
    }

    try {
        const response = await fetch(`https://publica.cnpj.ws/cnpj/${cnpjFormatado}`, {
            method: 'GET',
            headers: {
                "Accept": "*/*"
            },
        });
        if (!response.ok) {
            return alert("Erro ao buscar o CNPJ. Verifique o número e tente novamente.");
        }

        const data = await response.json();
        console.log(data)
    } catch (error) {
        console.error("Erro ao buscar CNPJ:", error);
        return alert("Ocorreu um erro ao buscar o CNPJ.");
    }
}
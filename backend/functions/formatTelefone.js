export function formatTelefone(numero) {
  // Remove tudo que não for número
  let telefoneLimpo = numero.replace(/\D/g, '');

  // Se já começa com 55, retorna direto
  if (telefoneLimpo.startsWith('55')) {
    return telefoneLimpo;
  }

  // Se tiver 10 ou 11 dígitos, adiciona 55 na frente (DDD + número)
  if (telefoneLimpo.length === 10 || telefoneLimpo.length === 11) {
    return '55' + telefoneLimpo;
  }

  // Caso não esteja no formato esperado, retorna o número limpo mesmo
  return telefoneLimpo;
}

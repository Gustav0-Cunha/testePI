export const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function separarMilhar(inteiro) {
  return inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatarMoeda(valor) {
  const numero = Number(valor) || 0;
  const [inteiro, centavos] = Math.abs(numero).toFixed(2).split('.');
  return `${numero < 0 ? '-' : ''}R$ ${separarMilhar(inteiro)},${centavos}`;
}

export function mascararMoeda(texto) {
  const digitos = String(texto).replace(/\D/g, '').replace(/^0+/, '').slice(0, 11);
  if (!digitos) return '';
  const completo = digitos.padStart(3, '0');
  return `${separarMilhar(completo.slice(0, -2))},${completo.slice(-2)}`;
}

export function moedaParaNumero(texto) {
  const digitos = String(texto).replace(/\D/g, '');
  return digitos ? Number(digitos) / 100 : 0;
}

export function numeroParaMascara(valor) {
  const numero = Number(valor) || 0;
  return numero > 0 ? mascararMoeda(Math.round(numero * 100).toString()) : '';
}

export function emailValido(texto) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(texto).trim());
}

export function hojeISO() {
  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${hoje.getFullYear()}-${mes}-${dia}`;
}

export function lerDataISO(dataISO) {
  const [ano, mes, dia] = String(dataISO ?? '').split('-').map(Number);
  return { ano, mes, dia };
}

export function primeiroNome(nomeCompleto) {
  return String(nomeCompleto ?? '').trim().split(/\s+/)[0] ?? '';
}

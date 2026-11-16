import { estiloDaCategoria } from '../constants/categorias';
import { lerDataISO } from './format';

export function mesAtual() {
  const hoje = new Date();
  return { ano: hoje.getFullYear(), mes: hoje.getMonth() + 1 };
}

export function mudarMes({ ano, mes }, passo) {
  const indice = ano * 12 + (mes - 1) + passo;
  return { ano: Math.floor(indice / 12), mes: (indice % 12) + 1 };
}

export function transacoesDoMes(transacoes, { ano, mes }) {
  return transacoes.filter((t) => {
    const data = lerDataISO(t.data);
    return data.ano === ano && data.mes === mes;
  });
}

export function resumoDoMes(transacoes, periodo) {
  const resumo = { receitas: 0, despesas: 0, investimentos: 0 };
  for (const t of transacoesDoMes(transacoes, periodo)) {
    const valor = Number(t.valor) || 0;
    if (t.tipo === 'RECEITA') resumo.receitas += valor;
    else if (t.tipo === 'DESPESA') resumo.despesas += valor;
    else if (t.tipo === 'INVESTIMENTO') resumo.investimentos += valor;
  }
  return resumo;
}

export function totaisPorCategoria(transacoes, periodo, tipo) {
  const totais = {};
  for (const t of transacoesDoMes(transacoes, periodo)) {
    if (t.tipo !== tipo) continue;
    const categoria = t.categoria || 'Outros';
    totais[categoria] = (totais[categoria] ?? 0) + (Number(t.valor) || 0);
  }

  const totalGeral = Object.values(totais).reduce((soma, v) => soma + v, 0);

  return Object.entries(totais)
    .sort((a, b) => b[1] - a[1])
    .map(([categoria, total], indice) => ({
      categoria,
      total,
      percentual: totalGeral > 0 ? total / totalGeral : 0,
      cor: estiloDaCategoria(categoria, indice).cor,
    }));
}

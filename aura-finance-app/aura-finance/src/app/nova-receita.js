import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import TransactionForm from '../components/TransactionForm';
import { CATEGORIAS_RECEITA, estiloDaCategoria } from '../constants/categorias';
import { useFinance } from '../context/FinanceContext';
import { colors } from '../theme/colors';
import { mesAtual, transacoesDoMes } from '../utils/finance';
import { formatarMoeda, lerDataISO, MESES, MESES_ABREV } from '../utils/format';

export default function NovaReceitaScreen() {
  const { transacoes } = useFinance();

  const periodo = mesAtual();
  const receitas = transacoesDoMes(transacoes, periodo)
    .filter((t) => t.tipo === 'RECEITA')
    .sort((a, b) => (a.data === b.data ? b.id - a.id : a.data < b.data ? 1 : -1));
  const total = receitas.reduce((soma, t) => soma + (Number(t.valor) || 0), 0);

  return (
    <TransactionForm
      tipo="RECEITA"
      titulo="Nova Receita"
      placeholderDescricao="ex: salário mensal"
      categorias={CATEGORIAS_RECEITA}
      textoBotao="Salvar Receita"
      legenda="Atualiza o saldo e o gráfico de receitas"
    >
      <View style={styles.secao}>
        <View style={styles.cabecalho}>
          <Text style={styles.secaoTitulo}>Receitas de {MESES[periodo.mes - 1]}</Text>
          <Text style={styles.secaoTotal}>{formatarMoeda(total)}</Text>
        </View>

        {receitas.length === 0 ? (
          <Text style={styles.vazio}>Nenhuma receita registrada neste mês.</Text>
        ) : (
          <View style={styles.lista}>
            {receitas.map((receita) => (
              <ItemReceita key={receita.id} receita={receita} />
            ))}
          </View>
        )}
      </View>
    </TransactionForm>
  );
}

function ItemReceita({ receita }) {
  const { dia, mes } = lerDataISO(receita.data);
  const { cor, icone } = estiloDaCategoria(receita.categoria);

  return (
    <View style={styles.linha}>
      <View style={styles.data}>
        <Text style={styles.dataTexto}>{MESES_ABREV[mes - 1]}</Text>
        <Text style={styles.dataTexto}>{String(dia).padStart(2, '0')}</Text>
      </View>
      <View style={styles.card}>
        <View style={[styles.icone, { backgroundColor: cor }]}>
          <Ionicons name={icone} size={18} color={colors.white} />
        </View>
        <Text style={[styles.cardTexto, styles.descricao]} numberOfLines={1}>
          {receita.descricao}
        </Text>
        <Text style={[styles.cardTexto, styles.valor]} numberOfLines={1}>
          + {formatarMoeda(receita.valor)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  secao: { marginTop: 36 },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  secaoTitulo: { fontSize: 18, color: colors.title },
  secaoTotal: { fontSize: 16, color: colors.investGreenText, fontWeight: '700' },

  vazio: { textAlign: 'center', color: colors.textMuted, fontSize: 14, marginTop: 4 },

  lista: { gap: 12 },
  linha: { flexDirection: 'row', alignItems: 'center' },
  data: { width: 46, alignItems: 'center' },
  dataTexto: { fontSize: 15, color: colors.text, lineHeight: 19 },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minHeight: 50,
  },
  icone: {
    width: 34,
    height: 34,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardTexto: { color: colors.success, fontSize: 14 },
  descricao: { flexShrink: 1 },
  valor: { flexShrink: 0, marginLeft: 'auto', paddingLeft: 8 },
});

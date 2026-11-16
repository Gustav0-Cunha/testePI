import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import BackButton from '../components/BackButton';
import ErrorBox from '../components/ErrorBox';
import Screen from '../components/Screen';
import { useFinance } from '../context/FinanceContext';
import { estiloDaCategoria } from '../constants/categorias';
import { colors } from '../theme/colors';
import { avisar, confirmar } from '../utils/alerts';
import { mesAtual, mudarMes, transacoesDoMes } from '../utils/finance';
import { formatarMoeda, lerDataISO, MESES, MESES_ABREV } from '../utils/format';

export default function ExtratoScreen() {
  const { transacoes, carregando, erro, recarregar, removerTransacao } = useFinance();
  const [periodo, setPeriodo] = useState(mesAtual());

  const anoAtual = mesAtual().ano;
  const doMes = transacoesDoMes(transacoes, periodo).sort((a, b) => {
    if (a.data === b.data) return a.id - b.id;
    return a.data < b.data ? -1 : 1;
  });

  const excluir = async (transacao) => {
    const ok = await confirmar(
      'Excluir transação?',
      `${transacao.descricao} - ${formatarMoeda(transacao.valor)}\nO saldo será recalculado.`,
      'Excluir',
    );
    if (!ok) return;
    try {
      await removerTransacao(transacao.id);
    } catch (e) {
      avisar('Não foi possível excluir', e.message);
    }
  };

  return (
    <Screen refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} />}>
      <BackButton />
      <Text style={styles.titulo}>Extrato</Text>

      <View style={styles.seletor}>
        <Pressable onPress={() => setPeriodo(mudarMes(periodo, -1))} hitSlop={12} style={styles.seta}>
          <Ionicons name="chevron-back" size={16} color={colors.text} />
        </Pressable>
        <Text style={styles.mes}>
          {MESES[periodo.mes - 1]}
          {periodo.ano !== anoAtual ? ` ${periodo.ano}` : ''}
        </Text>
        <Pressable onPress={() => setPeriodo(mudarMes(periodo, 1))} hitSlop={12} style={styles.seta}>
          <Ionicons name="chevron-forward" size={16} color={colors.text} />
        </Pressable>
      </View>

      <ErrorBox message={erro} onRetry={recarregar} />

      {doMes.length === 0 ? (
        <Text style={styles.vazio}>Nenhuma movimentação em {MESES[periodo.mes - 1]}.</Text>
      ) : (
        <View style={styles.lista}>
          {doMes.map((transacao) => (
            <ItemExtrato key={transacao.id} transacao={transacao} onLongPress={() => excluir(transacao)} />
          ))}
          <Text style={styles.dica}>Segure um item para excluir</Text>
        </View>
      )}
    </Screen>
  );
}

function ItemExtrato({ transacao, onLongPress }) {
  const { dia, mes } = lerDataISO(transacao.data);
  const { cor, icone } = estiloDaCategoria(transacao.categoria);
  const ehReceita = transacao.tipo === 'RECEITA';

  return (
    <View style={styles.linha}>
      <View style={styles.data}>
        <Text style={styles.dataTexto}>{MESES_ABREV[mes - 1]}</Text>
        <Text style={styles.dataTexto}>{String(dia).padStart(2, '0')}</Text>
      </View>
      <Pressable
        onLongPress={onLongPress}
        delayLongPress={350}
        style={({ pressed }) => [styles.card, pressed && styles.apertado]}
      >
        <View style={[styles.icone, { backgroundColor: cor }]}>
          <Ionicons name={icone} size={18} color={colors.white} />
        </View>
        <Text style={[styles.cardTexto, styles.descricao, ehReceita && styles.receita]} numberOfLines={1}>
          {transacao.descricao}
        </Text>
        <Text style={[styles.cardTexto, styles.valor, ehReceita && styles.receita]} numberOfLines={1}>
          - {formatarMoeda(transacao.valor)}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 24, color: colors.title, textAlign: 'center' },
  seletor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#555555',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginTop: 4,
    marginBottom: 28,
  },
  seta: { padding: 2 },
  mes: { fontSize: 16, color: colors.text },

  lista: { gap: 16 },
  linha: { flexDirection: 'row', alignItems: 'center' },
  data: { width: 46, alignItems: 'center' },
  dataTexto: { fontSize: 16, color: colors.text, lineHeight: 20 },
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
  cardTexto: { color: colors.textOnNavy, fontSize: 14 },
  descricao: { flexShrink: 1 },
  valor: { flexShrink: 0, marginLeft: 4 },
  receita: { color: colors.success },
  apertado: { opacity: 0.75 },

  vazio: { textAlign: 'center', color: colors.textMuted, fontSize: 15, marginTop: 24 },
  dica: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: 4 },
});

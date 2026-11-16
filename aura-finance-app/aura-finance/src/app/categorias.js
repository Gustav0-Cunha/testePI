import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import BackButton from '../components/BackButton';
import { PrimaryButton } from '../components/Buttons';
import CategoryTotals, { formatarPercentual } from '../components/CategoryTotals';
import Screen from '../components/Screen';
import ScreenTitle from '../components/ScreenTitle';
import { useFinance } from '../context/FinanceContext';
import { colors } from '../theme/colors';
import { mesAtual, totaisPorCategoria } from '../utils/finance';
import { formatarMoeda, MESES } from '../utils/format';

const ABAS = [
  { tipo: 'DESPESA', rotulo: 'Despesas' },
  { tipo: 'RECEITA', rotulo: 'Receitas' },
];

export default function CategoriasScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { transacoes } = useFinance();
  const [tipo, setTipo] = useState(params.tipo === 'RECEITA' ? 'RECEITA' : 'DESPESA');
  const [categoria, setCategoria] = useState(null);

  const trocarTipo = (novoTipo) => {
    setTipo(novoTipo);
    setCategoria(null);
  };

  const periodo = mesAtual();
  const dados = totaisPorCategoria(transacoes, periodo, tipo);
  const total = dados.reduce((soma, item) => soma + item.total, 0);
  const ehDespesa = tipo === 'DESPESA';

  return (
    <Screen>
      <BackButton />
      <ScreenTitle
        subtitle={`valores com base na sua ${ehDespesa ? 'despesa' : 'receita'} mensal de: ${formatarMoeda(total)}`}
      >
        Categorias
      </ScreenTitle>

      <View style={styles.abas}>
        {ABAS.map((aba) => (
          <Pressable
            key={aba.tipo}
            onPress={() => trocarTipo(aba.tipo)}
            style={[styles.aba, tipo === aba.tipo && styles.abaAtiva]}
          >
            <Text style={[styles.abaTexto, tipo === aba.tipo && styles.abaTextoAtivo]}>{aba.rotulo}</Text>
          </Pressable>
        ))}
      </View>

      {dados.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioTexto}>
            Nenhuma {ehDespesa ? 'despesa' : 'receita'} registrada em {MESES[periodo.mes - 1]}.
          </Text>
          <PrimaryButton
            title={ehDespesa ? 'Nova despesa' : 'Nova receita'}
            onPress={() => router.push(ehDespesa ? '/nova-despesa' : '/nova-receita')}
            style={styles.vazioBotao}
          />
        </View>
      ) : (
        <>
          <CategoryTotals dados={dados} categoria={categoria} onChangeCategoria={setCategoria} />

          <View style={styles.legenda}>
            {dados.map((item) => {
              const ativa = item.categoria === categoria;
              return (
                <Pressable
                  key={item.categoria}
                  onPress={() => setCategoria(ativa ? null : item.categoria)}
                  style={[styles.itemLegenda, ativa && styles.itemLegendaAtivo]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: ativa }}
                >
                  <View style={[styles.quadrado, { backgroundColor: item.cor }]} />
                  <Text style={styles.nomeLegenda}>{item.categoria}</Text>
                  <Text style={styles.valorLegenda}>{formatarMoeda(item.total)}</Text>
                  <Text style={styles.percentualLegenda}>{formatarPercentual(item.percentual)}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  abas: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: colors.tile,
    borderRadius: 999,
    padding: 3,
    marginTop: -8,
    marginBottom: 24,
  },
  aba: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999 },
  abaAtiva: { backgroundColor: colors.navy },
  abaTexto: { fontSize: 13, color: colors.text },
  abaTextoAtivo: { color: colors.white },

  legenda: { marginTop: 28, gap: 8 },
  itemLegenda: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  itemLegendaAtivo: { borderColor: colors.navy },
  quadrado: { width: 22, height: 22, borderRadius: 6, marginRight: 12 },
  nomeLegenda: { flex: 1, fontSize: 15, color: colors.text },
  valorLegenda: { fontSize: 15, color: colors.text },
  percentualLegenda: { width: 58, textAlign: 'right', fontSize: 14, color: colors.textMuted },

  vazio: { alignItems: 'center', marginTop: 40 },
  vazioTexto: { fontSize: 15, color: colors.textMuted, textAlign: 'center' },
  vazioBotao: { marginTop: 20 },
});

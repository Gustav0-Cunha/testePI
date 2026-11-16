import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import ErrorBox from '../components/ErrorBox';
import Screen from '../components/Screen';
import { useFinance } from '../context/FinanceContext';
import { colors } from '../theme/colors';
import { mesAtual, resumoDoMes } from '../utils/finance';
import { formatarMoeda, primeiroNome } from '../utils/format';

const ATALHOS = [
  { rota: '/nova-despesa', titulo: 'Nova despesa', subtitulo: 'cadastre um gasto', icone: 'add', corIcone: colors.navy },
  { rota: '/categorias', titulo: 'Categoria', subtitulo: 'porcentagem dos gastos', icone: 'pie-chart', corIcone: '#E8711C' },
  { rota: '/extrato', titulo: 'Extrato', subtitulo: 'lista os gastos', icone: 'card', corIcone: '#111111' },
  { rota: '/perfil', titulo: 'Meu Perfil', subtitulo: 'salário e risco', icone: 'person-circle-outline', corIcone: '#444444' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { perfil, transacoes, carregando, erro, recarregar } = useFinance();

  const resumo = resumoDoMes(transacoes, mesAtual());
  const nome = primeiroNome(perfil?.nome);

  return (
    <Screen refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} />}>
      <View style={styles.cabecalho}>
        <Text style={styles.ola}>Olá{nome ? `, ${nome}` : ''},</Text>
        <Text style={styles.bemVindo}>Bem-vindo de volta</Text>
      </View>

      <ErrorBox message={erro} onRetry={recarregar} />

      <View style={styles.cardSaldo}>
        <Text style={styles.saldoLabel}>saldo do mês</Text>
        <Text style={styles.saldoValor} numberOfLines={1} adjustsFontSizeToFit>
          {formatarMoeda(perfil?.saldoAtual ?? 0)}
        </Text>
        <View style={styles.linhaResumo}>
          <View style={styles.colunaResumo}>
            <Text style={styles.resumoLabel}>Receita</Text>
            <Text style={styles.resumoValor}>{formatarMoeda(resumo.receitas)}</Text>
          </View>
          <View style={styles.colunaResumo}>
            <Text style={styles.resumoLabel}>Despesas</Text>
            <Text style={styles.resumoValor}>{formatarMoeda(resumo.despesas)}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.acessar}>Acessar</Text>

      <View style={styles.grade}>
        {ATALHOS.map((atalho) => (
          <Pressable
            key={atalho.rota}
            onPress={() => router.push(atalho.rota)}
            style={({ pressed }) => [styles.tile, pressed && styles.apertado]}
            accessibilityRole="button"
          >
            <Ionicons name={atalho.icone} size={20} color={atalho.corIcone} />
            <Text style={styles.tileTitulo}>{atalho.titulo}</Text>
            <Text style={styles.tileSubtitulo}>{atalho.subtitulo}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.linhaBotoes}>
        <Pressable
          onPress={() => router.push('/investimentos')}
          style={({ pressed }) => [styles.botaoGrande, styles.investimentos, pressed && styles.apertado]}
          accessibilityRole="button"
        >
          <View style={styles.botaoTopo}>
            <Ionicons name="trending-up" size={22} color={colors.investGreenText} />
            <Text style={[styles.botaoTitulo, { color: colors.investGreenText }]}>Investimentos</Text>
          </View>
          <Text style={[styles.botaoTexto, { color: colors.investGreenText }]}>
            indicações com base no seu salário e gastos
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/nova-receita')}
          style={({ pressed }) => [styles.botaoGrande, styles.receita, pressed && styles.apertado]}
          accessibilityRole="button"
        >
          <View style={styles.botaoTopo}>
            <Ionicons name="cash-outline" size={22} color={colors.receitaBlueText} />
            <Text style={[styles.botaoTitulo, { color: colors.receitaBlueText }]}>Nova receita</Text>
          </View>
          <Text style={[styles.botaoTexto, { color: colors.receitaBlueText }]}>
            cadastre um ganho: salário, extra...
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cabecalho: { paddingTop: 16, marginBottom: 20 },
  ola: { fontSize: 13, color: colors.textMuted },
  bemVindo: { fontSize: 14, color: colors.title, marginTop: 6 },

  cardSaldo: {
    backgroundColor: colors.navy,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  saldoLabel: { color: colors.textOnNavy, fontSize: 16 },
  saldoValor: { color: colors.textOnNavy, fontSize: 32, marginTop: 2 },
  linhaResumo: { flexDirection: 'row', marginTop: 14 },
  colunaResumo: { flex: 1 },
  resumoLabel: { color: colors.textOnNavyMuted, fontSize: 13 },
  resumoValor: { color: colors.textOnNavy, fontSize: 16, marginTop: 2 },

  acessar: { fontSize: 18, color: colors.title, marginTop: 18, marginBottom: 12, marginLeft: 6 },

  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
    paddingHorizontal: 6,
  },
  tile: {
    width: '47%',
    minHeight: 112,
    backgroundColor: colors.tile,
    borderRadius: 10,
    padding: 10,
  },
  tileTitulo: { fontSize: 18, color: colors.title, textAlign: 'center', marginTop: 2 },
  tileSubtitulo: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 2 },

  linhaBotoes: { flexDirection: 'row', gap: 12, marginTop: 22 },
  botaoGrande: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  investimentos: { backgroundColor: colors.investGreen },
  receita: { backgroundColor: colors.receitaBlue },
  botaoTopo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  botaoTitulo: { fontSize: 16, flexShrink: 1 },
  botaoTexto: { fontSize: 12, marginTop: 6 },

  apertado: { opacity: 0.7 },
});

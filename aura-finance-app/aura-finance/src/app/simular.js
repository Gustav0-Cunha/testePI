import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { investimentoApi } from '../api/services';
import BackButton from '../components/BackButton';
import { OutlineButton, PrimaryButton } from '../components/Buttons';
import ChipGroup from '../components/ChipGroup';
import ErrorBox from '../components/ErrorBox';
import Screen from '../components/Screen';
import ScreenTitle from '../components/ScreenTitle';
import TextField from '../components/TextField';
import { CATEGORIA_INVESTIMENTO } from '../constants/categorias';
import { ROTULO_RISCO } from '../constants/investimentos';
import { useFinance } from '../context/FinanceContext';
import { colors } from '../theme/colors';
import { avisar, confirmar } from '../utils/alerts';
import { mesAtual, resumoDoMes } from '../utils/finance';
import { formatarMoeda, hojeISO, mascararMoeda, moedaParaNumero, numeroParaMascara } from '../utils/format';

const PRAZOS = [
  { value: '6', label: '6 meses' },
  { value: '12', label: '1 ano' },
  { value: '24', label: '2 anos' },
  { value: '60', label: '5 anos' },
];

export default function SimularScreen() {
  const router = useRouter();
  const { codigo } = useLocalSearchParams();
  const { perfil, transacoes, adicionarTransacao } = useFinance();

  const [produto, setProduto] = useState(null);
  const [valorInicial, setValorInicial] = useState('');
  const [aporte, setAporte] = useState('');
  const [prazo, setPrazo] = useState('12');
  const [resultado, setResultado] = useState(null);
  const [simulando, setSimulando] = useState(false);
  const [registrando, setRegistrando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    investimentoApi
      .opcoes()
      .then((lista) => setProduto(lista.find((p) => p.codigo === codigo) ?? null))
      .catch((e) => setErro(e.message));
  }, [codigo]);

  useEffect(() => {
    const sobra = (Number(perfil?.salarioMensal) || 0) - resumoDoMes(transacoes, mesAtual()).despesas;
    if (sobra > 0) setAporte((atual) => atual || numeroParaMascara(Math.floor(sobra)));
  }, [perfil?.salarioMensal, transacoes]);

  const simular = async () => {
    const inicial = moedaParaNumero(valorInicial);
    const meses = Number(prazo);
    if (inicial <= 0) return setErro('Informe um valor inicial maior que zero.');
    if (!meses || meses < 1 || meses > 600) return setErro('O prazo deve ser de 1 a 600 meses.');

    setErro(null);
    setSimulando(true);
    try {
      const resposta = await investimentoApi.simular({
        produtoCodigo: codigo,
        valorInicial: inicial,
        aporteMensal: moedaParaNumero(aporte),
        prazoMeses: meses,
      });
      setResultado(resposta);
    } catch (e) {
      setResultado(null);
      setErro(e.message);
    } finally {
      setSimulando(false);
    }
  };

  const registrarNoExtrato = async () => {
    const valor = resultado.valorInicial;
    const ok = await confirmar(
      'Registrar investimento?',
      `Lançar ${formatarMoeda(valor)} em "${resultado.produtoNome}" no extrato. O valor sai do seu saldo.`,
      'Registrar',
    );
    if (!ok) return;

    setRegistrando(true);
    try {
      await adicionarTransacao({
        descricao: resultado.produtoNome,
        valor,
        categoria: CATEGORIA_INVESTIMENTO,
        tipo: 'INVESTIMENTO',
        dataCriacao: hojeISO(),
      });
      avisar('Investimento registrado!', 'Ele já aparece no seu extrato.');
      router.replace('/extrato');
    } catch (e) {
      setErro(e.message);
    } finally {
      setRegistrando(false);
    }
  };

  return (
    <Screen>
      <BackButton />
      <ScreenTitle subtitle={produto ? `${ROTULO_RISCO[produto.perfilRisco]} - ${produto.descricao}` : undefined}>
        {produto?.nome ?? 'Simular investimento'}
      </ScreenTitle>

      <TextField
        label="Valor inicial:"
        placeholder="0,00"
        keyboardType="numeric"
        value={valorInicial}
        onChangeText={(texto) => setValorInicial(mascararMoeda(texto))}
      />
      <TextField
        label="Aporte mensal:"
        placeholder="0,00"
        keyboardType="numeric"
        value={aporte}
        onChangeText={(texto) => setAporte(mascararMoeda(texto))}
      />

      <Text style={styles.label}>Prazo</Text>
      <ChipGroup options={PRAZOS} value={prazo} onChange={setPrazo} />

      <ErrorBox message={erro} style={styles.erro} />

      <PrimaryButton title="Simular" onPress={simular} loading={simulando} style={styles.botao} />

      {resultado ? (
        <>
          <View style={styles.resultado}>
            <Text style={styles.resultadoLabel}>valor final estimado</Text>
            <Text style={styles.resultadoValor}>{formatarMoeda(resultado.valorFinalEstimado)}</Text>
            <View style={styles.linha}>
              <View style={styles.coluna}>
                <Text style={styles.resultadoLabel}>Rendimento</Text>
                <Text style={styles.resultadoTexto}>{formatarMoeda(resultado.rendimentoEstimado)}</Text>
              </View>
              <View style={styles.coluna}>
                <Text style={styles.resultadoLabel}>Taxa ao ano</Text>
                <Text style={styles.resultadoTexto}>{resultado.taxaAnualAplicada.toFixed(2).replace('.', ',')}%</Text>
              </View>
            </View>
          </View>
          <Text style={styles.observacao}>{resultado.observacao}</Text>

          <OutlineButton
            title="Registrar no extrato"
            onPress={registrarNoExtrato}
            loading={registrando}
            style={styles.registrar}
          />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 15, color: colors.textMuted, marginTop: 4, marginBottom: 8 },
  erro: { marginTop: 18, marginBottom: 0 },
  botao: { marginTop: 28 },

  resultado: {
    backgroundColor: colors.navy,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 28,
  },
  resultadoLabel: { color: colors.textOnNavyMuted, fontSize: 13 },
  resultadoValor: { color: colors.textOnNavy, fontSize: 30, marginTop: 2 },
  resultadoTexto: { color: colors.textOnNavy, fontSize: 16, marginTop: 2 },
  linha: { flexDirection: 'row', marginTop: 14 },
  coluna: { flex: 1 },
  observacao: { fontSize: 11, color: colors.textMuted, marginTop: 10, textAlign: 'center' },
  registrar: { marginTop: 20 },
});

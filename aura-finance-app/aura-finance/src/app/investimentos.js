import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { investimentoApi } from '../api/services';
import BackButton from '../components/BackButton';
import { OutlineButton, PrimaryButton } from '../components/Buttons';
import ErrorBox from '../components/ErrorBox';
import Screen from '../components/Screen';
import ScreenTitle from '../components/ScreenTitle';
import { DESTAQUE_PRODUTO, ROTULO_RISCO } from '../constants/investimentos';
import { useFinance } from '../context/FinanceContext';
import { colors, investCardPalettes } from '../theme/colors';
import { confirmar } from '../utils/alerts';
import { mesAtual, resumoDoMes } from '../utils/finance';
import { formatarMoeda } from '../utils/format';

const QUANTIDADE_INICIAL = 4;

export default function InvestimentosScreen() {
  const router = useRouter();
  const { perfil, transacoes } = useFinance();
  const [opcoes, setOpcoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [mostrarTodas, setMostrarTodas] = useState(false);

  const clienteCarregado = perfil != null;
  const precisaQuestionario = clienteCarregado && perfil.pontuacaoPerfilRisco == null;

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setOpcoes(await investimentoApi.opcoes());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!clienteCarregado) return;
    if (precisaQuestionario) {
      setCarregando(false);
      return;
    }
    carregar();
  }, [clienteCarregado, precisaQuestionario, carregar]);

  const salario = Number(perfil?.salarioMensal) || 0;
  const sobra = salario - resumoDoMes(transacoes, mesAtual()).despesas;

  const verMais = async () => {
    if (opcoes.length > QUANTIDADE_INICIAL) {
      setMostrarTodas(!mostrarTodas);
      return;
    }
    const ok = await confirmar(
      'Ver mais opções',
      'As opções mostradas são as compatíveis com o seu perfil de risco. Quer refazer o questionário de perfil?',
      'Refazer',
    );
    if (ok) router.push('/questionario');
  };

  const ordenadas = [
    ...opcoes.filter((p) => p.perfilRisco === perfil?.perfilRisco),
    ...opcoes.filter((p) => p.perfilRisco !== perfil?.perfilRisco),
  ];
  const visiveis = mostrarTodas ? ordenadas : ordenadas.slice(0, QUANTIDADE_INICIAL);

  return (
    <Screen>
      <BackButton />
      <Text style={styles.titulo}>Investimentos</Text>
      <TextoSobra salario={salario} sobra={sobra} onCadastrarSalario={() => router.push('/perfil')} />

      {precisaQuestionario ? (
        <View style={styles.questionario}>
          <ScreenTitle subtitle="Para indicar investimentos, precisamos saber o seu perfil de investidor.">
            Descubra seu perfil
          </ScreenTitle>
          <PrimaryButton title="Responder questionário" onPress={() => router.push('/questionario')} />
        </View>
      ) : carregando ? (
        <ActivityIndicator color={colors.navy} style={styles.spinner} />
      ) : (
        <>
          <ErrorBox message={erro} onRetry={carregar} />

          <View style={styles.lista}>
            {visiveis.map((produto, indice) => (
              <CardInvestimento
                key={produto.codigo}
                produto={produto}
                indicado={produto.perfilRisco === perfil?.perfilRisco}
                paleta={investCardPalettes[indice % investCardPalettes.length]}
                onPress={() => router.push({ pathname: '/simular', params: { codigo: produto.codigo } })}
              />
            ))}
          </View>

          {opcoes.length > 0 ? (
            <>
              <Text style={styles.dica}>Toque em um investimento para simular</Text>
              <OutlineButton
                title={mostrarTodas ? 'Ver menos opções ' : 'Ver mais opções '}
                onPress={verMais}
                style={styles.verMais}
                textStyle={styles.verMaisTexto}
              >
                {mostrarTodas ? '↙' : '↗'}
              </OutlineButton>
            </>
          ) : null}
        </>
      )}
    </Screen>
  );
}

function TextoSobra({ salario, sobra, onCadastrarSalario }) {
  if (salario <= 0) {
    return (
      <Pressable onPress={onCadastrarSalario}>
        <Text style={styles.sobra}>
          Cadastre seu salário em <Text style={styles.link}>Meu Perfil</Text> para calcularmos quanto sobra por mês.
        </Text>
      </Pressable>
    );
  }
  if (sobra <= 0) {
    return (
      <Text style={styles.sobra}>
        Seus gastos deste mês já passaram do seu salário. Que tal revisar as despesas antes de investir?
      </Text>
    );
  }
  return (
    <Text style={styles.sobra}>
      com base no seu salário e gastos, sobram cerca de{'\n'}
      <Text style={styles.sobraValor}>{formatarMoeda(sobra)} por mês</Text>
    </Text>
  );
}

function CardInvestimento({ produto, indicado, paleta, onPress }) {
  const partes = [ROTULO_RISCO[produto.perfilRisco], DESTAQUE_PRODUTO[produto.codigo] ?? produto.descricao];
  if (indicado) partes.unshift('indicado');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: paleta.bg, borderColor: paleta.border },
        pressed && styles.apertado,
      ]}
    >
      <Text style={[styles.cardTitulo, { color: paleta.title }]}>{produto.nome}</Text>
      <Text style={[styles.cardTexto, { color: paleta.text }]}>{partes.join(' - ')}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 24, color: colors.title, textAlign: 'center' },
  sobra: { fontSize: 13, color: colors.textMuted, marginTop: 6, marginBottom: 36 },
  sobraValor: { color: colors.text, fontWeight: '600' },
  link: { color: colors.link, fontWeight: '700' },

  questionario: { marginTop: 8 },
  spinner: { marginTop: 32 },

  lista: { gap: 18, paddingHorizontal: 4 },
  card: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  cardTitulo: { fontSize: 17, fontWeight: '700' },
  cardTexto: { fontSize: 16, marginTop: 2 },
  apertado: { opacity: 0.75 },

  dica: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: 14 },
  verMais: { width: '100%', marginTop: 20 },
  verMaisTexto: { fontSize: 18 },
});

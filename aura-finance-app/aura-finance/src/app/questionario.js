import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import BackButton from '../components/BackButton';
import { PrimaryButton } from '../components/Buttons';
import ErrorBox from '../components/ErrorBox';
import Screen from '../components/Screen';
import ScreenTitle from '../components/ScreenTitle';
import { useFinance } from '../context/FinanceContext';
import { colors } from '../theme/colors';
import { avisar } from '../utils/alerts';

const PERGUNTAS = [
  {
    campo: 'horizonte',
    pergunta: 'Por quanto tempo você pretende deixar o dinheiro investido?',
    opcoes: [
      { valor: 'CURTO', texto: 'Menos de 1 ano' },
      { valor: 'MEDIO', texto: 'De 1 a 5 anos' },
      { valor: 'LONGO', texto: 'Mais de 5 anos' },
    ],
  },
  {
    campo: 'toleranciaPerda',
    pergunta: 'Quanto você aceitaria ver seu investimento cair temporariamente?',
    opcoes: [
      { valor: 'BAIXA', texto: 'Nada ou quase nada' },
      { valor: 'MEDIA', texto: 'Até 10%' },
      { valor: 'ALTA', texto: 'Mais de 10%' },
    ],
  },
  {
    campo: 'necessidadeLiquidez',
    pergunta: 'Você pode precisar desse dinheiro de repente?',
    opcoes: [
      { valor: 'ALTA', texto: 'Sim, a qualquer momento' },
      { valor: 'MEDIA', texto: 'Talvez, em alguns meses' },
      { valor: 'BAIXA', texto: 'Não, é para o longo prazo' },
    ],
  },
  {
    campo: 'experiencia',
    pergunta: 'Qual a sua experiência com investimentos?',
    opcoes: [
      { valor: 'INICIANTE', texto: 'Nunca investi ou só poupança' },
      { valor: 'INTERMEDIARIO', texto: 'Já investi em renda fixa' },
      { valor: 'AVANCADO', texto: 'Já investi em ações ou fundos' },
    ],
  },
  {
    campo: 'reacaoQueda',
    pergunta: 'Se seus investimentos caíssem 20% em um mês, você...',
    opcoes: [
      { valor: 'RESGATAR', texto: 'Resgataria tudo' },
      { valor: 'AGUARDAR', texto: 'Esperaria recuperar' },
      { valor: 'APORTAR_MAIS', texto: 'Aproveitaria para investir mais' },
    ],
  },
];

const NOME_PERFIL = { CONSERVADOR: 'Conservador', MODERADO: 'Moderado', ARROJADO: 'Arrojado' };

export default function QuestionarioScreen() {
  const router = useRouter();
  const { responderQuestionario } = useFinance();
  const [respostas, setRespostas] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  const responder = (campo, valor) => setRespostas((atual) => ({ ...atual, [campo]: valor }));

  const enviar = async () => {
    if (PERGUNTAS.some((p) => !respostas[p.campo])) {
      return setErro('Responda todas as perguntas.');
    }
    setErro(null);
    setEnviando(true);
    try {
      const perfil = await responderQuestionario(respostas);
      avisar('Perfil atualizado!', `Seu perfil de investidor é ${NOME_PERFIL[perfil.perfilRisco]}.`);
      router.back();
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Screen>
      <BackButton />
      <ScreenTitle subtitle="Responda 5 perguntas rápidas para personalizarmos suas indicações de investimento">
        Perfil de risco
      </ScreenTitle>

      {PERGUNTAS.map((p, indice) => (
        <View key={p.campo} style={styles.bloco}>
          <Text style={styles.pergunta}>
            {indice + 1}. {p.pergunta}
          </Text>
          {p.opcoes.map((opcao) => {
            const selecionada = respostas[p.campo] === opcao.valor;
            return (
              <Pressable
                key={opcao.valor}
                onPress={() => responder(p.campo, opcao.valor)}
                style={[styles.opcao, selecionada && styles.opcaoSelecionada]}
                accessibilityRole="radio"
                accessibilityState={{ checked: selecionada }}
              >
                <Text style={[styles.opcaoTexto, selecionada && styles.opcaoTextoSelecionado]}>{opcao.texto}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}

      <ErrorBox message={erro} />

      <PrimaryButton title="Calcular meu perfil" onPress={enviar} loading={enviando} style={styles.botao} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  bloco: { marginBottom: 20 },
  pergunta: { fontSize: 15, color: colors.text, marginBottom: 8, fontWeight: '600' },
  opcao: {
    backgroundColor: colors.tile,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  opcaoSelecionada: { backgroundColor: colors.navy },
  opcaoTexto: { fontSize: 14, color: colors.text },
  opcaoTextoSelecionado: { color: colors.white },
  botao: { marginTop: 8 },
});

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import BackButton from '../components/BackButton';
import { OutlineButton, PrimaryButton } from '../components/Buttons';
import ErrorBox from '../components/ErrorBox';
import RiskSlider from '../components/RiskSlider';
import Screen from '../components/Screen';
import ScreenTitle from '../components/ScreenTitle';
import TextField from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { colors } from '../theme/colors';
import { confirmar } from '../utils/alerts';
import { formatarMoeda, mascararMoeda, moedaParaNumero, numeroParaMascara } from '../utils/format';

export default function PerfilScreen() {
  const router = useRouter();
  const { sair } = useAuth();
  const { perfil, erro, recarregar } = useFinance();
  const [editandoSalario, setEditandoSalario] = useState(false);

  const respondeuQuestionario = perfil?.pontuacaoPerfilRisco != null;

  const fazerLogout = async () => {
    const ok = await confirmar('Sair da conta?', 'Você precisará entrar novamente.', 'Sair');
    if (ok) sair();
  };

  return (
    <Screen>
      <BackButton />
      <ScreenTitle>Meu perfil</ScreenTitle>

      <ErrorBox message={erro} onRetry={recarregar} />

      <View style={styles.pilula}>
        <Text style={styles.pilulaTexto}>
          <Text style={styles.negrito}>Nome: </Text>
          {perfil?.nome ?? '...'}
        </Text>
      </View>

      <Pressable onPress={() => setEditandoSalario(true)} style={styles.pilula} accessibilityRole="button">
        <Text style={styles.pilulaTexto}>
          <Text style={styles.negrito}>Salário: </Text>
          {formatarMoeda(perfil?.salarioMensal ?? 0)}
        </Text>
        <Ionicons name="pencil" size={14} color={colors.textMuted} style={styles.lapis} />
      </Pressable>

      <View style={styles.pilula}>
        <Text style={styles.pilulaTexto}>
          <Text style={styles.negrito}>Conta: </Text>
          Ativa
        </Text>
      </View>

      <Text style={styles.risco}>Perfil de risco:</Text>
      <Pressable onPress={() => router.push('/questionario')} style={styles.areaSlider}>
        <RiskSlider perfilRisco={perfil?.perfilRisco} respondido={respondeuQuestionario} />
        <Text style={styles.influencia}>influencia as indicações de investimento</Text>
        <Text style={styles.linkQuestionario}>
          {respondeuQuestionario ? 'Refazer questionário de perfil ›' : 'Responder questionário de perfil ›'}
        </Text>
      </Pressable>

      <View style={styles.botoes}>
        <OutlineButton title="Nova Receita" onPress={() => router.push('/nova-receita')} />
        <OutlineButton title="Alterar senha" onPress={() => router.push('/alterar-senha')} />
        <OutlineButton title="Sair" onPress={fazerLogout} />
      </View>

      <ModalSalario
        visivel={editandoSalario}
        salarioAtual={perfil?.salarioMensal}
        onFechar={() => setEditandoSalario(false)}
      />
    </Screen>
  );
}

function ModalSalario({ visivel, salarioAtual, onFechar }) {
  const { atualizarPerfil } = useFinance();
  const [valor, setValor] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  const aoAbrir = () => {
    setValor(numeroParaMascara(salarioAtual));
    setErro(null);
  };

  const salvar = async () => {
    setSalvando(true);
    setErro(null);
    try {
      await atualizarPerfil({ salarioMensal: moedaParaNumero(valor) });
      onFechar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal visible={visivel} transparent animationType="fade" onShow={aoAbrir} onRequestClose={onFechar}>
      <Pressable style={styles.fundoModal} onPress={onFechar}>
        <Pressable style={styles.modal} onPress={() => {}}>
          <Text style={styles.modalTitulo}>Salário mensal</Text>
          <Text style={styles.modalTexto}>Usado para calcular quanto sobra por mês para investir.</Text>
          <TextField
            label="Valor:"
            placeholder="0,00"
            keyboardType="numeric"
            value={valor}
            onChangeText={(texto) => setValor(mascararMoeda(texto))}
            autoFocus
          />
          <ErrorBox message={erro} />
          <PrimaryButton title="Salvar" onPress={salvar} loading={salvando} />
          <Pressable onPress={onFechar} hitSlop={8}>
            <Text style={styles.cancelar}>Cancelar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  pilula: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.tile,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
  },
  pilulaTexto: { fontSize: 16, color: colors.textMuted },
  negrito: { color: colors.text, fontWeight: '600' },
  lapis: { marginLeft: 10 },

  risco: { fontSize: 20, color: colors.textMuted, marginTop: 10, marginLeft: 14, marginBottom: 26 },
  areaSlider: { paddingHorizontal: 12 },
  influencia: { fontSize: 11, color: colors.text, textAlign: 'center', marginTop: 4 },
  linkQuestionario: { fontSize: 13, color: colors.link, textAlign: 'center', marginTop: 10, fontWeight: '600' },

  botoes: { marginTop: 48, gap: 14 },

  fundoModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
  },
  modalTitulo: { fontSize: 20, color: colors.title, textAlign: 'center' },
  modalTexto: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 6, marginBottom: 16 },
  cancelar: { textAlign: 'center', color: colors.text, marginTop: 14, fontSize: 15 },
});

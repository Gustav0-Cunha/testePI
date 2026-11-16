import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { authApi } from '../api/services';
import BackButton from '../components/BackButton';
import { PrimaryButton } from '../components/Buttons';
import ErrorBox from '../components/ErrorBox';
import Screen from '../components/Screen';
import ScreenTitle from '../components/ScreenTitle';
import TextField from '../components/TextField';
import { useFinance } from '../context/FinanceContext';
import { avisar } from '../utils/alerts';

export default function AlterarSenhaScreen() {
  const router = useRouter();
  const { perfil, atualizarPerfil } = useFinance();

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  const salvar = async () => {
    if (!senhaAtual) return setErro('Informe sua senha atual.');
    if (novaSenha.length < 6) return setErro('A nova senha precisa ter pelo menos 6 caracteres.');
    if (novaSenha !== confirmacao) return setErro('As senhas não conferem.');

    setErro(null);
    setSalvando(true);
    try {
      try {
        await authApi.login(perfil.email, senhaAtual);
      } catch {
        throw new Error('Senha atual incorreta.');
      }
      await atualizarPerfil({ senha: novaSenha });
      avisar('Senha alterada!', 'Use a nova senha no próximo login.');
      router.back();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Screen>
      <BackButton />
      <ScreenTitle>Alterar senha</ScreenTitle>

      <TextField label="Senha atual:" value={senhaAtual} onChangeText={setSenhaAtual} secure autoCapitalize="none" />
      <TextField label="Nova senha:" value={novaSenha} onChangeText={setNovaSenha} secure autoCapitalize="none" />
      <TextField
        label="Confirmar nova senha:"
        value={confirmacao}
        onChangeText={setConfirmacao}
        secure
        autoCapitalize="none"
      />

      <ErrorBox message={erro} />

      <PrimaryButton title="Salvar nova senha" onPress={salvar} loading={salvando} style={styles.botao} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  botao: { marginTop: 20 },
});

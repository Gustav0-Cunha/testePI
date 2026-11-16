import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { PrimaryButton } from '../components/Buttons';
import ErrorBox from '../components/ErrorBox';
import Logo from '../components/Logo';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { emailValido } from '../utils/format';

export default function CadastroScreen() {
  const router = useRouter();
  const { cadastrar } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const enviar = async () => {
    if (nome.trim().split(/\s+/).length < 2) return setErro('Informe seu nome completo.');
    if (!emailValido(email)) return setErro('Informe um e-mail válido.');
    if (senha.length < 6) return setErro('A senha precisa ter pelo menos 6 caracteres.');

    setErro(null);
    setCarregando(true);
    try {
      await cadastrar({ nome, email, senha });
    } catch (e) {
      setErro(e.message);
      setCarregando(false);
    }
  };

  const voltarParaLogin = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/login');
  };

  return (
    <Screen contentStyle={styles.conteudo}>
      <Logo />

      <TextField
        label="Nome Completo:"
        value={nome}
        onChangeText={setNome}
        autoCapitalize="words"
        textContentType="name"
        style={styles.primeiroCampo}
      />
      <TextField
        label="Email:"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextField
        label="Senha:"
        value={senha}
        onChangeText={setSenha}
        secure
        autoCapitalize="none"
        textContentType="newPassword"
      />

      <ErrorBox message={erro} />

      <PrimaryButton title="Cadastrar" onPress={enviar} loading={carregando} style={styles.botao} />

      <Pressable onPress={voltarParaLogin} hitSlop={8}>
        <Text style={styles.voltar}>Voltar a tela de login</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  conteudo: { paddingTop: 48 },
  primeiroCampo: { marginTop: 48 },
  botao: { marginTop: 8, minWidth: '50%' },
  voltar: { textAlign: 'center', fontSize: 16, color: colors.text, marginTop: 12 },
});

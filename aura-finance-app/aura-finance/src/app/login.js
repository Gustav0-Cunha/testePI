import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { PrimaryButton } from '../components/Buttons';
import ErrorBox from '../components/ErrorBox';
import Logo from '../components/Logo';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { avisar } from '../utils/alerts';

export default function LoginScreen() {
  const { entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const fazerLogin = async () => {
    const valor = email.trim();
    if (!valor || !senha) return setErro('Preencha e-mail e senha.');

    if (!valor.includes('@')) {
      return setErro('No momento o login é feito pelo e-mail cadastrado.');
    }

    setErro(null);
    setCarregando(true);
    try {
      await entrar(valor, senha);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Screen contentStyle={styles.conteudo}>
      <Logo />

      <TextField
        label="Email:"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="username"
        style={styles.primeiroCampo}
      />
      <TextField
        label="Senha:"
        value={senha}
        onChangeText={setSenha}
        secure
        autoCapitalize="none"
        textContentType="password"
        onSubmitEditing={fazerLogin}
        returnKeyType="go"
      />

      <ErrorBox message={erro} />

      <PrimaryButton title="Entrar" onPress={fazerLogin} loading={carregando} style={styles.botao} />

      <Pressable
        onPress={() => avisar('Esqueci minha senha', 'Entre em contato com o suporte do AURA finance para redefinir sua senha.')}
        hitSlop={8}
      >
        <Text style={styles.esqueci}>Esqueci minha senha?</Text>
      </Pressable>

      <Text style={styles.cadastro}>
        Não tenho conta?{' '}
        <Link href="/cadastro" style={styles.link}>
          cadastre-se
        </Link>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  conteudo: { paddingTop: 48 },
  primeiroCampo: { marginTop: 56 },
  botao: { marginTop: 18, minWidth: '50%' },
  esqueci: { textAlign: 'center', fontSize: 16, color: colors.text, marginTop: 28 },
  cadastro: { textAlign: 'center', fontSize: 16, color: colors.text, marginTop: 24 },
  link: { color: colors.link, fontWeight: '700' },
});

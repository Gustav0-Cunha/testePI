import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import Logo from '../components/Logo';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { FinanceProvider } from '../context/FinanceContext';
import { colors } from '../theme/colors';

export default function RootLayout() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <StatusBar style="dark" />
        <Rotas />
      </FinanceProvider>
    </AuthProvider>
  );
}

function Rotas() {
  const { logado, carregando } = useAuth();

  if (carregando) {
    return (
      <View style={styles.carregando}>
        <Logo />
        <ActivityIndicator color={colors.navy} style={styles.spinner} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Protected guard={!logado}>
        <Stack.Screen name="login" />
        <Stack.Screen name="cadastro" />
      </Stack.Protected>

      <Stack.Protected guard={logado}>
        <Stack.Screen name="index" />
        <Stack.Screen name="nova-despesa" />
        <Stack.Screen name="nova-receita" />
        <Stack.Screen name="categorias" />
        <Stack.Screen name="extrato" />
        <Stack.Screen name="perfil" />
        <Stack.Screen name="alterar-senha" />
        <Stack.Screen name="questionario" />
        <Stack.Screen name="investimentos" />
        <Stack.Screen name="simular" />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  carregando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  spinner: { marginTop: 24 },
});

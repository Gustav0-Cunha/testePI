import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../theme/colors';

export default function BackButton() {
  const router = useRouter();

  const voltar = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <Pressable onPress={voltar} hitSlop={12} style={styles.botao} accessibilityRole="button">
      <Ionicons name="arrow-back" size={14} color={colors.text} />
      <Text style={styles.texto}>Voltar</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingVertical: 12,
  },
  texto: { fontSize: 13, color: colors.text },
});

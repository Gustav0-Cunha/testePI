import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

export default function ErrorBox({ message, onRetry, style }) {
  if (!message) return null;
  return (
    <View style={[styles.caixa, style]}>
      <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
      <View style={styles.textos}>
        <Text style={styles.texto}>{message}</Text>
        {onRetry ? (
          <Pressable onPress={onRetry} hitSlop={8}>
            <Text style={styles.retry}>Tentar novamente</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.dangerBg,
    marginBottom: 14,
  },
  textos: { flex: 1 },
  texto: { color: colors.danger, fontSize: 13 },
  retry: { color: colors.danger, fontSize: 13, fontWeight: '700', marginTop: 6 },
});

import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../theme/colors';

export function PrimaryButton({ title, onPress, loading = false, disabled = false, style }) {
  const bloqueado = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={bloqueado}
      accessibilityRole="button"
      style={({ pressed }) => [styles.primario, (pressed || bloqueado) && styles.apertado, style]}
    >
      {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.textoPrimario}>{title}</Text>}
    </Pressable>
  );
}

export function OutlineButton({ title, onPress, loading = false, style, textStyle, children }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      style={({ pressed }) => [styles.outline, pressed && styles.apertado, style]}
    >
      {loading ? (
        <ActivityIndicator color={colors.outline} />
      ) : (
        <Text style={[styles.textoOutline, textStyle]}>
          {title}
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primario: {
    alignSelf: 'center',
    minWidth: '62%',
    minHeight: 46,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoPrimario: { color: colors.white, fontSize: 17 },
  outline: {
    alignSelf: 'center',
    width: '78%',
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoOutline: { color: colors.title, fontSize: 16, fontWeight: '700' },
  apertado: { opacity: 0.7 },
});

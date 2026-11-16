import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

export default function ScreenTitle({ children, subtitle }) {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{children}</Text>
      {subtitle ? <Text style={styles.subtitulo}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  titulo: {
    fontSize: 24,
    color: colors.title,
    textAlign: 'center',
  },
  subtitulo: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

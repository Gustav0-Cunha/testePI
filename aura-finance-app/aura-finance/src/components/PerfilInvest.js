import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

const POSICAO = { CONSERVADOR: 0, MODERADO: 0.5, ARROJADO: 1 };

export default function RiskSlider({ perfilRisco, respondido = true }) {
  const posicao = POSICAO[perfilRisco] ?? 0.5;

  return (
    <View style={[styles.container, !respondido && styles.apagado]}>
      <View style={styles.trilho}>
        <View style={[styles.preenchido, { width: `${posicao * 100}%` }]} />
        <View style={[styles.bolinha, { left: `${posicao * 100}%` }]} />
      </View>
      <View style={styles.rotulos}>
        <Text style={styles.rotulo}>Conservador</Text>
        <Text style={styles.rotulo}>moderado</Text>
        <Text style={styles.rotulo}>Arrojado</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 8 },
  apagado: { opacity: 0.4 },
  trilho: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E2E2',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  preenchido: {
    position: 'absolute',
    left: 0,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.navy,
  },
  bolinha: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    marginLeft: -9,
    backgroundColor: colors.navy,
  },
  rotulos: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  rotulo: { fontSize: 12, color: colors.textMuted },
});

import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '../theme/colors';

function arco(cx, cy, r) {
  return `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
}

export default function Logo({ size = 1 }) {
  return (
    <View style={[styles.capsula, { width: 120 * size, height: 160 * size, borderRadius: 60 * size }]}>
      <Svg width={76 * size} height={42 * size} viewBox="0 0 76 42">
        <Path d={arco(38, 38, 33)} stroke="#2568A9" strokeWidth={5} fill="none" strokeLinecap="round" />
        <Path d={arco(38, 38, 24)} stroke="#5AA0DB" strokeWidth={5} fill="none" strokeLinecap="round" />
        <Path d={arco(38, 38, 15)} stroke="#6AB023" strokeWidth={5} fill="none" strokeLinecap="round" />
      </Svg>
      <Text style={[styles.aura, { fontSize: 20 * size, marginTop: 22 * size }]}>AURA</Text>
      <Text style={[styles.finance, { fontSize: 9 * size }]}>finance</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  capsula: {
    alignSelf: 'center',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aura: { color: colors.title, letterSpacing: 0.5 },
  finance: { color: colors.textMuted },
});

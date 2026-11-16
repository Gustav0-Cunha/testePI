import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

export default function ChipGroup({ options, value, onChange, style }) {
  return (
    <View style={[styles.grupo, style]}>
      {options.map((opcao) => {
        const valor = typeof opcao === 'string' ? opcao : opcao.value;
        const rotulo = typeof opcao === 'string' ? opcao : opcao.label;
        const selecionado = valor === value;
        return (
          <Pressable
            key={valor}
            onPress={() => onChange(valor)}
            accessibilityRole="button"
            accessibilityState={{ selected: selecionado }}
            style={[styles.chip, selecionado && styles.chipSelecionado]}
          >
            <Text style={[styles.texto, selecionado && styles.textoSelecionado]}>{rotulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: colors.tile,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipSelecionado: { backgroundColor: colors.chipSelected },
  texto: { fontSize: 14, color: colors.text },
  textoSelecionado: { color: colors.white },
});

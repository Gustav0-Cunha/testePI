import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../theme/colors';

export default function TextField({ label, secure = false, style, ...props }) {
  const [oculto, setOculto] = useState(secure);

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.caixa}>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={oculto}
          autoCorrect={false}
          {...props}
        />
        {secure ? (
          <Pressable onPress={() => setOculto(!oculto)} hitSlop={10} style={styles.olho}>
            <Ionicons name={oculto ? 'eye-outline' : 'eye-off-outline'} size={18} color={colors.navy} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { fontSize: 13, color: colors.text, marginBottom: 4 },
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    borderWidth: 1.5,
    borderRadius: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: colors.text,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : null),
  },
  olho: { paddingHorizontal: 10 },
});

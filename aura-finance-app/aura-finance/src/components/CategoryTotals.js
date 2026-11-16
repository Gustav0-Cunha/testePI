import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { formatarMoeda } from '../utils/format';

const TODAS = null;

export function formatarPercentual(percentual) {
  const valor = percentual * 100;
  const texto = valor >= 10 || Number.isInteger(valor) ? Math.round(valor).toString() : valor.toFixed(1).replace('.', ',');
  return `${texto} %`;
}

export default function CategoryTotals({ dados, categoria, onChangeCategoria }) {
  const [aberto, setAberto] = useState(false);

  const totalGeral = dados.reduce((soma, item) => soma + item.total, 0);
  const selecionada = dados.find((item) => item.categoria === categoria) ?? null;
  const total = selecionada ? selecionada.total : totalGeral;
  const percentual = selecionada ? selecionada.percentual : 1;

  const escolher = (valor) => {
    onChangeCategoria(valor);
    setAberto(false);
  };

  return (
    <View>
      <View style={styles.linha}>
        <View style={styles.colunaValores}>
          <View style={styles.caixaTotal}>
            <Text style={styles.textoTotal} numberOfLines={1} adjustsFontSizeToFit>
              Total: {formatarMoeda(total)}
            </Text>
          </View>
          <View style={styles.caixaPercentual}>
            <Text style={styles.textoPercentual}>% do total: {formatarPercentual(percentual)}</Text>
          </View>
        </View>

        <Pressable
          onPress={() => setAberto((v) => !v)}
          style={({ pressed }) => [styles.botaoCategoria, pressed && styles.apertado]}
          accessibilityRole="button"
          accessibilityState={{ expanded: aberto }}
        >
          {selecionada ? <View style={[styles.bolinha, { backgroundColor: selecionada.cor }]} /> : null}
          <Text style={styles.textoCategoria} numberOfLines={1}>
            {selecionada ? selecionada.categoria : 'Categoria'}
          </Text>
          <Ionicons name={aberto ? 'chevron-up' : 'chevron-down'} size={14} color={colors.white} />
        </Pressable>
      </View>

      {aberto ? (
        <View style={styles.menu}>
          <OpcaoMenu rotulo="Todas" percentual={1} ativa={categoria === TODAS} onPress={() => escolher(TODAS)} />
          {dados.map((item) => (
            <OpcaoMenu
              key={item.categoria}
              rotulo={item.categoria}
              cor={item.cor}
              percentual={item.percentual}
              ativa={item.categoria === categoria}
              onPress={() => escolher(item.categoria)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function OpcaoMenu({ rotulo, cor, percentual, ativa, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.opcao, ativa && styles.opcaoAtiva, pressed && styles.apertado]}
      accessibilityRole="button"
      accessibilityState={{ selected: ativa }}
    >
      <View style={[styles.bolinha, { backgroundColor: cor ?? colors.tile }]} />
      <Text style={[styles.opcaoTexto, ativa && styles.opcaoTextoAtivo]}>{rotulo}</Text>
      <Text style={[styles.opcaoPercentual, ativa && styles.opcaoTextoAtivo]}>{formatarPercentual(percentual)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  colunaValores: { flex: 1.6, gap: 8 },

  caixaTotal: {
    backgroundColor: colors.navy,
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  textoTotal: { color: colors.white, fontSize: 20 },
  caixaPercentual: {
    backgroundColor: colors.navy,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  textoPercentual: { color: colors.white, fontSize: 15 },

  botaoCategoria: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.title,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  textoCategoria: { color: colors.white, fontSize: 15, flexShrink: 1 },

  menu: {
    marginTop: 10,
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.tile,
  },
  opcao: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12 },
  opcaoAtiva: { backgroundColor: colors.navy },
  opcaoTexto: { flex: 1, fontSize: 15, color: colors.text },
  opcaoPercentual: { fontSize: 14, color: colors.textMuted },
  opcaoTextoAtivo: { color: colors.white },
  bolinha: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },

  apertado: { opacity: 0.75 },
});

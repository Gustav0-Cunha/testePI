import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { useFinance } from '../context/FinanceContext';
import { colors } from '../theme/colors';
import { avisar } from '../utils/alerts';
import { hojeISO, mascararMoeda, moedaParaNumero } from '../utils/format';
import BackButton from './BackButton';
import { PrimaryButton } from './Buttons';
import ChipGroup from './ChipGroup';
import ErrorBox from './ErrorBox';
import Screen from './Screen';
import ScreenTitle from './ScreenTitle';
import TextField from './TextField';

export default function TransactionForm({
  tipo,
  titulo,
  placeholderDescricao,
  categorias,
  textoBotao,
  legenda,
  children,
}) {
  const router = useRouter();
  const { adicionarTransacao } = useFinance();

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  const salvar = async () => {
    const valorNumero = moedaParaNumero(valor);
    if (!descricao.trim()) return setErro('Informe uma descrição.');
    if (valorNumero <= 0) return setErro('Informe um valor maior que zero.');
    if (!categoria) return setErro('Escolha uma categoria.');

    setErro(null);
    setSalvando(true);
    try {
      await adicionarTransacao({
        descricao: descricao.trim(),
        valor: valorNumero,
        categoria,
        tipo,
        dataCriacao: hojeISO(),
      });
      avisar(tipo === 'DESPESA' ? 'Despesa salva!' : 'Receita salva!');
      router.back();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Screen>
      <BackButton />
      <ScreenTitle>{titulo}</ScreenTitle>

      <TextField
        label="Descrição:"
        placeholder={placeholderDescricao}
        value={descricao}
        onChangeText={setDescricao}
        maxLength={255}
        style={styles.campo}
      />
      <TextField
        label="Valor:"
        placeholder="0,00"
        keyboardType="numeric"
        value={valor}
        onChangeText={(texto) => setValor(mascararMoeda(texto))}
        style={styles.campo}
      />

      <Text style={styles.label}>Categoria</Text>
      <ChipGroup options={categorias} value={categoria} onChange={setCategoria} />

      <ErrorBox message={erro} style={styles.erro} />

      <PrimaryButton title={textoBotao} onPress={salvar} loading={salvando} style={styles.botao} />
      <Text style={styles.legenda}>{legenda}</Text>

      {children}
    </Screen>
  );
}

const styles = StyleSheet.create({
  campo: { marginTop: 10 },
  label: { fontSize: 15, color: colors.textMuted, marginTop: 6, marginBottom: 8 },
  erro: { marginTop: 18, marginBottom: 0 },
  botao: { marginTop: 36 },
  legenda: { textAlign: 'center', color: colors.textMuted, fontSize: 13, marginTop: 12 },
});

import TransactionForm from '../components/TransactionForm';
import { CATEGORIAS_DESPESA } from '../constants/categorias';

export default function NovaDespesaScreen() {
  return (
    <TransactionForm
      tipo="DESPESA"
      titulo="Nova Despesa"
      placeholderDescricao="ex: mercado do mês"
      categorias={CATEGORIAS_DESPESA}
      textoBotao="Salvar Despesa"
      legenda="Atualiza o extrato e o gráfico de categorias"
    />
  );
}

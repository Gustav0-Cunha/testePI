export const CATEGORIAS_DESPESA = ['Mercado', 'Lazer', 'Transporte', 'Outros'];

export const CATEGORIAS_RECEITA = ['Salário', 'Extra', 'Rendimentos', 'Outros'];

export const CATEGORIA_INVESTIMENTO = 'Investimentos';

const ESTILO_CATEGORIA = {
  Mercado: { cor: '#639922', icone: 'cart' },
  Lazer: { cor: '#E24B4A', icone: 'game-controller' },
  Transporte: { cor: '#BA7517', icone: 'car' },
  Outros: { cor: '#185FA5', icone: 'ellipsis-horizontal' },
  Salário: { cor: '#2E7D32', icone: 'briefcase' },
  Extra: { cor: '#00897B', icone: 'add-circle' },
  Rendimentos: { cor: '#6A1B9A', icone: 'trending-up' },
  Investimentos: { cor: '#3949AB', icone: 'stats-chart' },
};

const CORES_EXTRAS = ['#8E44AD', '#16A085', '#D35400', '#2C3E50', '#C0392B', '#7F8C8D'];

export function estiloDaCategoria(categoria, indice = 0) {
  return (
    ESTILO_CATEGORIA[categoria] ?? {
      cor: CORES_EXTRAS[indice % CORES_EXTRAS.length],
      icone: 'pricetag',
    }
  );
}

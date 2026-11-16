package projeto.integrador.backendfelipeco.dtos.investimento;

import projeto.integrador.backendfelipeco.Entidades.enums.PerfilRisco;

public record ProdutoInvestimentoDTO(
    String codigo,
    String nome,
    String descricao,
    PerfilRisco perfilRisco,
    String indexador,
    Double percentualIndexador,
    Double taxaAnualIlustrativa) {
}

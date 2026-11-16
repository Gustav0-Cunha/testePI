package projeto.integrador.backendfelipeco.dtos.investimento;

import projeto.integrador.backendfelipeco.Entidades.enums.PerfilRisco;

public record SimulacaoInvestimentoResponseDTO(
    String produtoCodigo,
    String produtoNome,
    PerfilRisco perfilRisco,
    Double valorInicial,
    Double aporteMensal,
    Integer prazoMeses,
    Double taxaAnualAplicada,
    Double valorFinalEstimado,
    Double rendimentoEstimado,
    String observacao) {
}

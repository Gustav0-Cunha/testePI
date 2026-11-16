package projeto.integrador.backendfelipeco.dtos.investimento;

public record SimulacaoInvestimentoRequestDTO(
    String produtoCodigo,
    Double valorInicial,
    Double aporteMensal,
    Integer prazoMeses) {
}

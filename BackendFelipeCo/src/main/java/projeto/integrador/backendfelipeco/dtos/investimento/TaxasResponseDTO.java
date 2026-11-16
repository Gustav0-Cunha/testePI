package projeto.integrador.backendfelipeco.dtos.investimento;

public record TaxasResponseDTO(
    Double selic,
    Double cdi,
    Double selicDiaria,
    Double cdiDiaria,
    Double fatorDiario,
    String dataReferencia) {
}

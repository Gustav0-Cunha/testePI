package projeto.integrador.backendfelipeco.dtos.hgBrasil;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TaxaResultDTO(
        Double selic,
        Double cdi,
        @JsonProperty("selic_daily") Double selicDiaria,
        @JsonProperty("cdi_daily") Double cdiDiaria,
        @JsonProperty("daily_factor") Double fatorDiario,
        String date) {
}

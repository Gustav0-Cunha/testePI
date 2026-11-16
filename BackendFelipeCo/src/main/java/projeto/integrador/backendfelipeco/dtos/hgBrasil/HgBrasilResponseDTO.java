package projeto.integrador.backendfelipeco.dtos.hgBrasil;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record HgBrasilResponseDTO(
        @JsonProperty("valid_key") Boolean chaveValida,
        List<TaxaResultDTO> results) {
}

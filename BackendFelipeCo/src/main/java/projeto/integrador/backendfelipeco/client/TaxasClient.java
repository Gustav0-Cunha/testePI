package projeto.integrador.backendfelipeco.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import projeto.integrador.backendfelipeco.dtos.hgBrasil.HgBrasilResponseDTO;

@FeignClient(name = "hgBrasilTaxas", url = "https://api.hgbrasil.com")
public interface TaxasClient {

    @GetMapping("/finance/taxes")
    HgBrasilResponseDTO buscarTaxas(@RequestParam("key") String apiKey);
}

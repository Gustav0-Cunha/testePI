package projeto.integrador.backendfelipeco.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import projeto.integrador.backendfelipeco.dtos.investimento.ProdutoInvestimentoDTO;
import projeto.integrador.backendfelipeco.dtos.investimento.SimulacaoInvestimentoRequestDTO;
import projeto.integrador.backendfelipeco.dtos.investimento.SimulacaoInvestimentoResponseDTO;
import projeto.integrador.backendfelipeco.dtos.investimento.TaxasResponseDTO;
import projeto.integrador.backendfelipeco.service.SimuladorInvestimentoService;

@RestController
@RequestMapping("/api/investimentos")
public class InvestimentosController {

    private final SimuladorInvestimentoService simuladorInvestimentoService;

    public InvestimentosController(SimuladorInvestimentoService simuladorInvestimentoService) {
        this.simuladorInvestimentoService = simuladorInvestimentoService;
    }

    @GetMapping("/taxas")
    public ResponseEntity<TaxasResponseDTO> buscarTaxasAtuais() {
        return ResponseEntity.ok(simuladorInvestimentoService.buscarTaxasAtuais());
    }

    @GetMapping("/opcoes")
    public ResponseEntity<List<ProdutoInvestimentoDTO>> listarOpcoes(Principal principal) {
        return ResponseEntity.ok(simuladorInvestimentoService.listarOpcoes(principal.getName()));
    }

    @PostMapping("/simular")
    public ResponseEntity<SimulacaoInvestimentoResponseDTO> simular(
            @RequestBody SimulacaoInvestimentoRequestDTO request,
            Principal principal) {
        return ResponseEntity.ok(simuladorInvestimentoService.simular(principal.getName(), request));
    }
}

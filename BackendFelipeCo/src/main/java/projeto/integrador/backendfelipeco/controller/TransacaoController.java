package projeto.integrador.backendfelipeco.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import projeto.integrador.backendfelipeco.Entidades.Transacao;
import projeto.integrador.backendfelipeco.dtos.transacaoDTO.TransacaoResponseDTO;
import projeto.integrador.backendfelipeco.service.TransacaoService;

@RestController
@RequestMapping("/api/transacoes")
public class TransacaoController {


    private final TransacaoService transacaoService;

    public TransacaoController(TransacaoService transacaoService) {
        this.transacaoService = transacaoService;
    }


    @PostMapping
    public ResponseEntity<TransacaoResponseDTO> registrar(@RequestBody Transacao dto, Principal principal) {

        String emailLogado = principal.getName();

        TransacaoResponseDTO response = transacaoService.salvar(dto, emailLogado);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<TransacaoResponseDTO>> listarExtrato(Principal principal) {
        String emailLogado= principal.getName();
        List<TransacaoResponseDTO> extrato = transacaoService.buscarTodasDoCliente(emailLogado);
        return ResponseEntity.ok(extrato);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransacaoResponseDTO> buscarPorId(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(transacaoService.buscarPorId(id, principal.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransacaoResponseDTO> atualizar(@PathVariable Long id, @RequestBody Transacao dto, Principal principal) {
        String emailLogado = principal.getName();
        TransacaoResponseDTO response = transacaoService.atualizar(id, dto, emailLogado);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id,Principal principal) {
        String emailLogado = principal.getName();
        transacaoService.deletar(id,emailLogado);
        return ResponseEntity.noContent().build();
    }
}
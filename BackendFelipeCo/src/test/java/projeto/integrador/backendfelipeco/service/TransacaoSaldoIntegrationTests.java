package projeto.integrador.backendfelipeco.service;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import projeto.integrador.backendfelipeco.Entidades.Cliente;
import projeto.integrador.backendfelipeco.Entidades.Transacao;
import projeto.integrador.backendfelipeco.Entidades.enums.TipoTransacao;
import projeto.integrador.backendfelipeco.repository.ClienteRepository;

@SpringBootTest
@Transactional
class TransacaoSaldoIntegrationTests {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private TransacaoService transacaoService;

    @Test
    void excluirReceitaDeixaSaldoZeroMesmoQuandoSaldoPersistidoEstaDesatualizado() {
        Cliente cliente = new Cliente();
        cliente.setNome("Cliente de teste");
        cliente.setEmail("saldo-transacao@example.com");
        cliente.setSenha("senha");
        cliente = clienteRepository.save(cliente);

        Transacao receita = new Transacao();
        receita.setDescricao("Extra");
        receita.setValor(new BigDecimal("100.00"));
        receita.setDataCriacao(LocalDate.now());
        receita.setTipo(TipoTransacao.RECEITA);
        receita.setCategoria("Extra");

        Long transacaoId = transacaoService.salvar(receita, cliente.getEmail()).getId();
        cliente = clienteRepository.findByEmail(cliente.getEmail()).orElseThrow();
        assertEquals(new BigDecimal("100.00"), cliente.getSaldoAtual());

        cliente.setSaldoAtual(BigDecimal.ZERO);
        clienteRepository.save(cliente);

        transacaoService.deletar(transacaoId, cliente.getEmail());

        cliente = clienteRepository.findByEmail(cliente.getEmail()).orElseThrow();
        assertEquals(BigDecimal.ZERO, cliente.getSaldoAtual());
    }
}

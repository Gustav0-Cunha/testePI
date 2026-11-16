package projeto.integrador.backendfelipeco.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import projeto.integrador.backendfelipeco.Entidades.Cliente;
import projeto.integrador.backendfelipeco.Entidades.Transacao;
import projeto.integrador.backendfelipeco.Entidades.enums.TipoTransacao;
import projeto.integrador.backendfelipeco.repository.ClienteRepository;
import projeto.integrador.backendfelipeco.repository.TransacaoRepository;

class TransacaoServiceTests {

    private static final String EMAIL = "cliente@example.com";
    private static final Long CLIENTE_ID = 1L;
    private static final Long TRANSACAO_ID = 10L;

    private Cliente cliente;
    private List<Transacao> transacoes;
    private TransacaoService service;

    @BeforeEach
    void setUp() {
        cliente = new Cliente();
        cliente.setId(CLIENTE_ID);
        cliente.setEmail(EMAIL);
        cliente.setSaldoAtual(BigDecimal.ZERO);
        transacoes = new ArrayList<>();

        ClienteRepository clienteRepository = mock(ClienteRepository.class);
        TransacaoRepository transacaoRepository = mock(TransacaoRepository.class);
        when(clienteRepository.findByEmail(EMAIL)).thenReturn(Optional.of(cliente));
        when(clienteRepository.save(any(Cliente.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(transacaoRepository.save(any(Transacao.class))).thenAnswer(invocation -> {
            Transacao transacao = invocation.getArgument(0);
            transacao.setId(TRANSACAO_ID);
            transacoes.add(transacao);
            return transacao;
        });
        when(transacaoRepository.findByClienteIdOrderByDataCriacaoDesc(CLIENTE_ID))
                .thenAnswer(invocation -> List.copyOf(transacoes));
        when(transacaoRepository.findById(TRANSACAO_ID)).thenAnswer(invocation -> transacoes.stream().findFirst());
        doAnswer(invocation -> {
            transacoes.remove(invocation.getArgument(0));
            return null;
        }).when(transacaoRepository).delete(any(Transacao.class));

        service = new TransacaoService(transacaoRepository, clienteRepository);
    }

    @Test
    void adicionarEExcluirReceitaMantemSaldoZeroMesmoSeSaldoSalvoEstiverDesatualizado() {
        Transacao receita = new Transacao();
        receita.setDescricao("Extra");
        receita.setValor(new BigDecimal("100.00"));
        receita.setDataCriacao(LocalDate.now());
        receita.setTipo(TipoTransacao.RECEITA);
        receita.setCategoria("Extra");

        service.salvar(receita, EMAIL);
        assertEquals(new BigDecimal("100.00"), cliente.getSaldoAtual());

        cliente.setSaldoAtual(BigDecimal.ZERO);
        service.deletar(TRANSACAO_ID, EMAIL);

        assertEquals(BigDecimal.ZERO, cliente.getSaldoAtual());
    }
}

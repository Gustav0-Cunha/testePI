package projeto.integrador.backendfelipeco.service;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import projeto.integrador.backendfelipeco.Entidades.Cliente;
import projeto.integrador.backendfelipeco.Entidades.enums.PerfilRisco;
import projeto.integrador.backendfelipeco.client.TaxasClient;
import projeto.integrador.backendfelipeco.dtos.hgBrasil.HgBrasilResponseDTO;
import projeto.integrador.backendfelipeco.dtos.hgBrasil.TaxaResultDTO;
import projeto.integrador.backendfelipeco.dtos.investimento.ProdutoInvestimentoDTO;
import projeto.integrador.backendfelipeco.dtos.investimento.SimulacaoInvestimentoRequestDTO;
import projeto.integrador.backendfelipeco.dtos.investimento.SimulacaoInvestimentoResponseDTO;
import projeto.integrador.backendfelipeco.dtos.investimento.TaxasResponseDTO;
import projeto.integrador.backendfelipeco.exceptions.RegraNegocioException;
import projeto.integrador.backendfelipeco.repository.ClienteRepository;

class SimuladorInvestimentoServiceTests {

    private static final String EMAIL = "investidor@example.com";

    private Cliente cliente;
    private TaxasClient taxasClient;
    private SimuladorInvestimentoService service;

    @BeforeEach
    void setUp() {
        taxasClient = mock(TaxasClient.class);
        ClienteRepository clienteRepository = mock(ClienteRepository.class);
        cliente = new Cliente();
        cliente.setEmail(EMAIL);
        cliente.setPerfilRisco(PerfilRisco.CONSERVADOR);
        cliente.setPontuacaoPerfilRisco(2);
        when(clienteRepository.findByEmail(EMAIL)).thenReturn(Optional.of(cliente));
        service = new SimuladorInvestimentoService(taxasClient, clienteRepository, "test-key");
    }

    @Test
    void retornaDuasOpcoesDoPerfilAutenticado() {
        List<ProdutoInvestimentoDTO> opcoes = service.listarOpcoes(EMAIL);

        assertEquals(2, opcoes.size());
        opcoes.forEach(opcao -> assertEquals(PerfilRisco.CONSERVADOR, opcao.perfilRisco()));
    }

    @Test
    void perfilModeradoPodeListarProdutosConservadoresEModerados() {
        cliente.setPerfilRisco(PerfilRisco.MODERADO);

        List<ProdutoInvestimentoDTO> opcoes = service.listarOpcoes(EMAIL);

        assertEquals(4, opcoes.size());
        assertTrue(opcoes.stream().anyMatch(opcao -> opcao.perfilRisco() == PerfilRisco.CONSERVADOR));
        assertTrue(opcoes.stream().anyMatch(opcao -> opcao.perfilRisco() == PerfilRisco.MODERADO));
        assertTrue(opcoes.stream().noneMatch(opcao -> opcao.perfilRisco() == PerfilRisco.ARROJADO));
    }

    @Test
    void perfilArrojadoPodeListarTodosOsProdutos() {
        cliente.setPerfilRisco(PerfilRisco.ARROJADO);

        assertEquals(6, service.listarOpcoes(EMAIL).size());
    }

    @Test
    void bloqueiaProdutoDeOutroPerfil() {
        SimulacaoInvestimentoRequestDTO request = request("ETF_IBOVESPA", "1000", 12);

        assertThrows(RegraNegocioException.class, () -> service.simular(EMAIL, request));
        verify(taxasClient, never()).buscarTaxas("test-key");
    }

    @Test
    void calculaCdbComTaxaCdiAnualEJurosCompostos() {
        stubTaxas(10.0, 12.0, 0.03, 0.04, 1.0001);
        SimulacaoInvestimentoResponseDTO response = service.simular(
                EMAIL,
                request("CDB_100_CDI", "1000.00", 12));

        assertEquals(12.0, response.taxaAnualAplicada(), 0.0001);
        assertEquals(1120.0, response.valorFinalEstimado(), 0.0001);
        assertEquals(120.0, response.rendimentoEstimado(), 0.0001);
        verify(taxasClient).buscarTaxas("test-key");
    }

    @Test
    void perfilArrojadoPodeSimularProdutoConservador() {
        cliente.setPerfilRisco(PerfilRisco.ARROJADO);
        stubTaxas(10.0, 12.0, 0.03, 0.04, 1.0001);

        SimulacaoInvestimentoResponseDTO response = service.simular(
                EMAIL,
                request("CDB_100_CDI", "1000", 12));

        assertEquals("CDB_100_CDI", response.produtoCodigo());
        assertEquals(PerfilRisco.ARROJADO, response.perfilRisco());
    }

    @Test
    void retornaSelicCdiTaxasDiariasEFator() {
        stubTaxas(10.5, 10.4, 0.04, 0.04, 1.0004);

        TaxasResponseDTO response = service.buscarTaxasAtuais();

        assertEquals(10.5, response.selic());
        assertEquals(10.4, response.cdi());
        assertEquals(0.04, response.selicDiaria());
        assertEquals(0.04, response.cdiDiaria());
        assertEquals(1.0004, response.fatorDiario());
        assertEquals("2026-10-27", response.dataReferencia());
    }

    @Test
    void rejeitaSimulacaoSemRespostasDoQuestionario() {
        cliente.setPontuacaoPerfilRisco(null);

        assertThrows(RegraNegocioException.class,
                () -> service.simular(EMAIL, request("CDB_100_CDI", "1000", 12)));
    }

    @Test
    void rejeitaPrazoForaDoLimite() {
        assertThrows(RegraNegocioException.class,
                () -> service.simular(EMAIL, request("CDB_100_CDI", "1000", 601)));
    }

    private SimulacaoInvestimentoRequestDTO request(String produto, String valor, int prazo) {
        return new SimulacaoInvestimentoRequestDTO(produto, Double.valueOf(valor), null, prazo);
    }

    private void stubTaxas(double selic, double cdi, double selicDiaria, double cdiDiaria, double fatorDiario) {
        TaxaResultDTO result = new TaxaResultDTO(
                selic, cdi, selicDiaria, cdiDiaria, fatorDiario, "2026-10-27");
        HgBrasilResponseDTO response = new HgBrasilResponseDTO(true, List.of(result));
        when(taxasClient.buscarTaxas("test-key")).thenReturn(response);
    }
}

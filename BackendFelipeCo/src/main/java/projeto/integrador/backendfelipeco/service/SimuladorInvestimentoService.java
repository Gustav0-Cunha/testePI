package projeto.integrador.backendfelipeco.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import feign.FeignException;
import projeto.integrador.backendfelipeco.Entidades.Cliente;
import projeto.integrador.backendfelipeco.Entidades.enums.PerfilRisco;
import projeto.integrador.backendfelipeco.client.TaxasClient;
import projeto.integrador.backendfelipeco.dtos.hgBrasil.HgBrasilResponseDTO;
import projeto.integrador.backendfelipeco.dtos.hgBrasil.TaxaResultDTO;
import projeto.integrador.backendfelipeco.dtos.investimento.ProdutoInvestimentoDTO;
import projeto.integrador.backendfelipeco.dtos.investimento.SimulacaoInvestimentoRequestDTO;
import projeto.integrador.backendfelipeco.dtos.investimento.SimulacaoInvestimentoResponseDTO;
import projeto.integrador.backendfelipeco.dtos.investimento.TaxasResponseDTO;
import projeto.integrador.backendfelipeco.exceptions.RecursoNaoEncontradoException;
import projeto.integrador.backendfelipeco.exceptions.RegraNegocioException;
import projeto.integrador.backendfelipeco.exceptions.ServicoExternoIndisponivelException;
import projeto.integrador.backendfelipeco.repository.ClienteRepository;

@Service
public class SimuladorInvestimentoService {

    private static final String OBSERVACAO_SIMULACAO = "Projeção matemática ilustrativa, sem garantia de retorno; não inclui impostos, tarifas ou inflação. As taxas de ETF são premissas hipotéticas, não previsões.";

    private static final List<ProdutoInvestimentoDTO> PRODUTOS = List.of(
            new ProdutoInvestimentoDTO("TESOURO_SELIC", "Tesouro Selic", "Renda fixa pós-fixada referenciada à Selic.", PerfilRisco.CONSERVADOR, "SELIC", 100.0, null),
            new ProdutoInvestimentoDTO("CDB_100_CDI", "CDB 100% do CDI", "Cenário de renda fixa referenciado ao CDI.", PerfilRisco.CONSERVADOR, "CDI", 100.0, null),
            new ProdutoInvestimentoDTO("CDB_110_CDI", "CDB 110% do CDI", "Cenário de renda fixa referenciado ao CDI.", PerfilRisco.MODERADO, "CDI", 110.0, null),
            new ProdutoInvestimentoDTO("LCI_90_CDI", "LCI 90% do CDI", "Cenário ilustrativo referenciado ao CDI; regras e impostos não são calculados.", PerfilRisco.MODERADO, "CDI", 90.0, null),
            new ProdutoInvestimentoDTO("ETF_IBOVESPA", "ETF de ações brasileiras", "Premissa hipotética de 12% ao ano para simulação, sem relação com cotação atual.", PerfilRisco.ARROJADO, "ILUSTRATIVA", null, 12.0),
            new ProdutoInvestimentoDTO("ETF_GLOBAL", "ETF de ações globais", "Premissa hipotética de 14% ao ano para simulação, sem relação com cotação atual.", PerfilRisco.ARROJADO, "ILUSTRATIVA", null, 14.0)
    );

    private final TaxasClient taxasClient;
    private final ClienteRepository clienteRepository;
    private final String apiKey;

    public SimuladorInvestimentoService(
            TaxasClient taxasClient,
            ClienteRepository clienteRepository,
            @Value("${hgbrasil.api.key:}") String apiKey) {
        this.taxasClient = taxasClient;
        this.clienteRepository = clienteRepository;
        this.apiKey = apiKey;
    }

    public TaxasResponseDTO buscarTaxasAtuais() {
        TaxaResultDTO taxas = carregarTaxas();
        return new TaxasResponseDTO(taxas.selic(), taxas.cdi(), taxas.selicDiaria(),
                taxas.cdiDiaria(), taxas.fatorDiario(), taxas.date());
    }

    public List<ProdutoInvestimentoDTO> listarOpcoes(String emailCliente) {
        Cliente cliente = buscarCliente(emailCliente);
        validarPerfilCalculado(cliente);
        return PRODUTOS.stream()
            .filter(produto -> podeInvestir(cliente.getPerfilRisco(), produto.perfilRisco()))
            .toList();
    }

    public SimulacaoInvestimentoResponseDTO simular(
            String emailCliente,
            SimulacaoInvestimentoRequestDTO request) {
        if (request == null || request.produtoCodigo() == null || request.produtoCodigo().isBlank()) {
            throw new RegraNegocioException("Informe o produto de investimento.");
        }
        if (request.valorInicial() == null || request.valorInicial() <= 0) {
            throw new RegraNegocioException("O valor inicial deve ser maior que zero.");
        }
        if (request.aporteMensal() != null && request.aporteMensal() < 0) {
            throw new RegraNegocioException("O aporte mensal não pode ser negativo.");
        }
        if (request.prazoMeses() == null || request.prazoMeses() < 1 || request.prazoMeses() > 600) {
            throw new RegraNegocioException("O prazo deve ser de 1 a 600 meses.");
        }

        Cliente cliente = buscarCliente(emailCliente);
        validarPerfilCalculado(cliente);
        ProdutoInvestimentoDTO produto = PRODUTOS.stream()
                .filter(opcao -> opcao.codigo().equals(request.produtoCodigo()))
                .findFirst()
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto de investimento não encontrado"));

        if (!podeInvestir(cliente.getPerfilRisco(), produto.perfilRisco())) {
            throw new RegraNegocioException("O produto não está disponível para o perfil de risco do cliente.");
        }

        double taxaAnual = calcularTaxaAnual(produto);
        Double aporteInformado = request.aporteMensal();
        double aporteMensal = 0.0;
        if (aporteInformado != null) {
            aporteMensal = aporteInformado;
        }
        double valorFinal = calcularValorFinal(request.valorInicial(), aporteMensal, request.prazoMeses(), taxaAnual);
        double totalInvestido = request.valorInicial() + aporteMensal * request.prazoMeses();

        return new SimulacaoInvestimentoResponseDTO(
                produto.codigo(),
                produto.nome(),
                cliente.getPerfilRisco(),
                arredondar(request.valorInicial()),
                arredondar(aporteMensal),
                request.prazoMeses(),
                arredondar(taxaAnual, 4),
                valorFinal,
                arredondar(valorFinal - totalInvestido),
                OBSERVACAO_SIMULACAO);
    }

    private TaxaResultDTO carregarTaxas() {
        if (apiKey.isBlank()) {
            throw new ServicoExternoIndisponivelException("Configure a variável de ambiente HG_BRASIL_API_KEY.");
        }

        HgBrasilResponseDTO response;
        try {
            response = taxasClient.buscarTaxas(apiKey);
        } catch (FeignException exception) {
            throw new ServicoExternoIndisponivelException("Não foi possível consultar a API HG Brasil.");
        }

        if (response == null || Boolean.FALSE.equals(response.chaveValida())
            || response.results() == null || response.results().isEmpty()) {
            throw new ServicoExternoIndisponivelException("A API HG Brasil não retornou taxas.");
        }

        return response.results().get(0);
    }

    private Cliente buscarCliente(String emailCliente) {
        return clienteRepository.findByEmail(emailCliente)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente não encontrado"));
    }

    private void validarPerfilCalculado(Cliente cliente) {
        if (cliente.getPontuacaoPerfilRisco() == null) {
            throw new RegraNegocioException("Responda ao formulário de perfil de risco antes de investir.");
        }
    }

    private boolean podeInvestir(PerfilRisco perfilCliente, PerfilRisco perfilProduto) {
        if (perfilCliente == null || perfilProduto == null) {
            return false;
        }

        return switch (perfilCliente) {
            case CONSERVADOR -> perfilProduto == PerfilRisco.CONSERVADOR;
            case MODERADO -> perfilProduto != PerfilRisco.ARROJADO;
            case ARROJADO -> true;
        };
    }

    private double calcularTaxaAnual(ProdutoInvestimentoDTO produto) {
        if ("ILUSTRATIVA".equals(produto.indexador())) {
            return produto.taxaAnualIlustrativa();
        }

        TaxaResultDTO taxas = carregarTaxas();
        Double indice = "SELIC".equals(produto.indexador()) ? taxas.selic() : taxas.cdi();
        if (indice == null) {
            throw new ServicoExternoIndisponivelException("A HG Brasil não retornou o indexador necessário para este produto.");
        }
        return indice * produto.percentualIndexador() / 100.0;
    }

    private double calcularValorFinal(double inicial, double aporte, int meses, double taxaAnual) {
        double taxaMensal = Math.pow(1.0 + taxaAnual / 100.0, 1.0 / 12.0) - 1.0;
        double saldo = inicial;
        for (int mes = 0; mes < meses; mes++) {
            saldo += saldo * taxaMensal;
            saldo += aporte;
        }
        return arredondar(saldo);
    }

    private double arredondar(double valor) {
        return arredondar(valor, 2);
    }

    private double arredondar(double valor, int casas) {
        double multiplicador = Math.pow(10, casas);
        return Math.round(valor * multiplicador) / multiplicador;
    }
}

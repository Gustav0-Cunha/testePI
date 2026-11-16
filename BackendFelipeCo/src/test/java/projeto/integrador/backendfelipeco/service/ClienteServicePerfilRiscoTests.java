package projeto.integrador.backendfelipeco.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import org.springframework.security.crypto.password.PasswordEncoder;

import projeto.integrador.backendfelipeco.Entidades.Cliente;
import projeto.integrador.backendfelipeco.Entidades.enums.PerfilRisco;
import projeto.integrador.backendfelipeco.dtos.clienteDto.FormularioRiscoDTO;
import projeto.integrador.backendfelipeco.exceptions.RegraNegocioException;
import projeto.integrador.backendfelipeco.repository.ClienteRepository;

class ClienteServicePerfilRiscoTests {

    private Cliente cliente;
    private ClienteService clienteService;

    @BeforeEach
    void setUp() {
        ClienteRepository clienteRepository = mock(ClienteRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        cliente = new Cliente();
        cliente.setEmail("perfil@example.com");
        when(clienteRepository.findByEmail(cliente.getEmail())).thenReturn(Optional.of(cliente));
        when(clienteRepository.save(any(Cliente.class))).thenAnswer(invocation -> invocation.getArgument(0));
        clienteService = new ClienteService(clienteRepository, passwordEncoder);
    }

    @Test
    void pontuacaoBaixaDefinePerfilConservador() {
        clienteService.definirPerfilRisco(cliente.getEmail(), formulario(
            FormularioRiscoDTO.Horizonte.LONGO,
            FormularioRiscoDTO.ToleranciaPerda.MEDIA,
                FormularioRiscoDTO.NecessidadeLiquidez.ALTA,
                FormularioRiscoDTO.Experiencia.INICIANTE,
            FormularioRiscoDTO.ReacaoQueda.AGUARDAR));

        assertEquals(PerfilRisco.CONSERVADOR, cliente.getPerfilRisco());
        assertEquals(4, cliente.getPontuacaoPerfilRisco());
    }

    @Test
    void pontuacaoIntermediariaDefinePerfilModerado() {
        clienteService.definirPerfilRisco(cliente.getEmail(), formulario(
                FormularioRiscoDTO.Horizonte.MEDIO,
                FormularioRiscoDTO.ToleranciaPerda.ALTA,
                FormularioRiscoDTO.NecessidadeLiquidez.MEDIA,
                FormularioRiscoDTO.Experiencia.AVANCADO,
                FormularioRiscoDTO.ReacaoQueda.AGUARDAR));

        assertEquals(PerfilRisco.MODERADO, cliente.getPerfilRisco());
            assertEquals(7, cliente.getPontuacaoPerfilRisco());
    }

    @Test
    void pontuacaoAltaDefinePerfilArrojado() {
        clienteService.definirPerfilRisco(cliente.getEmail(), formulario(
                FormularioRiscoDTO.Horizonte.LONGO,
                FormularioRiscoDTO.ToleranciaPerda.ALTA,
                FormularioRiscoDTO.NecessidadeLiquidez.BAIXA,
                FormularioRiscoDTO.Experiencia.INTERMEDIARIO,
                FormularioRiscoDTO.ReacaoQueda.AGUARDAR));

        assertEquals(PerfilRisco.ARROJADO, cliente.getPerfilRisco());
            assertEquals(8, cliente.getPontuacaoPerfilRisco());
    }

    @Test
    void respostasIncompletasSaoRejeitadas() {
        assertThrows(RegraNegocioException.class,
                () -> clienteService.definirPerfilRisco(cliente.getEmail(), new FormularioRiscoDTO()));
    }

    private FormularioRiscoDTO formulario(
            FormularioRiscoDTO.Horizonte horizonte,
            FormularioRiscoDTO.ToleranciaPerda toleranciaPerda,
            FormularioRiscoDTO.NecessidadeLiquidez necessidadeLiquidez,
            FormularioRiscoDTO.Experiencia experiencia,
            FormularioRiscoDTO.ReacaoQueda reacaoQueda) {
        FormularioRiscoDTO formulario = new FormularioRiscoDTO();
        formulario.setHorizonte(horizonte);
        formulario.setToleranciaPerda(toleranciaPerda);
        formulario.setNecessidadeLiquidez(necessidadeLiquidez);
        formulario.setExperiencia(experiencia);
        formulario.setReacaoQueda(reacaoQueda);
        return formulario;
    }
}

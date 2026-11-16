package projeto.integrador.backendfelipeco.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import projeto.integrador.backendfelipeco.Entidades.Transacao;

public interface TransacaoRepository extends JpaRepository<Transacao, Long> {

    List<Transacao> findByClienteIdOrderByDataCriacaoDesc(Long clienteId);

    Optional<Transacao> findByIdAndClienteEmail(Long id, String email);


    @Query("SELECT t FROM Transacao t WHERE t.cliente.id = :clienteId AND MONTH(t.dataCriacao) = :mes AND YEAR(t.dataCriacao) = :ano")
    List<Transacao> buscarPorMesEAno(@Param("clienteId") Long clienteId, @Param("mes") int mes, @Param("ano") int ano);
}
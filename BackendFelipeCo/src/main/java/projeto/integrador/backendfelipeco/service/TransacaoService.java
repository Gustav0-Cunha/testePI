package projeto.integrador.backendfelipeco.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import projeto.integrador.backendfelipeco.Entidades.Cliente;
import projeto.integrador.backendfelipeco.Entidades.Transacao;
import projeto.integrador.backendfelipeco.Entidades.enums.TipoTransacao;
import projeto.integrador.backendfelipeco.dtos.transacaoDTO.TransacaoResponseDTO;
import projeto.integrador.backendfelipeco.exceptions.AcessoNegadoException;
import projeto.integrador.backendfelipeco.exceptions.RecursoNaoEncontradoException;
import projeto.integrador.backendfelipeco.repository.ClienteRepository;
import projeto.integrador.backendfelipeco.repository.TransacaoRepository;

    @Service
    public class TransacaoService {


        private final TransacaoRepository transacaoRepository;


        private final ClienteRepository clienteRepository;

        public TransacaoService(TransacaoRepository transacaoRepository, ClienteRepository clienteRepository) {
            this.transacaoRepository = transacaoRepository;
            this.clienteRepository = clienteRepository;
        }

        @Transactional
        public TransacaoResponseDTO salvar(Transacao transacao, String emailClienteLogado) {
            Cliente cliente = clienteRepository.findByEmail(emailClienteLogado)
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente com email " +  emailClienteLogado + " não encontrado"));

           cliente.adicionarTransacao(transacao);

            transacao = transacaoRepository.save(transacao);
            recalcularSaldo(cliente);

            return converterParaResponse(transacao);
        }

        public List<TransacaoResponseDTO> buscarTodasDoCliente(String emailClienteLogado) {
           Cliente cliente = clienteRepository.findByEmail(emailClienteLogado)
                   .orElseThrow(() -> new RecursoNaoEncontradoException("CLiente não encontrado"));
           return transacaoRepository.findByClienteIdOrderByDataCriacaoDesc(cliente.getId())
                   .stream()
                   .map(this::converterParaResponse)
                   .collect(Collectors.toList());
        }

            public TransacaoResponseDTO buscarPorId(Long id, String emailClienteLogado) {
                Transacao transacao = transacaoRepository.findByIdAndClienteEmail(id, emailClienteLogado)
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Transação não encontrada"));
                return converterParaResponse(transacao);
            }



        @Transactional
        public TransacaoResponseDTO atualizar(Long id, Transacao transacaoAtualizada, String emailClienteLogado) {
            Transacao transacaoAntiga = transacaoRepository.findById(id)
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Transação não encontrada"));

            Cliente cliente = transacaoAntiga.getCliente();

            if(!cliente.getEmail().equals(emailClienteLogado)){
                throw new AcessoNegadoException("Você não tem permissão para editar essa transação");
            }

transacaoAntiga.setDescricao(transacaoAtualizada.getDescricao());
transacaoAntiga.setValor(transacaoAtualizada.getValor());
transacaoAntiga.setDataCriacao(transacaoAtualizada.getDataCriacao());
transacaoAntiga.setTipo(transacaoAtualizada.getTipo());
transacaoAntiga.setCategoria(transacaoAtualizada.getCategoria());

            transacaoAntiga = transacaoRepository.save(transacaoAntiga);
            recalcularSaldo(cliente);

            return converterParaResponse(transacaoAntiga);
        }

        @Transactional
        public void deletar(Long trasacaoId, String emailClienteLogado ) {
            Transacao transacao = transacaoRepository.findById(trasacaoId)
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Transação não encontrada"));

            Cliente cliente = transacao.getCliente();

            if (!cliente.getEmail().equals(emailClienteLogado)) {
                throw new AcessoNegadoException("Você não tem permissão para deletar esta transação.");
            }

            cliente.getTransacoes().remove(transacao);
            transacaoRepository.delete(transacao);
            transacaoRepository.flush();
            recalcularSaldo(cliente);
        }


        private void recalcularSaldo(Cliente cliente) {
            BigDecimal saldo = transacaoRepository
                    .findByClienteIdOrderByDataCriacaoDesc(cliente.getId())
                    .stream()
                    .map(transacao -> transacao.getTipo() == TipoTransacao.RECEITA
                            ? transacao.getValor()
                            : transacao.getValor().negate())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            cliente.setSaldoAtual(saldo);
            clienteRepository.save(cliente);
        }


        private TransacaoResponseDTO converterParaResponse(Transacao entidade) {
            TransacaoResponseDTO dto = new TransacaoResponseDTO();
            dto.setId(entidade.getId());
            dto.setDescricao(entidade.getDescricao());
            dto.setValor(entidade.getValor());
            dto.setData(entidade.getDataCriacao());
            dto.setTipo(entidade.getTipo());
            dto.setCategoria(entidade.getCategoria());
            return dto;
        }
    }

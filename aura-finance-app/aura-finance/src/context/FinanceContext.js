import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { clienteApi, transacaoApi } from '../api/services';
import { useAuth } from './AuthContext';


const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const { token } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [dadosPerfil, dadosTransacoes] = await Promise.all([
        clienteApi.meuPerfil(),
        transacaoApi.listar(),
      ]);
      setPerfil(dadosPerfil);
      setTransacoes(dadosTransacoes ?? []);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      recarregar();
    } else {
      setPerfil(null);
      setTransacoes([]);
      setErro(null);
    }
  }, [token, recarregar]);

  const adicionarTransacao = useCallback(
    async (transacao) => {
      const criada = await transacaoApi.criar(transacao);
      await recarregar();
      return criada;
    },
    [recarregar],
  );

  const removerTransacao = useCallback(
    async (id) => {
      await transacaoApi.remover(id);
      await recarregar();
    },
    [recarregar],
  );

  const atualizarPerfil = useCallback(async (dados) => {
    const atualizado = await clienteApi.atualizar(dados);
    setPerfil(atualizado);
    return atualizado;
  }, []);

  const responderQuestionario = useCallback(async (formulario) => {
    const atualizado = await clienteApi.definirPerfilRisco(formulario);
    setPerfil(atualizado);
    return atualizado;
  }, []);

  const valor = useMemo(
    () => ({
      perfil,
      transacoes,
      carregando,
      erro,
      recarregar,
      adicionarTransacao,
      removerTransacao,
      atualizarPerfil,
      responderQuestionario,
    }),
    [perfil, transacoes, carregando, erro, recarregar, adicionarTransacao, removerTransacao, atualizarPerfil, responderQuestionario],
  );

  return <FinanceContext.Provider value={valor}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const contexto = useContext(FinanceContext);
  if (!contexto) throw new Error('useFinance precisa estar dentro de <FinanceProvider>');
  return contexto;
}

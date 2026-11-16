import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { definirAoSessaoExpirar, definirToken } from '../api/client';
import { authApi, clienteApi } from '../api/services';
import { avisar } from '../utils/alerts';
import * as storage from '../utils/storage';

const CHAVE_TOKEN = 'aura.token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const avisouExpiracao = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const salvo = await storage.ler(CHAVE_TOKEN);
        if (salvo) {
          definirToken(salvo);
          setToken(salvo);
        }
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  const guardarToken = useCallback(async (novoToken) => {
    definirToken(novoToken);
    await storage.salvar(CHAVE_TOKEN, novoToken);
    avisouExpiracao.current = false;
    setToken(novoToken);
  }, []);

  const sair = useCallback(async () => {
    definirToken(null);
    setToken(null);
    await storage.remover(CHAVE_TOKEN);
  }, []);

  useEffect(() => {
    definirAoSessaoExpirar(() => {
      if (avisouExpiracao.current) return;
      avisouExpiracao.current = true;
      sair();
      avisar('Sessão expirada', 'Faça login novamente para continuar.');
    });
  }, [sair]);

  const entrar = useCallback(
    async (email, senha) => {
      const resposta = await authApi.login(email.trim().toLowerCase(), senha);
      await guardarToken(resposta.token);
    },
    [guardarToken],
  );

  const cadastrar = useCallback(
    async ({ nome, email, senha }) => {
      const emailNormalizado = email.trim().toLowerCase();
      await clienteApi.cadastrar({
        nome: nome.trim(),
        email: emailNormalizado,
        senha,
      });
      await entrar(emailNormalizado, senha);
    },
    [entrar],
  );

  const valor = useMemo(
    () => ({ token, logado: Boolean(token), carregando, entrar, cadastrar, sair }),
    [token, carregando, entrar, cadastrar, sair],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return contexto;
}

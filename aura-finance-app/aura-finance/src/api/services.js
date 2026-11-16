import { request } from './client';

export const authApi = {
  login: (email, senha) =>
    request('/api/auth/login', { method: 'POST', body: { email, senha }, autenticado: false }),
};

export const clienteApi = {
  cadastrar: ({ nome, email, senha }) =>
    request('/api/clientes', {
      method: 'POST',
      body: { nome, email, senha },
      autenticado: false,
    }),

  meuPerfil: () => request('/api/clientes/meu-perfil'),

  atualizar: (dados) => request('/api/clientes/meu-perfil', { method: 'PUT', body: dados }),

  definirPerfilRisco: (formulario) =>
    request('/api/clientes/meu-perfil/risco', { method: 'PUT', body: formulario }),

  excluirConta: () => request('/api/clientes/meu-perfil', { method: 'DELETE' }),
};

export const transacaoApi = {
  listar: () => request('/api/transacoes'),

  criar: (transacao) => request('/api/transacoes', { method: 'POST', body: transacao }),

  remover: (id) => request(`/api/transacoes/${id}`, { method: 'DELETE' }),
};

export const investimentoApi = {
  opcoes: () => request('/api/investimentos/opcoes'),

  taxas: () => request('/api/investimentos/taxas'),

  simular: (dados) => request('/api/investimentos/simular', { method: 'POST', body: dados }),
};

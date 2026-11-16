import Constants from 'expo-constants';
import { Platform } from 'react-native';

const PORTA_BACKEND = 8080;
const TEMPO_LIMITE_MS = 15000;

function descobrirUrlDoBackend() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }

  if (Platform.OS === 'web') {
    return `http://${window.location.hostname}:${PORTA_BACKEND}`;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  const ip = hostUri?.split(':')[0];
  if (ip && !ip.endsWith('.exp.direct')) {
    return `http://${ip}:${PORTA_BACKEND}`;
  }

  return Platform.OS === 'android' ? `http://10.0.2.2:${PORTA_BACKEND}` : `http://localhost:${PORTA_BACKEND}`;
}

export const API_URL = descobrirUrlDoBackend();

export class ApiError extends Error {
  constructor(mensagem, status) {
    super(mensagem);
    this.status = status;
  }
}

let tokenAtual = null;
let aoSessaoExpirar = null;

export function definirToken(token) {
  tokenAtual = token;
}

export function definirAoSessaoExpirar(callback) {
  aoSessaoExpirar = callback;
}

function mensagemPadrao(status) {
  if (status === 401) return 'Sua sessão expirou. Faça login novamente.';
  if (status === 403) return 'Você não tem permissão para fazer isso.';
  if (status === 404) return 'Não encontrado.';
  if (status >= 500) return 'Erro no servidor. Tente novamente em instantes.';
  return 'Não foi possível concluir a operação.';
}

export async function request(caminho, { method = 'GET', body, autenticado = true } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (autenticado && tokenAtual) headers.Authorization = `Bearer ${tokenAtual}`;

  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);

  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controle.signal,
    });
  } catch {
    throw new ApiError(
      `Não foi possível conectar ao servidor (${API_URL}). Verifique se o backend está rodando e se o celular está na mesma rede Wi-Fi do computador.`,
      0,
    );
  } finally {
    clearTimeout(timer);
  }

  const texto = await resposta.text();
  let dados = null;
  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = null;
    }
  }

  if (!resposta.ok) {
    if (resposta.status === 401 && autenticado && aoSessaoExpirar) {
      aoSessaoExpirar();
    }
    throw new ApiError(dados?.message || mensagemPadrao(resposta.status), resposta.status);
  }

  return dados;
}

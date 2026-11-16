import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';


export async function salvar(chave, valor) {
  if (Platform.OS === 'web') return window.localStorage.setItem(chave, valor);
  return SecureStore.setItemAsync(chave, valor);
}

export async function ler(chave) {
  if (Platform.OS === 'web') return window.localStorage.getItem(chave);
  return SecureStore.getItemAsync(chave);
}

export async function remover(chave) {
  if (Platform.OS === 'web') return window.localStorage.removeItem(chave);
  return SecureStore.deleteItemAsync(chave);
}

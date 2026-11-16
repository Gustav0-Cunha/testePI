# AURA finance (app)

Front-end em **React Native + Expo (SDK 58)** do AURA finance, feito a partir das telas do Figma e ligado ao backend Spring Boot (`BackendFelipeCo`).

## Como rodar

### 1. Backend

```bash
cd BackendFelipeCo
./mvnw spring-boot:run
```

O backend sobe em `http://localhost:8080`. Para as simulações de **Tesouro Selic, CDB e LCI** funcionarem, ele precisa da chave da HG Brasil:

```bash
HG_BRASIL_API_KEY=sua_chave ./mvnw spring-boot:run
```

Sem a chave, o app continua funcionando e só mostra a mensagem do backend nessas simulações (as de ETF não precisam de chave).

> O banco é H2 **em memória** e as chaves do JWT são geradas a cada inicialização. Por isso, toda vez que o backend reinicia, os usuários somem e o app volta para o login com "Sessão expirada". É o comportamento esperado.

### 2. App

```bash
npm install
npx expo start
```

- **Celular (Expo Go):** escaneie o QR Code. O celular precisa estar **na mesma rede Wi-Fi** do computador.
- **Emulador Android:** aperte `a`.
- **Navegador:** aperte `w` (precisa do ajuste de CORS no backend, veja abaixo).

O app descobre sozinho o IP do computador que está rodando o `npx expo start` e chama o backend na porta 8080. Se precisar apontar para outro endereço, crie um arquivo `.env` na raiz:

```
EXPO_PUBLIC_API_URL=http://192.168.0.10:8080
```

Se o celular não conectar, confira se o firewall do Windows está liberando a porta 8080 para o Java.

## Telas e navegação

```
Login ──► Cadastro
  │
  ▼
Home ──► Nova despesa
  │  ──► Categoria (total e % por categoria: despesas / receitas do mês)
  │  ──► Extrato (por mês; segure um item para excluir)
  │  ──► Meu Perfil ──► Nova Receita
  │                 ──► Alterar senha
  │                 ──► Questionário de perfil de risco
  │                 ──► Sair
  ├──► Investimentos ──► Simular ──► Registrar no extrato
  └──► Nova receita (atalho ao lado de Investimentos)
```

As telas "conversam" por um contexto compartilhado (`FinanceContext`): ao salvar uma despesa, receita ou investimento, o app recarrega o perfil e as transações, então o saldo da Home, o Extrato, o gráfico e o "quanto sobra" dos Investimentos já aparecem atualizados.

Telas que não estavam no Figma, mas que o backend exige: **Alterar senha**, **Questionário de perfil de risco** (o `/api/investimentos/opcoes` só responde depois dele) e **Simular investimento** (usa o `/api/investimentos/simular`). Elas seguem o mesmo visual.

## Estrutura

```
src/
  app/          telas (cada arquivo é uma rota do Expo Router)
  api/          client.js (fetch + token JWT) e services.js (um objeto por controller)
  context/      AuthContext (login/token) e FinanceContext (perfil + transações)
  components/   botões, campos, resumo por categoria, logo...
  constants/    categorias e textos dos investimentos
  theme/        cores do Figma
  utils/        formatação de moeda, datas e cálculos do mês
backend-ajustes/  correções sugeridas para o backend (veja abaixo)
```

Para adicionar uma categoria nova, basta editar `src/constants/categorias.js`.

## Ajustes sugeridos no backend (`backend-ajustes/`)

1. **Transações duplicadas (bug).** No `TransacaoService.salvar`, o `clienteRepository.save(cliente)` vinha antes do `transacaoRepository.save(transacao)`. O cascade do cliente gravava uma cópia da transação e o segundo `save` gravava outra, então **cada despesa aparecia duas vezes** no extrato e no gráfico (o saldo era descontado só uma vez). A correção é inverter as duas linhas. Arquivo pronto: `backend-ajustes/TransacaoService.java`.
2. **CORS (opcional, só para rodar no navegador).** Celular e emulador não precisam. Arquivo pronto: `backend-ajustes/SecurityConfig.java`.

O arquivo `backend-ajustes/ajustes.patch` mostra exatamente o que mudou nos dois arquivos.

## Diferenças entre o Figma e o backend

- **Esqueci minha senha:** não existe endpoint no backend. O botão mostra um aviso.
- **Salário:** o cadastro do Figma não tem salário, então ele é editado em **Meu Perfil** (toque no campo "Salário"). Ele é usado para calcular quanto sobra por mês na tela de Investimentos.
- **Perfil de risco:** a barra do Figma mostra o perfil calculado pelo backend. Ao tocar nela, abre o questionário.
- **"saldo do mês"** mostra o `saldoAtual` do backend. Receita e Despesas são as do mês atual.
- Os logos de marcas do Figma (iFood, Uber) viraram ícones por categoria, porque o backend não guarda a "loja".

# 🏙️ Cidade Colab — Spec Front-end

> Documento de especificação técnica e funcional do front-end do **Cidade Colab**, derivado diretamente do contrato da REST API (Spring Boot 3 + MongoDB + Keycloak + Cloudinary). Serve como referência única para implementação de UI, integração com API, gestão de estado e tratamento de erros.

---

## 1) Visão geral do produto

O Cidade Colab é uma plataforma onde cidadãos registram ocorrências urbanas (buracos, iluminação, saneamento, etc.), classificam por categoria, anexam imagem, localizam no mapa e recebem apoio da comunidade em um feed público.

O front-end deve cobrir três grandes áreas de experiência:

- **Pública**: navegação no feed, visualização de colabs e categorias, cadastro e login — sem exigir autenticação.
- **Autenticada**: criação de colabs (com upload de imagem), apoiar/desapoiar, visualizar perfil próprio.
- **Sessão persistente**: manter token JWT válido entre navegações, com renovação/expiração tratada de forma defensiva.

---

## 2) Stack tecnológica recomendada

| Camada | Tecnologia sugerida | Observação |
|---|---|---|
| Framework | React 18+ (Vite) ou Next.js 14+ | Next.js se houver necessidade de SSR/SEO no feed público; React puro (SPA) é suficiente para o escopo atual |
| Linguagem | TypeScript | Tipagem forte alinhada aos DTOs do backend (evita drift de contrato) |
| Gerência de estado servidor | TanStack Query (React Query) | Ideal para cache, paginação cursor-based e invalidação após mutações (ex.: apoiar) |
| Gerência de estado local/UI | Zustand ou Context API | Sessão do usuário, token, preferências de UI |
| Formulários e validação | React Hook Form + Zod | Validação de e-mail, senha (mín. 8 caracteres), campos obrigatórios de colab |
| HTTP client | Axios (com interceptors) | Interceptor de `Authorization: Bearer` e tratamento centralizado de 401/403 |
| Mapa/geolocalização | Leaflet (OpenStreetMap) ou Google Maps JS SDK | Seleção de coordenadas ao criar colab e exibição no detalhe |
| Upload de imagem | Input nativo + preview + compressão client-side (ex.: `browser-image-compression`) | Respeitar limite de 10MB e tipos aceitos antes do upload |
| Estilo | Tailwind CSS + Headless UI/Radix | Produtividade e consistência visual |
| Roteamento | React Router (SPA) ou App Router (Next.js) | Rotas públicas x protegidas com guards |
| Testes | Vitest/Jest + Testing Library + Playwright (E2E) | Cobrir fluxos críticos: login, criar colab, apoiar |

---

## 3) Arquitetura do front-end

```text
┌──────────────────────────────────────────────────────────┐
│                         UI LAYER                          │
│   Pages/Screens · Componentes · Layouts · Rotas           │
└───────────────┬────────────────────────────┬──────────────┘
                │                            │
   Estado local │                            │ Estado servidor
                ▼                            ▼
    ┌───────────────────────┐    ┌────────────────────────────┐
    │  Session Store         │    │   Query Layer (React Query) │
    │  (token, user, roles)  │    │   feed, colab, categories,  │
    │                        │    │   support (mutations)       │
    └───────────┬────────────┘    └───────────────┬─────────────┘
                │                                  │
                ▼                                  ▼
    ┌──────────────────────────────────────────────────────────┐
    │                    HTTP CLIENT (Axios)                    │
    │  Interceptor de token · Refresh/expiração · Erros padrão  │
    └───────────────────────┬────────────────────────────────────┘
                            │
                            ▼
    ┌──────────────────────────────────────────────────────────┐
    │        API Cidade Colab (Spring Boot) — /v1 + /auth        │
    └──────────────────────────────────────────────────────────┘
```

### Camadas sugeridas (estrutura de pastas)

```text
src/
├── app/                    # bootstrap, rotas, providers globais
├── features/
│   ├── auth/               # login, cadastro, sessão
│   ├── feed/                # listagem paginada
│   ├── colab/                # criação, detalhe, suporte
│   ├── categories/         # catálogo de categorias
│   └── user/                # perfil do usuário
├── shared/
│   ├── api/                 # cliente axios, endpoints tipados
│   ├── components/          # UI genérica (botões, inputs, modais)
│   ├── hooks/                # hooks reutilizáveis
│   ├── types/                # DTOs/interfaces TS espelhando o backend
│   └── utils/                # formatação, validação, storage
└── styles/
```

---

## 4) Autenticação e gestão de sessão

### 4.1 Fluxo de login

1. Usuário submete `username` e `password` no formulário de login.
2. Front chama `POST /auth`.
3. Resposta `{ "accessToken": "eyJ..." }` é armazenada (ver seção 4.3).
4. Front decodifica o JWT (sem validar assinatura — isso é responsabilidade do backend) para extrair `roles`/`authorities` e popular a sessão local (ex.: exibir botões condicionais de "Apoiar" ou "Criar colab").
5. Redireciona para o feed ou página de origem (`redirectTo`).

### 4.2 Fluxo de cadastro

1. Formulário coleta `username`, `email`, `password` (mín. 8 caracteres).
2. Validação client-side: campos não vazios, e-mail válido, senha ≥ 8 caracteres.
3. `POST /v1/users` → `201 Created` sem corpo.
4. Backend não retorna token automaticamente após cadastro — front deve **redirecionar para login** (ou disparar login automático encadeado, chamando `POST /auth` com as mesmas credenciais, como melhoria de UX).
5. Tratar erros de unicidade (username/e-mail já existentes) — ver seção 7.

### 4.3 Armazenamento do token

- Persistir `accessToken` em `localStorage` (SPA simples) ou em cookie `httpOnly` via BFF, se a arquitetura evoluir para incluir um backend-for-frontend. Para o escopo atual (SPA consumindo API diretamente), `localStorage` é aceitável, mas deve-se documentar o risco de XSS e mitigar com sanitização de inputs.
- Interceptor do Axios injeta `Authorization: Bearer <token>` em toda requisição para rotas protegidas.
- Não existe endpoint de refresh token documentado no contrato atual — o front deve tratar a expiração como um **401**, limpar a sessão e redirecionar para login (ver seção 7.2).

### 4.4 Regras de acesso por rota (mapeamento de guards no front)

| Rota da API | Acesso | Guard no front |
|---|---|---|
| `POST /auth` | Pública | — |
| `POST /v1/users` | Pública | — |
| `GET /v1/feed` | Pública | — |
| `GET /v1/categories` | Pública | — |
| `GET /v1/colab/{colabId}` | Pública | — |
| `POST /v1/colab/prepare` | Autenticado | Exigir sessão ativa |
| `POST /v1/colab/create` | `ROLE_COLLABORATOR` + `PERM_colabs:create` | Exigir sessão + checar authority antes de habilitar botão "Publicar" |
| `PUT /v1/colab/support/{colabId}` | `ROLE_COLLABORATOR` + `PERM_colabs:support` | Exigir sessão + checar authority antes de habilitar botão "Apoiar" |
| `GET /v1/users/{userId}` | `ROLE_COLLABORATOR` + `PERM_users:view` | Exigir sessão + checar authority para acessar página de perfil |

Recomenda-se um componente `ProtectedRoute`/`RequireAuth` que:
- Redireciona para `/login` se não houver token válido.
- Opcionalmente exibe estado de "sem permissão" se o token existir mas faltar a authority exigida (ex.: `ROLE_COLLABORATOR`), em vez de apenas redirecionar — já que a ausência de papel é um caso de negócio distinto de sessão expirada.

---

## 5) Telas e fluxos de UI

### 5.1 Mapa de telas

| Tela | Rota sugerida | Autenticação |
|---|---|---|
| Feed (home) | `/` | Pública |
| Detalhe do colab | `/colab/:colabId` | Pública |
| Login | `/login` | Pública |
| Cadastro | `/cadastro` | Pública |
| Criar colab (etapa 1: upload) | `/colab/novo` | Autenticado |
| Criar colab (etapa 2: dados) | `/colab/novo/detalhes` | Autenticado |
| Perfil do usuário | `/perfil/:userId` | Autenticado + `PERM_users:view` |

### 5.2 Fluxo: cadastro → login → feed

```text
[Cadastro] --POST /v1/users (201)--> [Login] --POST /auth (accessToken)--> [Feed autenticado]
```

- Se o cadastro falhar por username/e-mail duplicado, exibir erro inline no campo correspondente, sem navegar.

### 5.3 Fluxo: criação de colab com imagem

Este é o fluxo mais sensível do produto porque depende de **duas chamadas encadeadas**:

1. **Etapa de upload** — tela com campo de seleção de imagem (`file`, multipart/form-data).
   - Validar no client antes de enviar: tamanho ≤ 10MB, tipo entre JPEG/PNG/WEBP/HEIC/HEIF/GIF/BMP.
   - Exibir preview da imagem e barra de progresso de upload.
   - Chamar `POST /v1/colab/prepare`.
   - Resposta: `{ imageKey, colabId, url }` — armazenar esses três valores em estado local (contexto do wizard ou query string), pois serão reutilizados na etapa seguinte.
2. **Etapa de dados** — formulário com título, descrição, categorias (multi-select vindo de `GET /v1/categories`), localização (endereço + seleção no mapa) e preview da imagem já enviada.
   - Submeter `POST /v1/colab/create` com `colabId` e `imageKey` recebidos na etapa 1, mais os dados do formulário.
   - Em caso de sucesso (`201`, sem corpo), redirecionar para o feed ou para o detalhe do colab recém-criado (`GET /v1/colab/{colabId}` usando o `colabId` já conhecido).
   - **Regra de negócio a refletir na UI**: o autor apoia automaticamente a própria colab ao criá-la — o botão de apoio deve nascer no estado "apoiado" (`supportCount` inicial ≥ 1) ao navegar para o detalhe.

Recomenda-se implementar esse fluxo como **wizard de duas etapas com estado persistido** (ex.: React Hook Form multi-step ou máquina de estados com XState), para permitir voltar/avançar sem perder o `imageKey`/`colabId` já obtidos. Caso o usuário abandone antes da etapa 2, o front pode oferecer "continuar rascunho" salvando esses IDs temporariamente em `sessionStorage`.

### 5.4 Fluxo: apoiar/desapoiar (toggle)

- Botão "Apoiar" no card do feed e na tela de detalhe.
- Ao clicar, chamar `PUT /v1/colab/support/{colabId}`.
- Como a resposta é `200 OK` sem corpo, o front não sabe pelo corpo da resposta se o resultado foi "apoiado" ou "desapoiado" — deve inferir otimisticamente pelo estado anterior local (toggle) e, idealmente, revalidar buscando o colab atualizado (`GET /v1/colab/{colabId}`) ou usando **atualização otimista** com rollback em caso de erro.
- Padrão recomendado com React Query: `useMutation` com `onMutate` (atualização otimista do `supportCount` e do estado "apoiado"), `onError` (rollback) e `onSettled` (invalidar cache do colab e do feed).
- Tratar erro de concorrência (ex.: outro clique simultâneo) desabilitando o botão durante a requisição em curso.

### 5.5 Fluxo: feed com paginação cursor-based

- Carregar página inicial: `GET /v1/feed?size=20` (sem `pageToken`).
- Guardar `nextPageToken` da resposta.
- Ao chegar ao fim da lista visível (scroll infinito) ou ao clicar em "Carregar mais", chamar `GET /v1/feed?pageToken=<token>&size=20`.
- Quando `nextPageToken` vier `null`, esconder o botão/gatilho de carregar mais e exibir indicador de "fim da lista".
- Validar `size` no client (entre 1 e 50) antes de enviar, embora o backend já normalize valores inválidos para 20.
- Implementar com `useInfiniteQuery` do React Query, usando `nextPageToken` como `pageParam`.

### 5.6 Fluxo: catálogo de categorias

- `GET /v1/categories?includeInactive=false` alimenta:
  - Filtros do feed (opcional, se o produto quiser filtrar por categoria/grupo).
  - Multi-select na criação de colab (usar `slug` como valor, `name` como label).
- Agrupar visualmente por `group` (enum temática) para melhorar a UX de seleção, já que o backend retorna esse campo.

### 5.7 Fluxo: perfil do usuário

- `GET /v1/users/{userId}` retorna `username`, `createdAt` e `userColabs` (lista de `ColabResponse`).
- Renderizar como uma página de perfil com cabeçalho (nome, data de entrada) e grid/lista dos colabs criados pelo usuário, reutilizando o componente de card do feed.
- Acesso restrito por authority — se o usuário autenticado tentar acessar perfil de terceiros sem `PERM_users:view`, o front deve tratar o `403` (ver seção 7).

---

## 6) Modelos de dados (tipos TypeScript espelhando os DTOs)

```typescript
interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
}

interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

interface UserResponse {
  username: string;
  createdAt: string; // ISO 8601
  userColabs: ColabResponse[];
}

interface CategoryResponse {
  slug: string;
  name: string;
  description: string;
  group: string; // enum temática, ex.: "ROADS_AND_SIDEWALKS"
  keywords: string[];
}

interface PrepareColabResponse {
  imageKey: string;
  colabId: string;
  url: string;
}

interface LocationRequest {
  name: string;
  reference: string;
  type?: string; // ignorado pelo backend, sempre salvo como POINT
  street: string;
  number: string;
  neighborhood: string;
  postalCode: string;
  coordinates: [number, number]; // [longitude, latitude]
}

interface CreateColabRequest {
  colabId: string;
  title: string;
  description: string;
  categoriesSlugs: string[];
  location: LocationRequest;
  imageKey: string;
}

interface Address {
  street: string;
  number: string;
  neighborhood: string;
  postalCode: string;
}

interface LocationResponse {
  name: string;
  reference: string;
  type: string; // sempre "POINT"
  address: Address;
  coordinates: [number, number];
}

interface ColabResponse {
  id: string;
  userId: string;
  title: string;
  description: string;
  categories: CategoryResponse[];
  status: 'CREATED';
  supportCount: number;
  location: LocationResponse;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
}

interface FeedResponse {
  items: ColabResponse[];
  nextPageToken: string | null;
}
```

---

## 7) Tratamento de erros (contrato defensivo)

O backend **não possui um contrato de erro padronizado único** — lança exceções padrão do Spring, então o front deve tratar por status HTTP de forma defensiva, sem depender de um formato fixo de corpo de erro.

| Status | Cenário provável | Tratamento recomendado no front |
|---|---|---|
| `400` | Validação de campos (ex.: e-mail inválido, campos em branco) | Exibir mensagem genérica de validação por campo, tentando ler `message` do corpo se existir; fallback para texto padrão |
| `401` | Token ausente/expirado/inválido | Limpar sessão local, redirecionar para `/login` preservando a rota de origem para retorno pós-login |
| `403` | Falta de `ROLE_COLLABORATOR` ou `PERM_*` necessária | Exibir tela/modal de "acesso não permitido", sem deslogar o usuário (ele está autenticado, apenas sem a permissão) |
| `404` | `colabId`/`userId` inexistente | Exibir tela "não encontrado" com CTA para voltar ao feed |
| `409` (possível) | Username/e-mail duplicado no cadastro | Exibir erro inline no campo correspondente |
| `413`/`400` | Arquivo de imagem maior que 10MB ou tipo não suportado | Validar no client antes do envio para evitar a chamada; exibir erro imediato |
| `5xx` | Erro interno/indisponibilidade | Tela de erro genérica com opção de tentar novamente; usar retry automático com backoff no React Query para leituras (não para mutações) |

Recomenda-se um **interceptor global do Axios** que normalize todas as respostas de erro em um formato interno único (`{ status, message, fieldErrors? }`), isolando o resto da aplicação das inconsistências do backend.

### 7.1 Interceptor de resposta (padrão)

```typescript
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStore.clear();
      redirectToLogin();
    }
    return Promise.reject(normalizeError(error));
  }
);
```

### 7.2 Expiração de sessão em ação protegida

Como não há endpoint de refresh documentado, ao receber `401` durante uma ação (ex.: tentar apoiar), o front deve:
1. Interromper a ação otimista (rollback).
2. Notificar o usuário ("sua sessão expirou, faça login novamente").
3. Redirecionar para login preservando a intenção (ex.: retomar o apoio após novo login, se a UX justificar o esforço).

---

## 8) Integrações externas relevantes para o front

- **Keycloak**: o front não interage diretamente com o Keycloak; toda autenticação passa pelo backend (`/auth`), que atua como fachada. Não implementar fluxo `Authorization Code` direto contra o Keycloak, a menos que o backend migre para esse modelo.
- **Cloudinary**: o front nunca faz upload direto ao Cloudinary — sempre via `POST /v1/colab/prepare` no backend, que retorna a `url` já pronta para exibição (`imageUrl` no `ColabResponse`). Usar essa URL diretamente em tags de imagem, aproveitando otimizações de entrega do Cloudinary (formato, tamanho) se a URL suportar parâmetros de transformação.
- **Mapas**: o front é responsável por capturar `coordinates` (via clique no mapa ou geolocalização do navegador) e exibi-las de volta no detalhe do colab usando a mesma biblioteca de mapas.

---

## 9) Checklist de implementação por prioridade

1. Setup do projeto (Vite/Next + TypeScript + Tailwind + Axios + React Query).
2. Tipos TypeScript espelhando os DTOs (seção 6).
3. Tela de feed público com paginação cursor-based e cards de colab.
4. Tela de detalhe do colab (rota pública).
5. Cadastro e login, com persistência de sessão e guards de rota.
6. Catálogo de categorias consumido no filtro do feed e no formulário de criação.
7. Wizard de criação de colab (`prepare` → `create`), incluindo mapa e validação de imagem.
8. Toggle de apoio com atualização otimista.
9. Página de perfil do usuário autenticado.
10. Tratamento global de erros e interceptor de sessão expirada.
11. Testes E2E dos três fluxos críticos: login, criar colab, apoiar/desapoiar.

---

## 10) Notas finais para consistência com o backend

- Sempre usar `slug` (não `name`) ao enviar `categoriesSlugs` em `POST /v1/colab/create`.
- O campo `type` em `LocationRequest` é ignorado pelo backend (sempre salvo como `POINT`) — pode ser omitido no formulário ou fixado como constante, sem expor essa decisão ao usuário final.
- `coordinates` segue a convenção `[longitude, latitude]` (padrão GeoJSON), atenção à ordem ao integrar com bibliotecas de mapa que esperam `[latitude, longitude]`.
- `size` do feed deve ser tratado no client como limitado a 50, mesmo que o backend normalize valores fora do intervalo, para manter previsibilidade de performance de renderização de listas.
</content>
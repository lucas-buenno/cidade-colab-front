## 1) Visão do produto

**Cidade Colab** é uma plataforma colaborativa para cidadãos registrarem ocorrências urbanas (ex.: buracos, iluminação, saneamento), classificarem por categoria, anexarem imagem, localizarem no mapa e receberem apoio de outros usuários.

O backend atual cobre:
- autenticação via Keycloak (JWT);
- cadastro de usuário;
- criação e consulta de colabs;
- feed paginado;
- apoio (toggle apoiar/desapoiar);
- catálogo de categorias.

---

## 2) Stack e arquitetura

- **Backend:** Spring Boot 3 (Java 17)
- **Banco:** MongoDB
- **AuthN/AuthZ:** Keycloak + OAuth2 Resource Server (JWT)
- **Upload de imagem:** Cloudinary
- **Clientes HTTP externos:** OpenFeign

---

## 3) Base URL e versionamento

Rotas públicas da API usam principalmente prefixo **`/v1`** (exceto login em `/auth`).

Exemplos de base:
- local dev (comum): `http://localhost:8081`
- endpoints: `http://localhost:8081/v1/...`

---

## 4) Autenticação e autorização

## 4.1 Login
- `POST /auth`
- Retorna `accessToken` (JWT) para uso no header:
  - `Authorization: Bearer <token>`

Request:
```json
{
  "username": "usuario",
  "password": "senha"
}
Response:
{
  "accessToken": "eyJ..."
}
 4.2 Regras de acesso por rota
Públicas (sem token):
•
POST /auth
•
POST /v1/users
•
GET /v1/feed
•
GET /v1/categories
•
GET /v1/colab/{colabId}
Protegidas (token obrigatório):
•
POST /v1/colab/prepare (autenticado)
•
POST /v1/colab/create + authorities:
◦
ROLE_COLLABORATOR
◦
PERM_colabs:create
•
PUT /v1/colab/support/{colabId} + authorities:
◦
ROLE_COLLABORATOR
◦
PERM_colabs:support
•
GET /v1/users/{userId} + authorities:
◦
ROLE_COLLABORATOR
◦
PERM_users:view
O backend extrai roles do token e converte para autoridades com prefixo ROLE e PERM.
 5) Entidades principais (modelo funcional)
 5.1 User
•
id (igual ao user id do Keycloak)
•
username (único)
•
email (único)
•
createdAt, updatedAt
 5.2 Colab
•
id
•
userId (autor)
•
title
•
description
•
categories (lista de slugs)
•
supportCount (contador de apoios)
•
location (nome/referência/tipo/endereço/coordenadas)
•
status (CREATED)
•
imageKey (referência da imagem no Cloudinary)
•
createdAt, updatedAt
 5.3 Category
•
slug (id)
•
name
•
description
•
group (enum temática)
•
keywords
•
active
•
createdAt, updatedAt
 6) Fluxos críticos para o front
 6.1 Cadastro e login
1.
POST /v1/users (cria no Keycloak + Mongo local)
2.
POST /auth (obtém token JWT)
 6.2 Criação de colab com imagem
1.
Upload da imagem: POST /v1/colab/prepare (multipart/form-data, campo file)
2.
Recebe: imageKey, colabId, url
3.
Criar colab: POST /v1/colab/create usando colabId + imageKey retornados no passo 1
Regra: ao criar colab, o autor automaticamente “apoia” a própria colab (incrementa suporte).
 6.3 Apoio/desapoio
•
PUT /v1/colab/support/{colabId} funciona em toggle:
◦
se ainda não apoiou, adiciona apoio;
◦
se já apoiou, remove apoio.
 6.4 Feed com paginação cursor-based
•
GET /v1/feed?pageToken=<token>&size=<n>
•
nextPageToken vem na resposta; enviar no próximo request.
•
size:
◦
default: 20
◦
máximo: 50
◦
inválido (<=0) normaliza para 20
 7) Endpoints detalhados
 7.1 Auth
 POST /auth
Auth: pública
 Body:
{ "username": "string", "password": "string" }
200:
{ "accessToken": "string" }
 7.2 Users
 POST /v1/users
Auth: pública
 Body:
{
  "username": "string",
  "email": "email@dominio.com",
  "password": "min 8 chars (regra esperada)"
}
201 Created (sem body)
Regras:
•
username/email não podem estar em branco;
•
username deve ser único;
•
email deve ser único.
 GET /v1/users/{userId}
Auth: ROLE_COLLABORATOR + PERM_users:view
 200:
{
  "username": "string",
  "createdAt": "2026-01-01T00:00:00Z",
  "userColabs": [/* ColabResponse[] */]
}
 7.3 Categories
 GET /v1/categories?includeInactive=false
Auth: pública
 Query params:
•
includeInactive (default false)
200:
[
  {
    "slug": "pothole",
    "name": "Buraco na via",
    "description": "string",
    "group": "ROADS_AND_SIDEWALKS",
    "keywords": ["..."]
  }
]
 7.4 Colab
 POST /v1/colab/prepare
Auth: autenticado
 Content-Type: multipart/form-data
 Campo: file (imagem)
Validações de arquivo:
•
obrigatório e não vazio;
•
tamanho máximo: 10MB;
•
tipos aceitos por assinatura/binário:
◦
JPEG, PNG, WEBP, HEIC, HEIF, GIF, BMP.
200:
{
  "imageKey": "develop/colab/images/<userId>/<colabId>",
  "colabId": "uuid",
  "url": "https://..."
}
 POST /v1/colab/create
Auth: ROLE_COLLABORATOR + PERM_colabs:create
 Body:
{
  "colabId": "uuid recebido no /prepare",
  "title": "string",
  "description": "string",
  "categoriesSlugs": ["pothole", "streetlight-outage"],
  "location": {
    "name": "string",
    "reference": "string",
    "type": "ignorado no backend (sempre salvo como POINT)",
    "street": "string",
    "number": "string",
    "neighborhood": "string",
    "postalCode": "string",
    "coordinates": [-23.55052, -46.633308]
  },
  "imageKey": "string recebido no /prepare"
}
201 Created (sem body)
 PUT /v1/colab/support/{colabId}
Auth: ROLE_COLLABORATOR + PERM_colabs:support
 200 OK (sem body)
 Efeito: toggle apoio/desapoio.
 GET /v1/colab/{colabId}
Auth: pública
 200 (ColabResponse):
{
  "id": "string",
  "userId": "string",
  "title": "string",
  "description": "string",
  "categories": [/* CategoryResponse[] */],
  "status": "CREATED",
  "supportCount": 10,
  "location": {
    "name": "string",
    "reference": "string",
    "type": "POINT",
    "address": {
      "street": "string",
      "number": "string",
      "neighborhood": "string",
      "postalCode": "string"
    },
    "coordinates": [-23.55052, -46.633308]
  },
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z",
  "imageUrl": "https://..."
}
 7.5 Feed
 GET /v1/feed?pageToken=<token>&size=20
Auth: pública
 Query params:
•
pageToken (opcional)
•
size (opcional, default 20, max 50)
200:
{
  "items": [/* ColabResponse[] */],
  "nextPageToken": "string ou null"
}
Paginação:
•
nextPageToken = null => fim da lista.
•
token é baseado no id interno (cursor).
 8) Integrações externas
 8.1 Keycloak
•
Login (/auth) troca user/pass por token OAuth2.
•
Criação de usuário (/v1/users) provisiona usuário no Keycloak Admin API.
•
JWT validado por issuer-uri e audience (resource-client-id).
 8.2 Cloudinary
•
Upload de imagens da colab.
•
Persistência de imageKey e geração de imageUrl para resposta ao front.
 8.3 MongoDB
Coleções:
•
colab_users
•
colabs
•
colab_supports (índice único composto colabId + userId)
•
colab_categories (carga inicial via migration)
 9) Regras e observações importantes para o front
1.
Sempre persistir token após /auth e enviar em rotas protegidas.
2.
Fluxo de criação de colab depende de /v1/colab/prepare antes de /v1/colab/create.
3.
Tratar PUT /support como ação de alternância (estado pode virar apoiado ou não apoiado).
4.
Para feed infinito, usar nextPageToken até vir null.
5.
Em erro de negócio/validação, o backend atualmente lança exceções padrão (sem contrato de erro padronizado único). O front deve tratar mensagens e status HTTP de forma defensiva.
6.
Categorias vêm do backend e devem ser usadas por slug ao criar colab.
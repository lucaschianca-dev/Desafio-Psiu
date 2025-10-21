# Lucas API — CRUD de Itens (Meteor + React)

Este repositório contém uma aplicação completa de gerenciamento de itens construída com Meteor (Node.js) no backend e React no frontend. O projeto expõe uma API REST com documentação OpenAPI/Swagger e também possui métodos Meteor e uma publicação DDP opcional.

Principais capacidades:
- CRUD de itens (criar, listar com paginação e filtros, atualizar, deletar com soft delete)
- UI em React com paginação, filtros, formulário modal e cartões interativos
- API REST documentada com Swagger (OpenAPI 3)
- Camadas bem definidas (Domínio, Use Cases, Adapters/Infra, Controller HTTP)
- Seed de dados para desenvolvimento


1. Visão Geral
- Stack: Meteor 3.3.2, Node.js, React, MongoDB (via Meteor), Swagger UI
- Padrões: Clean Architecture (Use Cases + Repository), DTOs de entrada, validação de domínio
- Estratégia de dados: IDs como string de ObjectID (24 chars), soft delete via campo available

Endpoints principais
- Swagger UI: http://localhost:3000/api/docs
- OpenAPI JSON: http://localhost:3000/api/docs/swagger.json
- API REST: http://localhost:3000/api/items


2. Como executar localmente
Pré-requisitos
- Node.js instalado (Meteor já traz sua versão embutida)
- Meteor instalado: https://www.meteor.com/developers/install

Passos
1) Instalar dependências
   - Abra um terminal na pasta do projeto e execute:
     meteor npm install

2) Iniciar em desenvolvimento
   meteor run

3) Acessar
- UI Web (React): http://localhost:3000
- API REST: http://localhost:3000/api/items
- Swagger UI: http://localhost:3000/api/docs

Observação importante (seed e limpeza de dados)
- Por padrão, no startup do servidor (server/main.js) a coleção Items é LIMPA e populada para facilitar o desenvolvimento:
  - Linhas (exemplo):
    await Items.rawCollection().deleteMany({}); // limpa
    await seedIfEmpty(); // repopula
- Para manter dados entre reinícios, remova ou comente a limpeza (deleteMany) e, se desejar, o seed.


3. Estrutura do Projeto
- client/
  - main.jsx: bootstrap do React e import de estilos
- imports/
  - api/items/
    - adapters/
      - mongoItemsRepository.js: implementação do repositório em Mongo (rawCollection)
    - controllers/
      - itemController.js: montagem da API REST + CORS
      - swaggerController.js: monta Swagger UI e serve swagger.json
    - domain/
      - item.js: regras e validação de domínio (buildItemPayload)
      - errors.js: erros de domínio (ValidationError, NotFoundError)
    - infra/
      - collection.js: coleção Mongo e índices
      - objectId.js: utilitários de ObjectID (string)
      - publications.js: publicação Meteor items.list (opcional)
      - swagger.js: especificação OpenAPI 3
    - usecases/
      - createItem.js, listItems.js, updateItem.js: casos de uso do domínio
    - dto.js: sanitização de payloads de entrada (HTTP/Methods)
    - methods.js: métodos Meteor (items.insert, items.list, items.update, items.delete)
    - seed.js: popular base para dev
  - ui/
    - App e páginas/componentes React (ItemsPage, ItemCard, ItemForm, etc.)
    - hooks/useItems.js: hooks de dados (REST e opcional pub/sub)
    - styles/*: CSS
- server/
  - main.js: startup do servidor, índices, seed, montagem de controllers
- tests/
  - testes (Mocha) quando habilitados


4. Modelo de Dados e Regras
Item
- _id: string (ObjectID 24 hex) — gerado no servidor
- title: string (3–80 chars) — obrigatório na criação
- description: string (0–500 chars) — opcional (vazio por padrão na criação)
- status: enum('todo','doing','done') — default 'todo'
- priority: inteiro 1..5 — default 3
- available: boolean — usado para soft delete; default true
- createdAt: Date — definido no servidor

Validações de domínio (imports/api/items/domain/item.js)
- Título: obrigatório na criação, tamanho entre 3 e 80
- Descrição: até 500 chars; em updates só é alterada se enviada (não é apagada em updates parciais)
- Status: deve estar no enum
- Priority: inteiro 1..5
- available: só pode ser mudado em update; criação ignora caso venha do cliente


5. Camadas e Fluxo (Clean Architecture)
- UI (React) chama mutações via Meteor Methods e lê lista via REST (hook useHttpItems)
- Controller HTTP (itemController) recebe GET/POST/PUT/DELETE, sanitiza, chama Use Cases
- Use Cases (create, list, update) aplicam regras, constroem payload de domínio e chamam o Repositório
- Repositório (mongoItemsRepository) persiste usando rawCollection e normaliza IDs (string)
- Swagger expõe a documentação a partir de imports/api/items/infra/swagger.js

Pub/Sub (opcional)
- Existe publicação items.list e um hook useItemsSub. A tela atual usa REST, mas é possível alternar para reatividade DDP quando desejado.


6. API REST — Guia Rápido
Base URL: http://localhost:3000

Listar itens (paginação + filtros)
GET /api/items?page=1&limit=10&status=doing&search=macbook
Resposta 200:
{
  "items": [ { "_id": "...", "title": "...", "description": "...", "status": "doing", "priority": 3, "available": true, "createdAt": "2025-01-01T12:00:00.000Z" } ],
  "page": 1,
  "limit": 10,
  "total": 42,
  "hasMore": true
}

Criar item
POST /api/items
Content-Type: application/json
{
  "title": "Comprar Macbook",
  "description": "com 32GB RAM",
  "priority": 3,
  "status": "todo"
}
Resposta 201: { "_id": "...", "item": { ... } }

Buscar por ID
GET /api/items/{id}
- id deve ter 24 caracteres hexadecimais

Atualizar item (parcial)
PUT /api/items/{id}
Content-Type: application/json
{
  "status": "done",
  "priority": 5
}
Resposta 200: Item atualizado

Deletar item (soft delete)
DELETE /api/items/{id}
Resposta 200: { message: "Item excluido com sucesso", item: { ... } }

Erros comuns
- 400: parâmetros inválidos (status fora do enum, id inválido, body vazio, etc.)
- 404: item não encontrado
- 500: erro interno (ver logs do servidor)

CORS
- Habilitado a partir do controller.


7. Frontend (React)
Tela principal (imports/ui/pages/ItemsPage.jsx)
- Filtros: busca textual e status
- Paginação via REST (useHttpItems)
- Cards com alteração de status e exclusão (soft delete)
- Modal para criar/editar (ItemForm)
- Atualizações chamam refetch() para refletir imediatamente na lista

Hooks de dados (imports/ui/hooks/useItems.js)
- useHttpItems: paginação, filtros, refetch, controle de loading/erro
- useCreateItem/useUpdateItem/useDeleteItem: mutações via Meteor Methods
- useItemsSub (opcional): assinatura DDP reativa
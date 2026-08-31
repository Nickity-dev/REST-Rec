# HelpDesk API REST

API REST para gestão de chamados e suporte técnico, com autenticação JWT, proteção de rotas, documentação Swagger e integrações seguras com MySQL.

## Tecnologias

- Node.js + Express
- MySQL 8
- JWT
- bcryptjs
- Swagger UI
- CORS
- dotenv

## Requisitos

- Node.js 18+
- MySQL 8 ou MySQL Server local
- npm

## Instalação

1. Clone o repositório.
2. Instale as dependências:

```bash
npm install
```

3. Crie um arquivo `.env` baseado no exemplo:

```bash
cp .env.example .env
```

4. Ajuste as variáveis do banco e do JWT no arquivo `.env`.

## Variáveis de Ambiente

| Variável | Descrição |
| --- | --- |
| `PORT` | Porta do servidor Express |
| `FRONTEND_URL` | URL do front-end permitido via CORS |
| `JWT_SECRET` | Chave secreta para emitir/validar JWT |
| `DB_HOST` | Host do banco MySQL |
| `DB_PORT` | Porta do banco MySQL |
| `DB_USER` | Usuário do banco MySQL |
| `DB_PASSWORD` | Senha do banco MySQL |
| `DB_NAME` | Nome do banco MySQL |

## Banco de Dados

Execute o script em `database/init.sql` no seu MySQL para criar as tabelas:

```sql
SOURCE database/init.sql;
```

Ou execute o conteúdo do arquivo manualmente em um cliente MySQL.

## Execução

```bash
npm start
```

Para desenvolvimento:

```bash
npm run dev
```

O servidor ficará disponível em:

- `http://localhost:3000`
- Swagger em `http://localhost:3000/api-docs`

## Endpoints principais

### Autenticação

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Chamados

- `GET /api/tickets`
- `POST /api/tickets`
- `GET /api/tickets/:id`
- `PATCH /api/tickets/:id/status`
- `DELETE /api/tickets/:id`

### Comentários

- `GET /api/tickets/:ticketId/comments`
- `POST /api/tickets/:ticketId/comments`

## Segurança

- Senhas armazenadas com `bcryptjs`
- JWT em `Authorization: Bearer <token>`
- Middleware `cors` validando a origem do front-end
- Prepared statements nas consultas SQL
- Sanitização simples de campos de entrada

## Observação

O projeto foi pensado para funcionar com MySQL em ambiente local e para servir uma aplicação front-end que consuma a API por meio de `fetch`/`axios`.

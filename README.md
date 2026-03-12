# abura-backend
API + WebSocket + Algoritmos

API REST e WebSocket para o Sistema de Regulação Médica Emergencial.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

## Stack

- Node.js 20 + TypeScript
- Express + Socket.io
- PostgreSQL 15 + PostGIS
- Redis 7
- Prisma ORM
- Jest (testes)

## Início Rápido

```bash
# 1. Clone
git clone https://github.com/rafa/abura-backend.git
cd abura-backend

# 2. Dependências
npm install

# 3. Ambiente
cp .env.example .env.development
# Edite .env.development com suas credenciais

# 4. Infraestrutura (Docker)
docker-compose up -d postgres redis

# 5. Banco de dados
npx prisma migrate dev
npx prisma db seed

# 6. Execute
npm run dev
```
## Estrutura do Repositório

```text
abura-backend/
├── src/
│   ├── config/                 ← Configurações de ambiente
│   │   ├── database.ts         ← Conexão PostgreSQL
│   │   ├── redis.ts            ← Conexão Redis
│   │   └── env.ts              ← Validação de variáveis de ambiente
│   │
│   ├── modules/                ← Domínios do negócio (arquitetura modular)
│   │   ├── ocorrencias/        ← Módulo: SGC + Protocolos
│   │   │   ├── entities/
│   │   │   │   └── Ocorrencia.ts
│   │   │   ├── controllers/
│   │   │   │   └── OcorrenciaController.ts
│   │   │   ├── services/
│   │   │   │   ├── CriarOcorrenciaService.ts
│   │   │   │   └── GerarProtocoloService.ts
│   │   │   ├── repositories/
│   │   │   │   └── OcorrenciaRepository.ts
│   │   │   ├── routes.ts
│   │   │   └── tests/
│   │   │       └── ocorrencia.spec.ts
│   │   │
│   │   ├── geolocalizacao/     ← Módulo: GPS, rotas, CCG
│   │   │   ├── services/
│   │   │   │   ├── CalcularRotaService.ts
│   │   │   │   └── ValidarCoordenadasService.ts
│   │   │   └── websocket/
│   │   │       └── RotaSocketHandler.ts
│   │   │
│   │   ├── regulacao/          ← Módulo: MED + Prioridades
│   │   │   ├── services/
│   │   │   │   └── AlgoritmoAFP.ts
│   │   │   └── entities/
│   │   │       └── Prioridade.ts
│   │   │
│   │   ├── notificacoes/       ← Módulo: SMS, Push
│   │   │   └── services/
│   │   │       └── EnviarSMSService.ts
│   │   │
│   │   └── usuarios/           ← Módulo: USR, autenticação
│   │       └── services/
│   │           └── ValidarDeepLinkService.ts
│   │
│   ├── shared/                 ← Código reutilizável
│   │   ├── errors/             ← Classes de erro customizadas
│   │   ├── middlewares/        ← Auth, logging, rate-limit
│   │   ├── utils/              ← Helpers (mascaraCPF, formatarTempo)
│   │   └── types/              ← Tipos TypeScript globais
│   │
│   ├── websocket/              ← Configuração central do WS
│   │   ├── index.ts            ← Inicialização Socket.io
│   │   ├── rooms/              ← Gerenciamento de salas (PA específico)
│   │   └── handlers/           ← Eventos: conectar, desconectar, atualizar-rota
│   │
│   ├── jobs/                   ← Filas background (Bull)
│   │   ├── queues/
│   │   │   └── smsQueue.ts
│   │   └── workers/
│   │       └── processarSMS.ts
│   │
│   └── server.ts               ← Entry point: Express + Socket.io
│
├── prisma/                     ← ORM + Migrations
│   ├── schema.prisma           ← Modelo de dados único
│   └── migrations/
│       └── 20260312000001_init/
│
├── tests/                      ← Testes e2e e integração
│   ├── integration/
│   │   └── criar-ocorrencia.test.ts
│   └── e2e/
│       └── fluxo-completo.test.ts
│
├── scripts/                    ← Utilitários
│   ├── seed.ts                 ← Dados iniciais para dev
│   └── generate-protocolo.ts   ← Teste de geração de PA
│
├── docker/                     ← Configs Docker específicas
│   ├── Dockerfile
│   ├── Dockerfile.dev          ← Hot-reload para desenvolvimento
│   └── entrypoint.sh
│
├── .github/
│   └── workflows/
│       ├── ci.yml              ← Testes em PR
│       └── deploy-staging.yml  ← Deploy automático
│
├── docker-compose.yml          ← Dev local completo
├── docker-compose.prod.yml     ← Produção (usar com caution)
├── .env.example                ← Template de variáveis
├── .env.development            ← Gitignored — crie do example
├── .gitignore
├── tsconfig.json
├── package.json
└── README.md
```
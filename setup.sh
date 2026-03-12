#!/bin/bash

# ─── CONFIG ───────────────────────────────────────────────────────────────────
set -e
echo "🚀 Criando estrutura do projeto abura-backend..."

# ─── SRC/CONFIG ───────────────────────────────────────────────────────────────
mkdir -p src/config
cat > src/config/database.ts << 'EOF'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export { prisma };
EOF

cat > src/config/redis.ts << 'EOF'
import { createClient } from "redis";

const redis = createClient({ url: process.env.REDIS_URL });

redis.on("error", (err) => console.error("Redis error:", err));

export { redis };
EOF

cat > src/config/env.ts << 'EOF'
import dotenv from "dotenv";
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 3000),
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  REDIS_URL: process.env.REDIS_URL ?? "",
};

if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not defined");
EOF

# ─── SRC/MODULES/OCORRENCIAS ──────────────────────────────────────────────────
mkdir -p src/modules/ocorrencias/{entities,controllers,services,repositories,tests}

cat > src/modules/ocorrencias/entities/Ocorrencia.ts << 'EOF'
export interface Ocorrencia {
  id: string;
  protocolo: string;
  descricao: string;
  status: string;
  criadoEm: Date;
}
EOF

cat > src/modules/ocorrencias/controllers/OcorrenciaController.ts << 'EOF'
import { Request, Response } from "express";

export class OcorrenciaController {
  async criar(req: Request, res: Response): Promise<void> {
    res.status(201).json({ message: "Ocorrência criada" });
  }
}
EOF

cat > src/modules/ocorrencias/services/CriarOcorrenciaService.ts << 'EOF'
export class CriarOcorrenciaService {
  async execute(data: unknown): Promise<void> {
    // TODO: implementar lógica de criação
  }
}
EOF

cat > src/modules/ocorrencias/services/GerarProtocoloService.ts << 'EOF'
export class GerarProtocoloService {
  execute(): string {
    return `PA-${Date.now()}`;
  }
}
EOF

cat > src/modules/ocorrencias/repositories/OcorrenciaRepository.ts << 'EOF'
export class OcorrenciaRepository {
  async findAll(): Promise<unknown[]> {
    return [];
  }
}
EOF

cat > src/modules/ocorrencias/routes.ts << 'EOF'
import { Router } from "express";
import { OcorrenciaController } from "./controllers/OcorrenciaController";

const router = Router();
const controller = new OcorrenciaController();

router.post("/", controller.criar);

export { router as ocorrenciasRouter };
EOF

cat > src/modules/ocorrencias/tests/ocorrencia.spec.ts << 'EOF'
describe("Ocorrencia", () => {
  it("deve criar uma ocorrência", () => {
    expect(true).toBe(true);
  });
});
EOF

# ─── SRC/MODULES/GEOLOCALIZACAO ───────────────────────────────────────────────
mkdir -p src/modules/geolocalizacao/{services,websocket}

cat > src/modules/geolocalizacao/services/CalcularRotaService.ts << 'EOF'
export class CalcularRotaService {
  execute(origem: string, destino: string): void {
    // TODO: integrar com API de rotas
  }
}
EOF

cat > src/modules/geolocalizacao/services/ValidarCoordenadasService.ts << 'EOF'
export class ValidarCoordenadasService {
  execute(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }
}
EOF

cat > src/modules/geolocalizacao/websocket/RotaSocketHandler.ts << 'EOF'
import { Socket } from "socket.io";

export function rotaSocketHandler(socket: Socket): void {
  socket.on("atualizar-rota", (data) => {
    // TODO: processar atualização de rota
  });
}
EOF

# ─── SRC/MODULES/REGULACAO ────────────────────────────────────────────────────
mkdir -p src/modules/regulacao/{services,entities}

cat > src/modules/regulacao/services/AlgoritmoAFP.ts << 'EOF'
export class AlgoritmoAFP {
  calcularPrioridade(dados: unknown): number {
    // TODO: implementar algoritmo AFP
    return 1;
  }
}
EOF

cat > src/modules/regulacao/entities/Prioridade.ts << 'EOF'
export enum Prioridade {
  VERMELHO = "VERMELHO",
  AMARELO = "AMARELO",
  VERDE = "VERDE",
  AZUL = "AZUL",
}
EOF

# ─── SRC/MODULES/NOTIFICACOES ─────────────────────────────────────────────────
mkdir -p src/modules/notificacoes/services

cat > src/modules/notificacoes/services/EnviarSMSService.ts << 'EOF'
export class EnviarSMSService {
  async execute(telefone: string, mensagem: string): Promise<void> {
    // TODO: integrar com provedor SMS
    console.log(`SMS para ${telefone}: ${mensagem}`);
  }
}
EOF

# ─── SRC/MODULES/USUARIOS ─────────────────────────────────────────────────────
mkdir -p src/modules/usuarios/services

cat > src/modules/usuarios/services/ValidarDeepLinkService.ts << 'EOF'
export class ValidarDeepLinkService {
  execute(token: string): boolean {
    // TODO: validar deep link JWT
    return !!token;
  }
}
EOF

# ─── SRC/SHARED ───────────────────────────────────────────────────────────────
mkdir -p src/shared/{errors,middlewares,utils,types}

# ─── SRC/WEBSOCKET ────────────────────────────────────────────────────────────
mkdir -p src/websocket/{rooms,handlers}

cat > src/websocket/index.ts << 'EOF'
import { Server } from "socket.io";
import { Server as HttpServer } from "http";

export function inicializarWebSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);
    socket.on("disconnect", () => console.log(`Cliente desconectado: ${socket.id}`));
  });

  return io;
}
EOF

# ─── SRC/JOBS ─────────────────────────────────────────────────────────────────
mkdir -p src/jobs/{queues,workers}

cat > src/jobs/queues/smsQueue.ts << 'EOF'
import Bull from "bull";

export const smsQueue = new Bull("sms", {
  redis: process.env.REDIS_URL,
});
EOF

cat > src/jobs/workers/processarSMS.ts << 'EOF'
import { smsQueue } from "../queues/smsQueue";

smsQueue.process(async (job) => {
  const { telefone, mensagem } = job.data;
  // TODO: processar envio de SMS
  console.log(`Processando SMS para ${telefone}`);
});
EOF

# ─── SRC/SERVER.TS ────────────────────────────────────────────────────────────
cat > src/server.ts << 'EOF'
import express from "express";
import http from "http";
import { env } from "./config/env";
import { inicializarWebSocket } from "./websocket";
import { ocorrenciasRouter } from "./modules/ocorrencias/routes";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/ocorrencias", ocorrenciasRouter);

const server = http.createServer(app);
inicializarWebSocket(server);

server.listen(env.PORT, () => {
  console.log(`✅ Servidor rodando na porta ${env.PORT}`);
});
EOF

# ─── PRISMA ───────────────────────────────────────────────────────────────────
mkdir -p prisma/migrations/20260312000001_init

cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// TODO: adicionar models (Ocorrencia, Usuario, etc.)
EOF

# ─── TESTS ────────────────────────────────────────────────────────────────────
mkdir -p tests/{integration,e2e}

cat > tests/integration/criar-ocorrencia.test.ts << 'EOF'
describe("Criar Ocorrência (integração)", () => {
  it("deve retornar 201 ao criar ocorrência", () => {
    expect(true).toBe(true);
  });
});
EOF

cat > tests/e2e/fluxo-completo.test.ts << 'EOF'
describe("Fluxo completo E2E", () => {
  it("deve completar o fluxo de atendimento", () => {
    expect(true).toBe(true);
  });
});
EOF

# ─── SCRIPTS ──────────────────────────────────────────────────────────────────
mkdir -p scripts

cat > scripts/seed.ts << 'EOF'
import { prisma } from "../src/config/database";

async function main(): Promise<void> {
  console.log("🌱 Seeding database...");
  // TODO: inserir dados iniciais
  await prisma.$disconnect();
}

main().catch(console.error);
EOF

cat > scripts/generate-protocolo.ts << 'EOF'
import { GerarProtocoloService } from "../src/modules/ocorrencias/services/GerarProtocoloService";

const service = new GerarProtocoloService();
console.log("Protocolo gerado:", service.execute());
EOF

# ─── DOCKER ───────────────────────────────────────────────────────────────────
mkdir -p docker

cat > docker/Dockerfile << 'EOF'
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["node", "dist/server.js"]
EOF

cat > docker/Dockerfile.dev << 'EOF'
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]
EOF

cat > docker/entrypoint.sh << 'EOF'
#!/bin/sh
set -e
echo "⏳ Aguardando banco de dados..."
npx prisma migrate deploy
echo "✅ Migrations aplicadas."
exec "$@"
EOF
chmod +x docker/entrypoint.sh

# ─── GITHUB ACTIONS ───────────────────────────────────────────────────────────
mkdir -p .github/workflows

cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npm run build
      - run: npm test
EOF

cat > .github/workflows/deploy-staging.yml << 'EOF'
name: Deploy Staging

on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to staging
        run: echo "TODO: configurar deploy"
EOF

# ─── ARQUIVOS RAIZ ────────────────────────────────────────────────────────────
cat > docker-compose.yml << 'EOF'
version: "3.9"

services:
  app:
    build:
      context: .
      dockerfile: docker/Dockerfile.dev
    ports:
      - "3000:3000"
    env_file: .env.development
    depends_on:
      - postgres
      - redis
    volumes:
      - .:/app
      - /app/node_modules

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: abura
      POSTGRES_PASSWORD: abura123
      POSTGRES_DB: abura_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
EOF

cat > docker-compose.prod.yml << 'EOF'
version: "3.9"

services:
  app:
    build:
      context: .
      dockerfile: docker/Dockerfile
    ports:
      - "3000:3000"
    env_file: .env
    restart: always
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: always

  redis:
    image: redis:7-alpine
    restart: always

volumes:
  pgdata:
EOF

cat > .env.example << 'EOF'
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://abura:abura123@localhost:5432/abura_db
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=seu_secret_aqui

# SMS (ex: Twilio)
SMS_ACCOUNT_SID=
SMS_AUTH_TOKEN=
SMS_FROM_NUMBER=
EOF

cat > .env.development << 'EOF'
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://abura:abura123@localhost:5432/abura_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev_secret_nao_usar_em_producao
EOF

cat > .gitignore << 'EOF'
node_modules/
dist

// ============================================================
// ARQUIVO: src/config/redis.ts
// DESCRIÇÃO: Configuração do Redis — nosso "caderno de anotações rápido".
// Dados aqui desaparecem se o servidor reiniciar, mas acesso é 100x mais rápido.
// ============================================================

// ioredis é cliente moderno e robusto para Redis
import Redis from 'ioredis';

// Variável que guardará nossa conexão Redis
// Inicialmente undefined — só criamos quando chamamos a função de conexão
let clienteRedis: Redis | undefined;

// Função que conecta no Redis, com fallback gracioso se falhar
export async function conectarRedis(): Promise<void> {
  try {
    // Criamos cliente com URL de conexão
    // REDIS_URL vem de variável de ambiente; padrão é localhost
    clienteRedis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      // Número de tentativas de reconexão automática
      retryStrategy: (tentativa) => Math.min(tentativa * 50, 2000),
      // Tempo máximo para considerar que a conexão morreu
      maxRetriesPerRequest: 3,
    });

    // Evento: quando conecta com sucesso
    clienteRedis.on('connect', () => {
      console.log('🟢 Redis conectado');
    });

    // Evento: quando há erro (mas tenta reconectar automaticamente)
    clienteRedis.on('error', (erro) => {
      console.warn('🟡 Erro no Redis (tentando reconectar):', erro.message);
    });

    // Testamos com um "ping" — Redis deve responder "PONG"
    await clienteRedis.ping();
    
  } catch (erro) {
    // Redis é opcional para MVP — logamos erro mas não travamos o servidor
    console.error('🔴 Redis indisponível. Cache e tempo real desabilitados:', erro);
    clienteRedis = undefined;
  }
}

// Função que retorna o cliente Redis, ou null se não conectou
// Outras partes do código usam isso para decidir: "tenho cache disponível?"
export function obterClienteRedis(): Redis | undefined {
  return clienteRedis;
}
// Configuração da conexão com PostgreSQL + PostGIS
// PostGIS permite o banco entender mapas, coordenadas e calcular distâncias

import { PrismaClient } from '@prisma/client';

// Criamos uma única instância do Prisma para toda a aplicação
// Singleton pattern: evita múltiplas conexões desnecessárias com o banco
const prismaClient = new PrismaClient({
  // Em desenvolvimento, mostra as queries SQL no console (útil para aprender)
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

// Função que tenta conectar no banco com retry automático
// Sistema de emergência não pode desistir na primeira falha de rede
export async function conectarBancoDeDados(): Promise<void> {
  const maximoTentativas = 5;
  const tempoEntreTentativas = 3000; // 3 segundos

  for (let tentativa = 1; tentativa <= maximoTentativas; tentativa++) {
    try {
      // Tenta estabelecer conexão física TCP
      await prismaClient.$connect();
      
      // Testa com query simples para confirmar que está respondendo
      await prismaClient.$queryRaw`SELECT 1 as teste`;
      
      console.log('✅ Banco de dados conectado');
      return;
      
    } catch (erro) {
      console.warn(`⚠️  Tentativa ${tentativa}/${maximoTentativas} falhou. Retentando...`);
      
      if (tentativa === maximoTentativas) {
        throw new Error(`Falha ao conectar após ${maximoTentativas} tentativas`);
      }
      
      // Espera antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, tempoEntreTentativas));
    }
  }
}

// Exportamos o cliente configurado para outros arquivos usarem
export { prismaClient as prisma };
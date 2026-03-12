// ============================================================
// ARQUIVO: src/config/database.ts
// DESCRIÇÃO: Configuração da conexão com PostgreSQL + PostGIS.
// PostGIS é a "extensão mágica" que permite o banco entender mapas e coordenadas.
// ============================================================

// Prisma é nosso ORM — tradutor entre código TypeScript e comandos SQL
// Pense nele como um intérprete: você fala em objetos, ele traduz para tabelas
import { PrismaClient } from '@prisma/client';

// Criamos uma única instância do cliente Prisma para toda a aplicação
// Singleton pattern: garantimos que não criamos múltiplas conexões desnecessárias
const clientePrisma = new PrismaClient({
  // Em desenvolvimento, mostra todas as queries SQL no console
  // Útil para aprender e debugar; desative em produção
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn'] : ['error'],
});

// Função que tenta conectar no banco, com retry automático
// Sistema de emergência não pode desistir na primeira falha de rede
export async function conectarBancoDeDados(): Promise<void> {
  // Número de tentativas antes de desistir
  const maximoDeTentativas = 5;
  // Tempo entre tentativas (em milissegundos) — 3 segundos
  const tempoEntreTentativas = 3000;

  for (let tentativaAtual = 1; tentativaAtual <= maximoDeTentativas; tentativaAtual++) {
    try {
      // $connect() estabelece a conexão física TCP com o PostgreSQL
      await clientePrisma.$connect();
      
      // Testamos se conseguimos fazer uma query simples
      await clientePrisma.$queryRaw`SELECT 1 as teste_de_conexao`;
      
      // Se chegamos aqui, deu certo! Retornamos e o servidor continua
      return;
      
    } catch (erroDeConexao) {
      console.warn(`⚠️  Tentativa ${tentativaAtual}/${maximoDeTentativas} falhou. Retentando em ${tempoEntreTentativas/1000}s...`);
      
      // Se era a última tentativa, jogamos o erro pra cima (quem chamou decide o que fazer)
      if (tentativaAtual === maximoDeTentativas) {
        throw new Error(`Falha ao conectar no banco após ${maximoDeTentativas} tentativas: ${erroDeConexao}`);
      }
      
      // Esperamos antes de tentar novamente
      // Promessa que resolve após o tempo definido
      await new Promise((resolve) => setTimeout(resolve, tempoEntreTentativas));
    }
  }
}

// Exportamos o cliente configurado para outros arquivos usarem
// Exemplo: controllers que precisam salvar ou buscar dados
export { clientePrisma };
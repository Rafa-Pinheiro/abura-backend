// Ponto de entrada da aplicação Abura

import dotenv from 'dotenv';
import path from 'path';

// Carrega variáveis de ambiente do arquivo correto
dotenv.config({ path: path.resolve(__dirname, '../.env.development') });

// DEBUG: Mostra se as variáveis foram carregadas
console.log('🔍 DEBUG - DATABASE_URL:', process.env.DATABASE_URL || 'NÃO CARREGADA');
console.log('🔍 DEBUG - NODE_ENV:', process.env.NODE_ENV || 'NÃO CARREGADA');

import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
app.use(express.json());

// Rota de saúde
app.get('/saude', (req, res) => {
  res.json({ status: 'ok', momento: new Date().toISOString() });
});

// Teste de conexão direta com o banco
app.get('/teste-banco', async (req, res) => {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    const resultado = await prisma.$queryRaw`SELECT 1 as teste`;
    res.json({ sucesso: true, resultado });
  } catch (erro: any) {
    res.status(500).json({ 
      sucesso: false, 
      erro: erro.message,
      codigo: erro.code,
      meta: erro.meta 
    });
  } finally {
    await prisma.$disconnect();
  }
});

async function iniciarServidor() {
  try {
    console.log('🔌 Testando conexão com banco...');
    
    const prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    
    // Tenta conectar com tratamento de erro detalhado
    try {
      await prisma.$connect();
      console.log('✅ Banco conectado com sucesso');
    } catch (erroDeConexao: any) {
      console.error('❌ ERRO DETALHADO DA CONEXÃO:');
      console.error('Mensagem:', erroDeConexao.message);
      console.error('Código:', erroDeConexao.code);
      console.error('Meta:', JSON.stringify(erroDeConexao.meta, null, 2));
      console.error('Stack:', erroDeConexao.stack);
      throw erroDeConexao; // Relança para parar o servidor
    }
    
    const PORTA = process.env.PORT || 3000;
    app.listen(PORTA, () => {
      console.log(`🚀 Servidor rodando na porta ${PORTA}`);
    });
    
  } catch (erro) {
    console.error('❌ Falha fatal ao iniciar:', erro);
    process.exit(1);
  }
}

iniciarServidor();
// Ponto de entrada da aplicação Abura
// Inicia servidor HTTP, conecta no banco e registra todas as rotas

import express from 'express';
import dotenv from 'dotenv';
import { conectarBancoDeDados } from './config/database';
import { rotasOcorrencias } from './modules/ocorrencias/routes';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Cria aplicação Express
const app = express();

// Middleware para entender JSON no corpo das requisições
app.use(express.json());

// Rota de saúde - verifica se servidor está vivo
// Usada por monitoramento e health checks
app.get('/saude', (req, res) => {
  res.json({ 
    status: 'ok', 
    momento: new Date().toISOString(),
    versao: '1.0.0'
  });
});

// Registra rotas do módulo de ocorrências
// Todas as rotas em rotasOcorrencias ficam prefixadas com /ocorrencias
app.use('/ocorrencias', rotasOcorrencias);

// Função principal que inicia tudo
async function iniciarServidor(): Promise<void> {
  try {
    // Conecta no PostgreSQL antes de aceitar requisições
    console.log('🔌 Conectando ao banco de dados...');
    await conectarBancoDeDados();

    // Inicia servidor HTTP
    const PORTA = process.env.PORT || 3000;
    app.listen(PORTA, () => {
      console.log(`🚀 Servidor Abura rodando na porta ${PORTA}`);
      console.log(`📡 Teste: http://localhost:${PORTA}/saude`);
    });

  } catch (erro) {
    console.error('❌ Falha ao iniciar:', erro);
    process.exit(1); // Encerra com erro se não conseguir conectar no banco
  }
}

// Executa a inicialização
iniciarServidor();
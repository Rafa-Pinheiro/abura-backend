// ============================================================
// ARQUIVO: src/server.ts
// DESCRIÇÃO: Ponto de entrada da aplicação. 
// Aqui nasce o servidor que atenderá todas as chamadas de emergência.
// ============================================================

// Importamos o Express — biblioteca que cria o servidor web
// Pense nele como o "recepcionista" que direciona cada solicitação para o lugar certo
import express from 'express';

// Importamos o HTTP nativo do Node.js — necessário para o WebSocket funcionar
// O WebSocket precisa "grudar" no servidor HTTP para manter conexões abertas
import { createServer } from 'http';

// Importamos o Socket.io — tecnologia que permite conversa em tempo real
// Usado para: ambulância avisando que chegou, usuário vendo tempo atualizar
import { Server } from 'socket.io';

// Importamos nossa configuração de banco de dados
// Sem isso, não conseguimos salvar ocorrências, protocolos, localizações
import { conectarBancoDeDados } from './config/database';

// Importamos nossa configuração do Redis — nosso "quadro de avisos" rápido
// Usado para: lembrar quem está online, filas de SMS, cache de rotas
import { conectarRedis } from './config/redis';

// Importamos as rotas da aplicação — os "caminhos" que a API oferece
// Exemplo: POST /ocorrencias (criar emergência), GET /protocolo/123 (consultar)
import { rotasOcorrencias } from './modules/ocorrencias/routes';

// Criamos a aplicação Express — nossa "recepção central"
const aplicacao = express();

// Criamos o servidor HTTP usando o Express como base
// Isso permite que tanto navegadores normais quanto WebSocket usem o mesmo "portão de entrada"
const servidorHTTP = createServer(aplicacao);

// Criamos o servidor de WebSocket (Socket.io) grudado no HTTP
// origins define quem pode conversar com nosso servidor (segurança básica)
const servidorWebSocket = new Server(servidorHTTP, {
  cors: {
    // Em produção, substitua pela URL real do seu frontend
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    methods: ['GET', 'POST'] // Apenas leitura e envio de dados
  }
});

// ============================================================
// CONFIGURAÇÃO INICIAL DO SERVIDOR
// ============================================================

// Faz o servidor entender JSON — formato de dados moderno e legível
// Sem isso, o servidor não entenderia quando enviamos { "nome": "Rafa", "idade": 30 }
aplicacao.use(express.json());

// ============================================================
// CONEXÃO COM SERVIÇOS EXTERNOS (BANCO E CACHE)
// ============================================================

// Função que inicia tudo — chamada quando o servidor "acorda"
async function iniciarServidor(): Promise<void> {
  try {
    // Tentamos conectar no PostgreSQL (banco de dados persistente)
    // Se falhar, o servidor não inicia — preferimos falhar logo que depois no meio de uma emergência
    console.log('🔌 Conectando ao banco de dados PostgreSQL...');
    await conectarBancoDeDados();
    console.log('✅ Banco de dados conectado com sucesso');

    // Tentamos conectar no Redis (memória rápida temporária)
    // Se falhar, avisamos mas continuamos — Redis é importante mas não essencial para salvar vidas
    console.log('🔌 Conectando ao Redis (cache)...');
    await conectarRedis();
    console.log('✅ Redis conectado com sucesso');

    // ============================================================
    // REGISTRO DAS ROTAS DA API
    // ============================================================
    
    // Toda chamada que começa com /ocorrencias vai para o arquivo de rotas de ocorrências
    // Exemplo: POST http://localhost:3000/ocorrencias (cria nova emergência)
    aplicacao.use('/ocorrencias', rotasOcorrencias);

    // Rota de "está vivo?" — usada por ferramentas de monitoramento
    // Se retornar 200, o servidor está saudável
    aplicacao.get('/saude', (requisicao, resposta) => {
      resposta.json({ 
        status: 'ok', 
        momento: new Date().toISOString(),
        versao: '1.0.0' 
      });
    });

    // ============================================================
    // CONFIGURAÇÃO DO WEBSOCKET (TEMPO REAL)
    // ============================================================
    
    // Quando alguém (app do usuário ou painel da ambulância) conecta
    servidorWebSocket.on('connection', (socketDoCliente) => {
      // Cada conexão tem um ID único — como um "crachá digital"
      console.log(`🟢 Nova conexão WebSocket: ${socketDoCliente.id}`);

      // Quando o cliente diz "estou acompanhando o protocolo ABURA-2026-00001"
      socketDoCliente.on('acompanhar_protocolo', (numeroDoProtocolo: string) => {
        // "Entramos na sala" específica desse protocolo
        // Assim, apenas quem tem interesse nessa ocorrência recebe atualizações
        socketDoCliente.join(`protocolo:${numeroDoProtocolo}`);
        console.log(`👥 Cliente ${socketDoCliente.id} entrou na sala ${numeroDoProtocolo}`);
      });

      // Quando o cliente desconecta (fecha app, perde internet, etc)
      socketDoCliente.on('disconnect', () => {
        console.log(`🔴 Conexão encerrada: ${socketDoCliente.id}`);
      });
    });

    // ============================================================
    // INICIALIZAÇÃO DO SERVIDOR HTTP
    // ============================================================
    
    // A porta onde o servidor "escuta" — 3000 é padrão de desenvolvimento
    // Em produção, vem da variável de ambiente PORT
    const portaDeEscuta = process.env.PORT || 3000;

    // "Ligamos o servidor" — ele começa a aceitar conexões
    servidorHTTP.listen(portaDeEscuta, () => {
      console.log(`🚀 Servidor Abura rodando na porta ${portaDeEscuta}`);
      console.log(`📡 API REST: http://localhost:${portaDeEscuta}`);
      console.log(`⚡ WebSocket: ws://localhost:${portaDeEscuta}`);
    });

  } catch (erro) {
    // Se qualquer conexão essencial falhar, mostramos o erro e paramos
    // Não queremos um servidor "meio ligado" em sistema de emergência
    console.error('❌ Falha ao iniciar servidor:', erro);
    process.exit(1); // Código 1 = erro, encerra o processo
  }
}

// Chamamos a função que inicia tudo
// O "void" diz ao TypeScript: "não precisamos esperar resposta, confiamos que vai rodar"
iniciarServidor();
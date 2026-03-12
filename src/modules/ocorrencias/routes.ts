// ============================================================
// ARQUIVO: src/modules/ocorrencias/routes.ts
// DESCRIÇÃO: Define os "caminhos" disponíveis para criar e gerenciar ocorrências.
// Cada rota é como um "botão" que o frontend pode apertar.
// ============================================================

// Router do Express cria grupos de rotas organizados
import { Router } from 'express';

// Importamos a função que cria uma nova ocorrência no banco
// Separamos a lógica em "service" para manter as rotas enxutas
import { criarNovaOcorrencia } from './services/CriarOcorrenciaService';

// Criamos o roteador específico para ocorrências
const rotas = Router();

// ============================================================
// ROTA: POST /ocorrencias
// DESCRIÇÃO: Cria uma nova emergência no sistema.
// QUEM CHAMA: Operador da Central (OPR) ou sistema automatizado.
// ============================================================
rotas.post('/', async (requisicao, resposta) => {
  try {
    // Extrai os dados enviados no corpo da requisição
    // Esperamos: nomeDoSolicitante, telefone, descricaoDaEmergencia, etc
    const dadosDaOcorrencia = requisicao.body;

    // Chamamos o serviço que faz o trabalho pesado:
    // - Gera número de protocolo único
    // - Salva no banco de dados
    // - Dispara SMS (se configurado)
    // - Retorna o objeto completo criado
    const ocorrenciaCriada = await criarNovaOcorrencia(dadosDaOcorrencia);

    // Retornamos sucesso com código HTTP 201 (Created)
    // Incluímos o protocolo gerado — essencial para o usuário acompanhar
    return resposta.status(201).json({
      sucesso: true,
      mensagem: 'Ocorrência registrada com sucesso',
      dados: {
        protocoloDeAtendimento: ocorrenciaCriada.protocolo,
        numeroDeIdentificacao: ocorrenciaCriada.id,
        horaDeRegistro: ocorrenciaCriada.criadoEm
      }
    });

  } catch (erro) {
    // Se algo deu errado (banco offline, dados inválidos, etc), retornamos erro estruturado
    console.error('Erro ao criar ocorrência:', erro);
    
    return resposta.status(500).json({
      sucesso: false,
      mensagem: 'Falha ao registrar ocorrência. Tente novamente ou contate o suporte técnico.',
      // Em desenvolvimento, incluímos detalhes; em produção, omitimos por segurança
      detalhes: process.env.NODE_ENV === 'development' ? String(erro) : undefined
    });
  }
});

// ============================================================
// ROTA: GET /ocorrencias/:protocolo/validacao
// DESCRIÇÃO: Verifica se um protocolo existe e está aguardando atendimento.
// QUEM CHAMA: App do usuário quando clica no link do SMS.
// ============================================================
rotas.get('/:protocolo/validacao', async (requisicao, resposta) => {
  try {
    // Capturamos o número do protocolo da URL
    // Exemplo: /ocorrencias/ABURA-2026-00001/validacao
    const numeroDoProtocolo = requisicao.params.protocolo;

    // TODO: Implementar busca no banco de dados
    // Por enquanto, retornamos mock para teste de integração
    
    // Simulação: protocolo existe e está aguardando
    const dadosSimulados = {
      protocolo: numeroDoProtocolo,
      status: 'aguardando_atendimento',
      // Mascaramos CPF: apenas últimos 3 dígitos visíveis
      identificacaoMascarada: '***.***.123-**',
      primeiroNome: 'RAFA...',
      tipoDeOcorrencia: 'Médica - Respiratória',
      // Indica se já está vinculado a outro celular (evita hijack)
      jaVinculado: false
    };

    return resposta.json({
      sucesso: true,
      valido: true,
      dados: dadosSimulados
    });

  } catch (erro) {
    return resposta.status(500).json({
      sucesso: false,
      valido: false,
      mensagem: 'Erro ao validar protocolo'
    });
  }
});

// Exportamos as rotas configuradas para o servidor principal usar
export { rotas as rotasOcorrencias };
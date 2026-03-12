// Rotas do módulo de ocorrências (SGC - Sistema de Gestão de Chamados)
// Define os "caminhos" que a API oferece para criar e gerenciar emergências

import { Router } from 'express';
import { prisma } from '../../config/database';

const rotas = Router();

// POST /ocorrencias - Cria uma nova emergência no sistema
// Quem chama: Operador da Central (OPR) ou sistema automatizado
rotas.post('/', async (req, res) => {
  try {
    const dados = req.body;

    // Validação mínima dos dados obrigatórios
    if (!dados.nome || !dados.telefone || !dados.descricao) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Nome, telefone e descrição são obrigatórios'
      });
    }

    // Gera protocolo único: ABURA-2026-XXXXX
    const ano = new Date().getFullYear();
    const sequencial = Math.floor(Math.random() * 90000) + 10000;
    const protocolo = `ABURA-${ano}-${sequencial}`;

    // Cria a ocorrência no banco de dados
    const ocorrencia = await prisma.ocorrencia.create({
      data: {
        protocoloDeAtendimento: protocolo,
        hashDoCPF: dados.cpf ? await hashCPF(dados.cpf) : 'nao-informado',
        nomeDoSolicitante: dados.nome,
        idade: dados.idade || 0,
        telefone: dados.telefone,
        descricaoDaEmergencia: dados.descricao,
        sintomas: dados.sintomas || [],
        comorbidades: dados.comorbidades || [],
        status: 'aguardando_regulacao_medica',
      }
    });

    // TODO: Disparar SMS com deep link (implementar na fase 2)

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Ocorrência registrada com sucesso',
      dados: {
        protocolo: ocorrencia.protocoloDeAtendimento,
        id: ocorrencia.id,
        criadoEm: ocorrencia.criadoEm
      }
    });

  } catch (erro) {
    console.error('Erro ao criar ocorrência:', erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao registrar ocorrência'
    });
  }
});

// GET /ocorrencias/:protocolo/validacao - Valida se protocolo existe
// Quem chama: App do USR quando clica no link do SMS
rotas.get('/:protocolo/validacao', async (req, res) => {
  try {
    const { protocolo } = req.params;

    const ocorrencia = await prisma.ocorrencia.findUnique({
      where: { protocoloDeAtendimento: protocolo }
    });

    if (!ocorrencia) {
      return res.status(404).json({
        sucesso: false,
        valido: false,
        mensagem: 'Protocolo não encontrado'
      });
    }

    // Retorna dados parciais para confirmação de identidade
    return res.json({
      sucesso: true,
      valido: true,
      dados: {
        protocolo: ocorrencia.protocoloDeAtendimento,
        status: ocorrencia.status,
        // Mascaramos CPF: apenas últimos 3 dígitos visíveis
        identificacaoMascarada: ocorrencia.hashDoCPF !== 'nao-informado' 
          ? `***.***.${ocorrencia.hashDoCPF.slice(-3)}` 
          : '***.***.***',
        primeiroNome: ocorrencia.nomeDoSolicitante.split(' ')[0] + '...',
        tipoDeOcorrencia: 'Médica - Respiratória', // TODO: categorizar
        jaVinculado: false // TODO: implementar vinculação de dispositivo
      }
    });

  } catch (erro) {
    console.error('Erro ao validar protocolo:', erro);
    return res.status(500).json({
      sucesso: false,
      valido: false,
      mensagem: 'Erro interno na validação'
    });
  }
});

// Função auxiliar: protege CPF com hash simples (substituir por bcrypt em produção)
async function hashCPF(cpf: string): Promise<string> {
  // Remove pontos e traço
  const limpo = cpf.replace(/[^\d]/g, '');
  // Hash simples para MVP (em produção: use bcrypt ou argon2)
  return `hash_${limpo.slice(0, 3)}...${limpo.slice(-3)}`;
}

export { rotas as rotasOcorrencias };
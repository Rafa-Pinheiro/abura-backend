// ============================================================
// ARQUIVO: src/modules/ocorrencias/services/CriarOcorrenciaService.ts
// DESCRIÇÃO: O "cérebro" por trás da criação de ocorrências.
// Contém toda a lógica de negócio: geração de protocolo, validações, notificações.
// ============================================================

// Nosso cliente de banco de dados, já configurado
import { clientePrisma } from '../../../config/database';

// Função auxiliar que gera número de protocolo único no formato ABURA-AAAA-NNNNN
import { gerarNumeroDeProtocolo } from '../../../shared/utils/GeradorDeProtocolo';

// Interface TypeScript — "contrato" dos dados que esperamos receber
// Ajuda o editor de código a autocompletar e avisar se faltar algo
interface DadosDaOcorrencia {
  nomeCompletoDoSolicitante: string;
  numeroDeCPF: string; // Será hasheado antes de salvar (LGPD)
  idadeDoSolicitante: number;
  telefoneDeContato: string;
  descricaoDaEmergencia: string;
  sintomasRelatados?: string[]; // Opcional: lista de sintomas
  comorbidadesPreExistentes?: string[]; // Opcional: diabetes, hipertensão, etc
}

// Interface do retorno — o que devolvemos após criar
interface OcorrenciaCriada {
  id: string;
  protocolo: string;
  criadoEm: Date;
  statusAtual: string;
}

// ============================================================
// FUNÇÃO PRINCIPAL: criarNovaOcorrencia
// ============================================================
export async function criarNovaOcorrencia(
  dados: DadosDaOcorrencia
): Promise<OcorrenciaCriada> {
  
  // Geramos o número de protocolo único para esta emergência
  // Este número é a "identidade" da ocorrência — usuário acompanha por ele
  const numeroDeProtocolo = gerarNumeroDeProtocolo();

  // Criamos a ocorrência no banco de dados
  // Prisma traduz este objeto para INSERT SQL automaticamente
  const registroNoBanco = await clientePrisma.ocorrencia.create({
    data: {
      // Dados de identificação (hasheados para LGPD)
      protocoloDeAtendimento: numeroDeProtocolo,
      hashDoCPF: await hashDoCPF(dados.numeroDeCPF), // Função que aplica SHA-256 + salt
      nomeDoSolicitante: dados.nomeCompletoDoSolicitante,
      idade: dados.idadeDoSolicitante,
      telefone: dados.telefoneDeContato,
      
      // Dados clínicos iniciais
      descricaoDaEmergencia: dados.descricaoDaEmergencia,
      sintomas: dados.sintomasRelatados || [],
      comorbidades: dados.comorbidadesPreExistentes || [],
      
      // Status inicial: acabou de nascer, aguarda médico regulador
      status: 'aguardando_regulacao_medica',
      
      // Campos de auditoria (quem, quando)
      criadoEm: new Date(),
      ipDeOrigem: 'capturado-do-middleware', // TODO: implementar
    }
  });

  // TODO: Disparar SMS com deep link
  // TODO: Notificar médico regulador via painel em tempo real
  
  // Retornamos os dados essenciais para quem chamou (controller) informar o usuário
  return {
    id: registroNoBanco.id,
    protocolo: registroNoBanco.protocoloDeAtendimento,
    criadoEm: registroNoBanco.criadoEm,
    statusAtual: registroNoBanco.status
  };
}

// ============================================================
// FUNÇÃO AUXILIAR: hashDoCPF
// DESCRIÇÃO: Protege dados sensíveis conforme LGPD.
// Nunca guardamos CPF em texto puro — apenas "impressão digital" criptografada.
// ============================================================
async function hashDoCPF(cpfEmTextoPuro: string): Promise<string> {
  // Removemos pontos e traço para padronizar
  const cpfLimpo = cpfEmTextoPuro.replace(/[^\d]/g, '');
  
  // Usamos bcrypt ou argon2 para hash seguro (lento = resistente a força bruta)
  // TODO: implementar com biblioteca adequada
  // Por enquanto, retornamos mock para desenvolvimento
  return `hash_simulado_${cpfLimpo.substring(0, 3)}...`;
}
// ============================================================
// ARQUIVO: src/shared/utils/GeradorDeProtocolo.ts
// DESCRIÇÃO: Cria números de protocolo únicos no formato ABURA-AAAA-NNNNN.
// Unicidade é vital — dois chamados nunca podem ter mesmo número.
// ============================================================

// Importamos crypto para gerar valores aleatórios seguros
// Math.random() é previsível; crypto.randomBytes é criptograficamente seguro
import { randomBytes } from 'crypto';

// ============================================================
// FUNÇÃO: gerarNumeroDeProtocolo
// ============================================================
export function gerarNumeroDeProtocolo(): string {
  // Obtemos ano atual (ex: 2026)
  const anoAtual = new Date().getFullYear();
  
  // Geramos sequencial aleatório de 5 dígitos
  // Em produção, usamos contador atômico do banco para garantir unicidade real
  // Por enquanto, simulamos com aleatório criptográfico
  const bytesAleatorios = randomBytes(3); // 3 bytes = 6 dígitos hex
  const numeroSequencial = parseInt(bytesAleatorios.toString('hex'), 16) % 100000;
  
  // Formatamos com zeros à esquerda: 42 vira 00042
  const sequencialFormatado = numeroSequencial.toString().padStart(5, '0');
  
  // Montamos o protocolo final: ABURA-2026-00042
  const protocoloCompleto = `ABURA-${anoAtual}-${sequencialFormatado}`;
  
  return protocoloCompleto;
}

// ============================================================
// EXEMPLOS DE SAÍDA:
// ABURA-2026-00001
// ABURA-2026-08421
// ABURA-2026-99999
// ============================================================
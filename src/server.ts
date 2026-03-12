import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

// Cria aplicação Express
const app = express();
const prisma = new PrismaClient();

// Middleware para entender JSON
app.use(express.json());

// Rota de saúde — testa se servidor está vivo
app.get('/saude', (req, res) => {
  res.json({ status: 'ok', momento: new Date().toISOString() });
});

// Rota POST /ocorrencias — cria nova emergência
app.post('/ocorrencias', async (req, res) => {
  try {
    const dados = req.body;
    
    // Gera protocolo simples (mock)
    const ano = new Date().getFullYear();
    const sequencial = Math.floor(Math.random() * 90000) + 10000;
    const protocolo = `ABURA-${ano}-${sequencial}`;

    // Salva no banco
    const ocorrencia = await prisma.ocorrencia.create({
      data: {
        protocoloDeAtendimento: protocolo,
        hashDoCPF: dados.cpf || 'hash-temporario',
        nomeDoSolicitante: dados.nome,
        idade: dados.idade || 0,
        telefone: dados.telefone,
        descricaoDaEmergencia: dados.descricao,
        sintomas: dados.sintomas || [],
        comorbidades: dados.comorbidades || [],
      }
    });

    res.status(201).json({
      sucesso: true,
      protocolo: ocorrencia.protocoloDeAtendimento,
      id: ocorrencia.id
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ sucesso: false, erro: 'Erro ao criar ocorrência' });
  }
});

// Inicia servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Abura rodando na porta ${PORT}`);
});
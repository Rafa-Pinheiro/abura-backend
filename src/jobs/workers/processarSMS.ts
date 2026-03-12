import { smsQueue } from "../queues/smsQueue";

smsQueue.process(async (job) => {
  const { telefone, mensagem } = job.data;
  // TODO: processar envio de SMS
  console.log(`Processando SMS para ${telefone}`);
});

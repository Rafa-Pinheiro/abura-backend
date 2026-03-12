export class EnviarSMSService {
  async execute(telefone: string, mensagem: string): Promise<void> {
    // TODO: integrar com provedor SMS
    console.log(`SMS para ${telefone}: ${mensagem}`);
  }
}

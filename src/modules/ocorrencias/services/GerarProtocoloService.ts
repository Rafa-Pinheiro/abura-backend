export class GerarProtocoloService {
  execute(): string {
    return `PA-${Date.now()}`;
  }
}

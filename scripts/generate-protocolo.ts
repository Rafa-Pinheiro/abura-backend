import { GerarProtocoloService } from "../src/modules/ocorrencias/services/GerarProtocoloService";

const service = new GerarProtocoloService();
console.log("Protocolo gerado:", service.execute());

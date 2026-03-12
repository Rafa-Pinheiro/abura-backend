import { Socket } from "socket.io";

export function rotaSocketHandler(socket: Socket): void {
  socket.on("atualizar-rota", (data) => {
    // TODO: processar atualização de rota
  });
}

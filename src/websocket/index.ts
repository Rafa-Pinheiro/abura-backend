import { Server } from "socket.io";
import { Server as HttpServer } from "http";

export function inicializarWebSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);
    socket.on("disconnect", () => console.log(`Cliente desconectado: ${socket.id}`));
  });

  return io;
}

import { Request, Response } from "express";

export class OcorrenciaController {
  async criar(req: Request, res: Response): Promise<void> {
    res.status(201).json({ message: "Ocorrência criada" });
  }
}

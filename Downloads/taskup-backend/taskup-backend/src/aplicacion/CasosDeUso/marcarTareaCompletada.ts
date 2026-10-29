import { Tarea } from "../../dominio/entidades/tarea";
import { RepositorioTareas } from "../../dominio/puertos/repositorioTarea";

export class MarcarTareaCompletada {
  constructor(private repositorioTareas: RepositorioTareas) {}

  async ejecutar(id: string, completada: boolean): Promise<Tarea> {
    const tarea = await this.repositorioTareas.buscarPorId(id);
    if (!tarea) {
      throw new Error("Tarea no encontrada");
    }
    return this.repositorioTareas.marcarComoCompletada(id, completada);
  }
}
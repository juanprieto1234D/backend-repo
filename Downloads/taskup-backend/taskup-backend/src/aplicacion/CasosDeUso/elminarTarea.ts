import { RepositorioTareas } from "../../dominio/puertos/repositorioTarea";

export class EliminarTarea {
  constructor(private repositorioTareas: RepositorioTareas) {}

  async ejecutar(id: string): Promise<void> {
    const tarea = await this.repositorioTareas.buscarPorId(id);
    if (!tarea) {
      throw new Error("Tarea no encontrada");
    }
    return this.repositorioTareas.eliminar(id);
  }
}
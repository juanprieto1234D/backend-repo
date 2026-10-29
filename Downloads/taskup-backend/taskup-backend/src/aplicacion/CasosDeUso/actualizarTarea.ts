import { Tarea } from "../../dominio/entidades/tarea";
import { RepositorioTareas } from "../../dominio/puertos/repositorioTarea";

export class ActualizarTarea {
  constructor(private repositorioTareas: RepositorioTareas) {}

  async ejecutar(id: string, datos: Partial<{ titulo: string; descripcion: string | null; fechaLimite: Date | null }>): Promise<Tarea> {
    const tarea = await this.repositorioTareas.buscarPorId(id);
    if (!tarea) {
      throw new Error("Tarea no encontrada");
    }
    return this.repositorioTareas.actualizar(id, datos);
  }
}
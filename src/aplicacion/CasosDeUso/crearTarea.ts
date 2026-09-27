import { randomUUID } from "crypto";
import { Tarea } from "../../dominio/entidades/tarea";
import { RepositorioTareas } from "../../dominio/puertos/repositorioTarea";

export class CrearTarea {
  constructor(private repositorioTareas: RepositorioTareas) {}

  async ejecutar(titulo: string, descripcion: string | null, fechaLimite: Date | null, usuarioId: string): Promise<Tarea> {
    const nuevaTarea = new Tarea(
      randomUUID(),
      titulo,
      descripcion,
      false,
      fechaLimite,
      new Date(),
      usuarioId
    );
    return this.repositorioTareas.crear(nuevaTarea);
  }
}
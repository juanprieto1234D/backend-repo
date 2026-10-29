import { Tarea } from "../../dominio/entidades/tarea";
import { RepositorioTareas } from "../../dominio/puertos/repositorioTarea";

export class ListarTareas {
  constructor(private repositorioTareas: RepositorioTareas) {}

  async ejecutar(usuarioId: string): Promise<Tarea[]> {
    return this.repositorioTareas.listarPorUsuario(usuarioId);
  }
}
import { Materia } from "../../dominio/entidades/materia";
import { RepositorioMaterias } from "../../dominio/puertos/repositorioMateria";

export class ListarMaterias {
  constructor(private repositorioMaterias: RepositorioMaterias) {}

  async ejecutar(usuarioId: string): Promise<Materia[]> {
    return this.repositorioMaterias.listarPorUsuario(usuarioId);
  }
}

import { RepositorioMaterias } from "../../dominio/puertos/repositorioMateria";

export class EliminarMateria {
  constructor(private repositorioMaterias: RepositorioMaterias) {}

  async ejecutar(id: string): Promise<void> {
    const materia = await this.repositorioMaterias.buscarPorId(id);
    if (!materia) {
      throw new Error("Materia no encontrada");
    }
    // Las tareas NO se borran: su materiaId queda en null (SetNull de Prisma).
    await this.repositorioMaterias.eliminar(id);
  }
}

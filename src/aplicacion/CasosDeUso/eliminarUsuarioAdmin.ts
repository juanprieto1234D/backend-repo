import { RepositorioUsuarios } from "../../dominio/puertos/repositorioUsuario";
import { RepositorioTareas } from "../../dominio/puertos/repositorioTarea";

export class EliminarUsuarioAdmin {
  constructor(
    private repositorioUsuarios: RepositorioUsuarios,
    private repositorioTareas: RepositorioTareas
  ) {}

  async ejecutar(id: string, adminId: string): Promise<void> {
    if (id === adminId) {
      throw new Error("Un administrador no puede eliminarse a sí mismo");
    }

    const usuario = await this.repositorioUsuarios.buscarPorId(id);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    // 1. Eliminar tareas del usuario primero (sin cascade en BD)
    await this.repositorioTareas.eliminarPorUsuario(id);

    // 2. Eliminar el usuario
    await this.repositorioUsuarios.eliminar(id);
  }
}

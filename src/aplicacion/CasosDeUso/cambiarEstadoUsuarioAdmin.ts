import { RepositorioUsuarios } from "../../dominio/puertos/repositorioUsuario";
import { DetalleUsuarioAdmin } from "./obtenerDetalleUsuarioAdmin";

export class CambiarEstadoUsuarioAdmin {
  constructor(private repositorioUsuarios: RepositorioUsuarios) {}

  async ejecutar(id: string, activo: boolean, adminId: string): Promise<DetalleUsuarioAdmin> {
    if (id === adminId) {
      throw new Error("Un administrador no puede modificar el estado de su propia cuenta");
    }

    const usuario = await this.repositorioUsuarios.buscarPorId(id);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    const actualizado = await this.repositorioUsuarios.actualizarEstado(id, activo);

    return {
      id: actualizado.id,
      correo: actualizado.correo,
      nombre: actualizado.nombre,
      rol: actualizado.rol,
      activo: actualizado.activo,
      creadoEn: actualizado.creadoEn,
    };
  }
}

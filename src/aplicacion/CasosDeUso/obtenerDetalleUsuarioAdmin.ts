import { RepositorioUsuarios } from "../../dominio/puertos/repositorioUsuario";

export interface DetalleUsuarioAdmin {
  id: string;
  correo: string;
  nombre: string;
  rol: string;
  activo: boolean;
  creadoEn: Date;
}

export class ObtenerDetalleUsuarioAdmin {
  constructor(private repositorioUsuarios: RepositorioUsuarios) {}

  async ejecutar(id: string): Promise<DetalleUsuarioAdmin> {
    const usuario = await this.repositorioUsuarios.buscarPorId(id);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    return {
      id: usuario.id,
      correo: usuario.correo,
      nombre: usuario.nombre,
      rol: usuario.rol,
      activo: usuario.activo,
      creadoEn: usuario.creadoEn,
    };
  }
}

import { RepositorioUsuarios } from "../../dominio/puertos/repositorioUsuario";

export interface UsuarioResumenAdmin {
  id: string;
  correo: string;
  nombre: string;
  rol: string;
  activo: boolean;
  creadoEn: Date;
  cantidadTareas: number;
}

export class ListarUsuariosAdmin {
  constructor(private repositorioUsuarios: RepositorioUsuarios) {}

  async ejecutar(buscar?: string): Promise<UsuarioResumenAdmin[]> {
    const usuarios = await this.repositorioUsuarios.listar(buscar);
    return usuarios.map((u) => ({
      id: u.id,
      correo: u.correo,
      nombre: u.nombre,
      rol: u.rol,
      activo: u.activo,
      creadoEn: u.creadoEn,
      cantidadTareas: u.cantidadTareas,
    }));
  }
}

import { Usuario } from "../entidades/usuario";

export interface UsuarioConTareasCount extends Usuario {
  cantidadTareas: number;
}

export interface RepositorioUsuarios {
  buscarPorCorreo(correo: string): Promise<Usuario | null>;
  buscarPorId(id: string): Promise<Usuario | null>;
  crear(usuario: Usuario): Promise<Usuario>;
  actualizarEstado(id: string, activo: boolean): Promise<Usuario>;
  actualizarContrasena(id: string, contrasena: string): Promise<void>;
  eliminar(id: string): Promise<void>;
  listar(buscar?: string): Promise<UsuarioConTareasCount[]>;
  contarTotal(): Promise<number>;
  contarRegistradosDesde(fecha: Date): Promise<number>;
}
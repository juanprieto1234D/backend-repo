import { Usuario } from "../entidades/usuario";

export interface RepositorioUsuarios {
  buscarPorCorreo(correo: string): Promise<Usuario | null>;
  crear(usuario: Usuario): Promise<Usuario>;
}
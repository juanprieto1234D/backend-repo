import { Materia } from "../entidades/materia";

export interface RepositorioMaterias {
  crear(materia: Materia): Promise<Materia>;
  listarPorUsuario(usuarioId: string): Promise<Materia[]>;
  buscarPorId(id: string): Promise<Materia | null>;
  buscarPorNombre(usuarioId: string, nombre: string): Promise<Materia | null>;
  actualizar(
    id: string,
    datos: Partial<{ nombre: string; color: string; icono: string }>
  ): Promise<Materia>;
  eliminar(id: string): Promise<void>;
}

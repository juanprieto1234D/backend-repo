import { Tarea } from "../entidades/tarea";

export interface RepositorioTareas {
  crear(tarea: Tarea): Promise<Tarea>;
  listarPorUsuario(usuarioId: string): Promise<Tarea[]>;
  buscarPorId(id: string): Promise<Tarea | null>;
  actualizar(id: string, datos: Partial<{ titulo: string; descripcion: string | null; fechaLimite: Date | null }>): Promise<Tarea>;
  eliminar(id: string): Promise<void>;
  marcarComoCompletada(id: string, completada: boolean): Promise<Tarea>;
}
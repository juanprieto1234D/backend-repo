import { randomUUID } from "crypto";
import { Materia } from "../../dominio/entidades/materia";
import { RepositorioMaterias } from "../../dominio/puertos/repositorioMateria";

const COLOR_POR_DEFECTO = "#6366F1";
const ICONO_POR_DEFECTO = "book-outline";

export class CrearMateria {
  constructor(private repositorioMaterias: RepositorioMaterias) {}

  async ejecutar(
    usuarioId: string,
    nombre: string,
    color?: string,
    icono?: string
  ): Promise<Materia> {
    if (!usuarioId) {
      throw new Error("El usuario es obligatorio");
    }

    const nombreLimpio = (nombre ?? "").trim();
    if (!nombreLimpio) {
      throw new Error("El nombre de la materia es obligatorio");
    }
    if (nombreLimpio.length > 60) {
      throw new Error("El nombre de la materia no puede pasar de 60 caracteres");
    }

    const existente = await this.repositorioMaterias.buscarPorNombre(usuarioId, nombreLimpio);
    if (existente) {
      throw new Error("Ya tienes una materia con ese nombre");
    }

    const nuevaMateria = new Materia(
      randomUUID(),
      nombreLimpio,
      color || COLOR_POR_DEFECTO,
      icono || ICONO_POR_DEFECTO,
      new Date(),
      usuarioId
    );

    return this.repositorioMaterias.crear(nuevaMateria);
  }
}

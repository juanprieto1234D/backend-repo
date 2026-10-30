import { Materia } from "../../dominio/entidades/materia";
import { RepositorioMaterias } from "../../dominio/puertos/repositorioMateria";

export class ActualizarMateria {
  constructor(private repositorioMaterias: RepositorioMaterias) {}

  async ejecutar(
    id: string,
    datos: Partial<{ nombre: string; color: string; icono: string }>
  ): Promise<Materia> {
    const materia = await this.repositorioMaterias.buscarPorId(id);
    if (!materia) {
      throw new Error("Materia no encontrada");
    }

    const cambios: Partial<{ nombre: string; color: string; icono: string }> = {};

    if (datos.nombre !== undefined) {
      const nombreLimpio = datos.nombre.trim();
      if (!nombreLimpio) {
        throw new Error("El nombre de la materia es obligatorio");
      }

      const repetida = await this.repositorioMaterias.buscarPorNombre(
        materia.usuarioId,
        nombreLimpio
      );
      if (repetida && repetida.id !== id) {
        throw new Error("Ya tienes una materia con ese nombre");
      }
      cambios.nombre = nombreLimpio;
    }

    if (datos.color !== undefined) {
      cambios.color = datos.color;
    }

    if (datos.icono !== undefined) {
      cambios.icono = datos.icono;
    }

    return this.repositorioMaterias.actualizar(id, cambios);
  }
}

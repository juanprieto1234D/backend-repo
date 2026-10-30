import { PrismaClient } from "@prisma/client";
import { Materia } from "../../dominio/entidades/materia";
import { RepositorioMaterias } from "../../dominio/puertos/repositorioMateria";

const prisma = new PrismaClient();

function convertir(materia: any): Materia {
  return new Materia(
    materia.id,
    materia.nombre,
    materia.color,
    materia.icono,
    materia.createdAt,
    materia.userId
  );
}

export class RepositorioMateriasPrisma implements RepositorioMaterias {
  async crear(materia: Materia): Promise<Materia> {
    const creada = await prisma.materia.create({
      data: {
        id: materia.id,
        nombre: materia.nombre,
        color: materia.color,
        icono: materia.icono,
        createdAt: materia.creadaEn,
        userId: materia.usuarioId,
      },
    });
    return convertir(creada);
  }

  async listarPorUsuario(usuarioId: string): Promise<Materia[]> {
    const materias = await prisma.materia.findMany({
      where: { userId: usuarioId },
      orderBy: { createdAt: "asc" },
    });
    return materias.map(convertir);
  }

  async buscarPorId(id: string): Promise<Materia | null> {
    const materia = await prisma.materia.findUnique({ where: { id } });
    return materia ? convertir(materia) : null;
  }

  async buscarPorNombre(usuarioId: string, nombre: string): Promise<Materia | null> {
    const materia = await prisma.materia.findFirst({
      where: {
        userId: usuarioId,
        nombre: { equals: nombre, mode: "insensitive" },
      },
    });
    return materia ? convertir(materia) : null;
  }

  async actualizar(
    id: string,
    datos: Partial<{ nombre: string; color: string; icono: string }>
  ): Promise<Materia> {
    const actualizada = await prisma.materia.update({
      where: { id },
      data: { nombre: datos.nombre, color: datos.color, icono: datos.icono },
    });
    return convertir(actualizada);
  }

  async eliminar(id: string): Promise<void> {
    await prisma.materia.delete({ where: { id } });
  }
}

import { PrismaClient } from "@prisma/client";
import { Tarea } from "../../dominio/entidades/tarea";
import { RepositorioTareas } from "../../dominio/puertos/repositorioTarea";

const prisma = new PrismaClient();

function convertir(tarea: any): Tarea {
  return new Tarea(
    tarea.id,
    tarea.title,
    tarea.description,
    tarea.completed,
    tarea.dueDate,
    tarea.createdAt,
    tarea.userId
  );
}

export class RepositorioTareasPrisma implements RepositorioTareas {
  async crear(tarea: any): Promise<Tarea> {
    const creada = await prisma.task.create({
      data: {
        id: tarea.id,
        title: tarea.titulo || tarea.title,
        description: tarea.descripcion || tarea.description || null,
        completed: tarea.completada ?? tarea.completed ?? false,
        dueDate: tarea.fechaLimite || tarea.dueDate || null,
        createdAt: tarea.creadaEn || tarea.createdAt || new Date(),
        userId: tarea.usuarioId || tarea.userId,
      },
    });

    return convertir(creada);
  }

  async listarPorUsuario(usuarioId: string): Promise<Tarea[]> {
    const tareas = await prisma.task.findMany({ where: { userId: usuarioId } });
    return tareas.map(convertir);
  }

  async buscarPorId(id: string): Promise<Tarea | null> {
    const tarea = await prisma.task.findUnique({ where: { id } });
    return tarea ? convertir(tarea) : null;
  }

  async actualizar(
    id: string,
    datos: Partial<{ titulo: string; descripcion: string | null; fechaLimite: Date | null }>
  ): Promise<Tarea> {
    const actualizada = await prisma.task.update({
      where: { id },
      data: {
        title: datos.titulo,
        description: datos.descripcion,
        dueDate: datos.fechaLimite,
      },
    });
    return convertir(actualizada);
  }

  async eliminar(id: string): Promise<void> {
    await prisma.task.delete({ where: { id } });
  }

  async marcarComoCompletada(id: string, completada: boolean): Promise<Tarea> {
    const actualizada = await prisma.task.update({
      where: { id },
      data: { completed: completada },
    });
    return convertir(actualizada);
  }
}
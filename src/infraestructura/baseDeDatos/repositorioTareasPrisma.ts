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
    tarea.userId,
    tarea.materiaId ?? null,
    tarea.adjuntos ?? []
  );
}

export class RepositorioTareasPrisma implements RepositorioTareas {
  async crear(tarea: Tarea): Promise<Tarea> {
    const creada = await prisma.task.create({
      data: {
        id: tarea.id,
        title: tarea.titulo,
        description: tarea.descripcion,
        completed: tarea.completada,
        dueDate: tarea.fechaLimite,
        createdAt: tarea.creadaEn,
        userId: tarea.usuarioId,
        materiaId: tarea.materiaId,
      },
    });
    return convertir(creada);
  }

async listarPorUsuario(usuarioId: string): Promise<Tarea[]> {
    const tareas = await prisma.task.findMany({
      where: { userId: usuarioId },
      include: { adjuntos: true },
    });
    return tareas.map(convertir);
  
  }

  async buscarPorId(id: string): Promise<Tarea | null> {
    const tarea = await prisma.task.findUnique({ where: { id } });
    return tarea ? convertir(tarea) : null;
  }

  async actualizar(id: string, datos: Partial<{ titulo: string; descripcion: string | null; fechaLimite: Date | null; materiaId: string | null }>): Promise<Tarea> {
    const actualizada = await prisma.task.update({
      where: { id },
      data: {
        title: datos.titulo,
        description: datos.descripcion,
        dueDate: datos.fechaLimite,
        materiaId: datos.materiaId,
      },
    });
    return convertir(actualizada);
  }

  async eliminar(id: string): Promise<void> {
    await prisma.task.delete({ where: { id } });
  }

  async eliminarPorUsuario(usuarioId: string): Promise<void> {
    await prisma.task.deleteMany({ where: { userId: usuarioId } });
  }

  async marcarComoCompletada(id: string, completada: boolean): Promise<Tarea> {
    const actualizada = await prisma.task.update({
      where: { id },
      data: { completed: completada },
    });
    return convertir(actualizada);
  }

  async contarTotal(): Promise<number> {
    return prisma.task.count();
  }

  async contarCompletadas(): Promise<number> {
    return prisma.task.count({ where: { completed: true } });
  }

  async contarPendientes(): Promise<number> {
    return prisma.task.count({ where: { completed: false } });
  }
}
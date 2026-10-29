import { Request, Response } from "express";
import { CrearTarea } from "../../aplicacion/CasosDeUso/crearTarea";
import { ListarTareas } from "../../aplicacion/CasosDeUso/listarTarea";
import { ActualizarTarea } from "../../aplicacion/CasosDeUso/actualizarTarea";
import { EliminarTarea } from "../../aplicacion/CasosDeUso/elminarTarea";
import { MarcarTareaCompletada } from "../../aplicacion/CasosDeUso/marcarTareaCompletada";
import { RepositorioTareasPrisma } from "../baseDeDatos/repositorioTareasPrisma";

const repositorio = new RepositorioTareasPrisma();
const crearTarea = new CrearTarea(repositorio);
const listarTareas = new ListarTareas(repositorio);
const actualizarTarea = new ActualizarTarea(repositorio);
const eliminarTarea = new EliminarTarea(repositorio);
const marcarTareaCompletada = new MarcarTareaCompletada(repositorio);

export async function crear(req: Request, res: Response) {
  try {
    // Soportamos claves en inglés (enviadas por el frontend) y en español
    const tituloFinal = req.body.title || req.body.titulo;
    const descripcionFinal = req.body.description || req.body.descripcion || null;
    const fechaLimiteFinal = req.body.dueDate || req.body.fechaLimite;
    const usuarioIdFinal = req.body.userId || req.body.usuarioId;

    const tarea = await crearTarea.ejecutar(
      tituloFinal,
      descripcionFinal,
      fechaLimiteFinal ? new Date(fechaLimiteFinal) : null,
      usuarioIdFinal
    );
    res.status(201).json(tarea);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function listar(req: Request, res: Response) {
  try {
    const usuarioId = (req.query.usuarioId || req.query.userId) as string;
    const tareas = await listarTareas.ejecutar(usuarioId);
    res.status(200).json(tareas);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function actualizar(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const tituloFinal = req.body.title || req.body.titulo;
    const descripcionFinal = req.body.description || req.body.descripcion;
    const fechaLimiteFinal = req.body.dueDate || req.body.fechaLimite;

    const tarea = await actualizarTarea.ejecutar(id, {
      titulo: tituloFinal,
      descripcion: descripcionFinal,
      fechaLimite: fechaLimiteFinal ? new Date(fechaLimiteFinal) : undefined,
    });
    res.status(200).json(tarea);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function eliminar(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await eliminarTarea.ejecutar(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function completar(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { completada } = req.body;
    const tarea = await marcarTareaCompletada.ejecutar(id, completada);
    res.status(200).json(tarea);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
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
    const { titulo, descripcion, fechaLimite, usuarioId } = req.body;
    const tarea = await crearTarea.ejecutar(titulo, descripcion || null, fechaLimite ? new Date(fechaLimite) : null, usuarioId);
    res.status(201).json(tarea);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function listar(req: Request, res: Response) {
  try {
    const usuarioId = req.params.usuarioId as string;
    const tareas = await listarTareas.ejecutar(usuarioId);
    res.status(200).json(tareas);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function actualizar(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { titulo, descripcion, fechaLimite } = req.body;
    const tarea = await actualizarTarea.ejecutar(id, {
      titulo,
      descripcion,
      fechaLimite: fechaLimite ? new Date(fechaLimite) : undefined,
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
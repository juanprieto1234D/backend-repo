import { Request, Response } from "express";
import { CrearMateria } from "../../aplicacion/CasosDeUso/crearMateria";
import { ListarMaterias } from "../../aplicacion/CasosDeUso/listarMaterias";
import { ActualizarMateria } from "../../aplicacion/CasosDeUso/actualizarMateria";
import { EliminarMateria } from "../../aplicacion/CasosDeUso/eliminarMateria";
import { RepositorioMateriasPrisma } from "../baseDeDatos/repositorioMateriasPrisma";

const repositorio = new RepositorioMateriasPrisma();
const crearMateria = new CrearMateria(repositorio);
const listarMaterias = new ListarMaterias(repositorio);
const actualizarMateria = new ActualizarMateria(repositorio);
const eliminarMateria = new EliminarMateria(repositorio);

export async function crear(req: Request, res: Response): Promise<void> {
  try {
    const { usuarioId, nombre, color, icono } = req.body;
    if (!usuarioId) {
      res.status(400).json({ error: "El campo 'usuarioId' es obligatorio" });
      return;
    }
    const materia = await crearMateria.ejecutar(usuarioId, nombre, color, icono);
    res.status(201).json(materia);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function listar(req: Request, res: Response): Promise<void> {
  try {
    const usuarioId = req.params.usuarioId as string;
    const materias = await listarMaterias.ejecutar(usuarioId);
    res.status(200).json(materias);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function actualizar(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { nombre, color, icono } = req.body;
    const materia = await actualizarMateria.ejecutar(id, { nombre, color, icono });
    res.status(200).json(materia);
  } catch (error: any) {
    if (error.message === "Materia no encontrada") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(400).json({ error: error.message });
  }
}

export async function eliminar(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    await eliminarMateria.ejecutar(id);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === "Materia no encontrada") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(400).json({ error: error.message });
  }
}

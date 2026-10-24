import { Response } from "express";
import { SolicitudAutenticadaAdmin } from "./middlewareAdmin";
import { RepositorioUsuariosPrisma } from "../baseDeDatos/repositorioUsuariosPrisma";
import { RepositorioTareasPrisma } from "../baseDeDatos/repositorioTareasPrisma";
import { ObtenerEstadisticas } from "../../aplicacion/CasosDeUso/obtenerEstadisticas";
import { ListarUsuariosAdmin } from "../../aplicacion/CasosDeUso/listarUsuariosAdmin";
import { ObtenerDetalleUsuarioAdmin } from "../../aplicacion/CasosDeUso/obtenerDetalleUsuarioAdmin";
import { CambiarEstadoUsuarioAdmin } from "../../aplicacion/CasosDeUso/cambiarEstadoUsuarioAdmin";
import { EliminarUsuarioAdmin } from "../../aplicacion/CasosDeUso/eliminarUsuarioAdmin";
import { ListarTareas } from "../../aplicacion/CasosDeUso/listarTarea";
import { EliminarTarea } from "../../aplicacion/CasosDeUso/elminarTarea";

const repositorioUsuarios = new RepositorioUsuariosPrisma();
const repositorioTareas = new RepositorioTareasPrisma();

const casoObtenerEstadisticas = new ObtenerEstadisticas(repositorioUsuarios, repositorioTareas);
const casoListarUsuarios = new ListarUsuariosAdmin(repositorioUsuarios);
const casoObtenerDetalleUsuario = new ObtenerDetalleUsuarioAdmin(repositorioUsuarios);
const casoCambiarEstadoUsuario = new CambiarEstadoUsuarioAdmin(repositorioUsuarios);
const casoEliminarUsuario = new EliminarUsuarioAdmin(repositorioUsuarios, repositorioTareas);
const casoListarTareas = new ListarTareas(repositorioTareas);
const casoEliminarTarea = new EliminarTarea(repositorioTareas);

export async function obtenerEstadisticas(req: SolicitudAutenticadaAdmin, res: Response): Promise<void> {
  try {
    const estadisticas = await casoObtenerEstadisticas.ejecutar();
    res.status(200).json(estadisticas);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error al obtener estadísticas" });
  }
}

export async function listarUsuarios(req: SolicitudAutenticadaAdmin, res: Response): Promise<void> {
  try {
    const buscar = typeof req.query.buscar === "string" ? req.query.buscar : undefined;
    const usuarios = await casoListarUsuarios.ejecutar(buscar);
    res.status(200).json(usuarios);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error al listar usuarios" });
  }
}

export async function obtenerDetalleUsuario(req: SolicitudAutenticadaAdmin, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const usuario = await casoObtenerDetalleUsuario.ejecutar(id);
    res.status(200).json(usuario);
  } catch (error: any) {
    if (error.message === "Usuario no encontrado") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(400).json({ error: error.message });
  }
}

export async function cambiarEstadoUsuario(req: SolicitudAutenticadaAdmin, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { activo } = req.body;

    if (typeof activo !== "boolean") {
      res.status(400).json({ error: "El campo 'activo' debe ser un valor booleano" });
      return;
    }

    const adminId = req.usuarioAdmin!.id;
    const usuario = await casoCambiarEstadoUsuario.ejecutar(id, activo, adminId);
    res.status(200).json(usuario);
  } catch (error: any) {
    if (error.message === "Usuario no encontrado") {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message.includes("no puede modificar")) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(400).json({ error: error.message });
  }
}

export async function eliminarUsuario(req: SolicitudAutenticadaAdmin, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const adminId = req.usuarioAdmin!.id;
    await casoEliminarUsuario.ejecutar(id, adminId);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === "Usuario no encontrado") {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message.includes("no puede eliminarse a sí mismo")) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(400).json({ error: error.message });
  }
}

export async function listarTareasDeUsuario(req: SolicitudAutenticadaAdmin, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const usuario = await repositorioUsuarios.buscarPorId(id);
    if (!usuario) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    const tareas = await casoListarTareas.ejecutar(id);
    res.status(200).json(tareas);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function eliminarTareaPuntual(req: SolicitudAutenticadaAdmin, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    await casoEliminarTarea.ejecutar(id);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === "Tarea no encontrada") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(400).json({ error: error.message });
  }
}

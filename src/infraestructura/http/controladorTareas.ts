import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { CrearTarea } from "../../aplicacion/CasosDeUso/crearTarea";
import { ListarTareas } from "../../aplicacion/CasosDeUso/listarTarea";
import { ActualizarTarea } from "../../aplicacion/CasosDeUso/actualizarTarea";
import { EliminarTarea } from "../../aplicacion/CasosDeUso/elminarTarea";
import { MarcarTareaCompletada } from "../../aplicacion/CasosDeUso/marcarTareaCompletada";
import { RepositorioTareasPrisma } from "../baseDeDatos/repositorioTareasPrisma";
import { generarTipsParaTarea } from "../ia/servicioGemini";

// IMPORTS PARA LA IA
import { GenerarQuizUseCase } from "../../aplicacion/CasosDeUso/generarQuiz";
import { GeneradorQuizGemini } from "../ia/generadorQuizGemini";
import { GenerarPlanHoyUseCase } from "../../aplicacion/CasosDeUso/generarPlanHoy";
import { GeneradorPlanGemini } from "../ia/generadorPlanGemini";
import { GenerarFlashcardsUseCase } from "../../aplicacion/CasosDeUso/generarFlashcards";
import { GeneradorFlashcardsGemini } from "../ia/generadorFlashcardsGemini";

// 1. DECLARAMOS PRISMA Y EL REPOSITORIO PRIMERO
const prisma = new PrismaClient();
const repositorio = new RepositorioTareasPrisma();

// 2. INSTANCIAS DE CASOS DE USO BÁSICOS
const crearTarea = new CrearTarea(repositorio);
const listarTareas = new ListarTareas(repositorio);
const actualizarTarea = new ActualizarTarea(repositorio);
const eliminarTarea = new EliminarTarea(repositorio);
const marcarTareaCompletada = new MarcarTareaCompletada(repositorio);

// 3. INSTANCIAS DE CASOS DE USO DE LA IA (Usan el repositorio)
const generadorQuiz = new GeneradorQuizGemini(process.env.GEMINI_API_KEY || '');
const generarQuizUseCase = new GenerarQuizUseCase(generadorQuiz, repositorio);

const generadorPlan = new GeneradorPlanGemini(process.env.GEMINI_API_KEY || '');
const generarPlanUseCase = new GenerarPlanHoyUseCase(generadorPlan);

const generadorFlashcards = new GeneradorFlashcardsGemini(process.env.GEMINI_API_KEY || '');
const generarFlashcardsUseCase = new GenerarFlashcardsUseCase(generadorFlashcards, repositorio);

// ==========================================
// TUS FUNCIONES ORIGINALES
// ==========================================

export async function crear(req: Request, res: Response) {
  try {
    const { titulo, descripcion, fechaLimite, usuarioId, materiaId } = req.body;
    const tarea = await crearTarea.ejecutar(
      titulo,
      descripcion || null,
      fechaLimite ? new Date(fechaLimite) : null,
      usuarioId,
      materiaId || null
    );
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
    const { titulo, descripcion, fechaLimite, materiaId } = req.body;
    const tarea = await actualizarTarea.ejecutar(id, {
      titulo,
      descripcion,
      fechaLimite:
        fechaLimite === undefined
          ? undefined
          : fechaLimite === null
          ? null
          : new Date(fechaLimite),
      materiaId,
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

// ==========================================
// SUBIDA Y ELIMINACIÓN DE DOCUMENTOS ADJUNTOS
// ==========================================

export async function subirAdjunto(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No se envió ningún archivo" });
    }

    const tarea = await prisma.task.findUnique({ where: { id } });
    if (!tarea) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    const adjunto = await prisma.taskAttachment.create({
      data: {
        taskId: id,
        nombre: file.originalname,
        ruta: file.filename,
        mimeType: file.mimetype,
        tamano: file.size,
      },
    });

    res.status(201).json(adjunto);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error al subir el adjunto" });
  }
}

export async function eliminarAdjunto(req: Request, res: Response) {
  try {
    const adjuntoId = req.params.adjuntoId as string;

    const adjunto = await prisma.taskAttachment.findUnique({ where: { id: adjuntoId } });
    if (!adjunto) {
      return res.status(404).json({ error: "Adjunto no encontrado" });
    }

    const rutaFisica = path.join(process.cwd(), "uploads", adjunto.ruta);
    if (fs.existsSync(rutaFisica)) {
      fs.unlinkSync(rutaFisica);
    }

    await prisma.taskAttachment.delete({ where: { id: adjuntoId } });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error al eliminar el adjunto" });
  }
}

// ==========================================
// TUTOR PEDAGÓGICO CON GOOGLE GEMINI
// ==========================================

export async function obtenerTipsIA(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const tarea = await prisma.task.findUnique({
      where: { id },
      include: {
        adjuntos: true,
        materia: true,
      },
    });

    if (!tarea) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    const tips = await generarTipsParaTarea({
      titulo: tarea.title,
      descripcion: tarea.description,
      materia: tarea.materia?.nombre,
      adjuntos: tarea.adjuntos,
    });

    res.status(200).json({ tips });
  } catch (error: any) {
    console.error("Error al generar tips con Gemini:", error);
    res.status(500).json({ error: error.message || "Error al generar tips con IA" });
  }
}

// ==========================================
// NUEVAS FUNCIONES DE IA
// ==========================================

export async function obtenerQuiz(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const preguntas = await generarQuizUseCase.ejecutar(id);
    res.status(200).json({ preguntas });
  } catch (error: any) {
    console.error("Error al generar quiz:", error);
    res.status(500).json({ error: error.message || "Error al generar el quiz" });
  }
}

export async function obtenerPlanHoy(req: Request, res: Response) {
  try {
    const usuarioId = String(req.params.usuarioId);

    const tareas = await prisma.task.findMany({
      where: { userId: usuarioId, completed: false }, 
      include: { materia: true }
    });

    const tareasFormateadas = tareas.map(t => ({
      titulo: t.title,
      materia: t.materia?.nombre,
      fechaLimite: t.dueDate ? t.dueDate.toISOString() : null
    }));

    const plan = await generarPlanUseCase.ejecutar(tareasFormateadas);
    res.status(200).json({ plan });
  } catch (error: any) {
    console.error("Error al generar plan del día:", error);
    res.status(500).json({ error: error.message || "Error al generar el plan" });
  }
}

export async function obtenerFlashcards(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const tarjetas = await generarFlashcardsUseCase.ejecutar(id);
    res.status(200).json({ tarjetas });
  } catch (error: any) {
    console.error("Error al generar flashcards:", error);
    res.status(500).json({ error: error.message || "Error al generar flashcards" });
  }
}
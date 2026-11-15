import { Router } from "express";
import {
  crear,
  listar,
  actualizar,
  eliminar,
  completar,
  subirAdjunto,
  eliminarAdjunto,
  obtenerTipsIA,
  obtenerQuiz,
  obtenerPlanHoy,
  obtenerFlashcards // 👈 Agregado aquí
} from "./controladorTareas";
import { subirArchivo } from "./middlewareUpload";

const router = Router();

router.post("/", crear);
router.get("/:usuarioId", listar);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);
router.patch("/:id/completar", completar);

// Rutas de Documentos Adjuntos
router.post("/:id/adjuntos", subirArchivo.single("archivo"), subirAdjunto);
router.delete("/adjuntos/:adjuntoId", eliminarAdjunto);

// Ruta del Tutor IA (Gemini)
router.post("/:id/tips-ia", obtenerTipsIA);

// Ruta del Quiz
router.post("/:id/quiz", obtenerQuiz);

// Ruta del Plan del día
router.get("/plan-hoy/:usuarioId", obtenerPlanHoy);

// Ruta de Flashcards
router.post("/:id/flashcards", obtenerFlashcards);

export default router;
import { Router } from "express";
import { crear, listar, actualizar, eliminar } from "./controladorMaterias";

const router = Router();

// Materias del usuario (mismo estilo que /tareas: el usuarioId va en la ruta).

/**
 * @openapi
 * /materias:
 *   post:
 *     summary: Crea una materia para un usuario
 *     tags: [Materias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [usuarioId, nombre]
 *             properties:
 *               usuarioId:
 *                 type: string
 *               nombre:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Materia creada
 */
router.post("/", crear);

/**
 * @openapi
 * /materias/{usuarioId}:
 *   get:
 *     summary: Lista las materias de un usuario
 *     tags: [Materias]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de materias
 */
router.get("/:usuarioId", listar);

/**
 * @openapi
 * /materias/{id}:
 *   put:
 *     summary: Actualiza nombre o color de una materia
 *     tags: [Materias]
 *     responses:
 *       200:
 *         description: Materia actualizada
 */
router.put("/:id", actualizar);

/**
 * @openapi
 * /materias/{id}:
 *   delete:
 *     summary: Elimina una materia (las tareas quedan sin materia)
 *     tags: [Materias]
 *     responses:
 *       204:
 *         description: Materia eliminada
 */
router.delete("/:id", eliminar);

export default router;

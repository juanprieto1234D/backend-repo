import { Router } from "express";
import { crear, listar, actualizar, eliminar, completar } from "./controladorTareas";

const router = Router();

/**
 * @openapi
 * /tareas:
 *   post:
 *     summary: Crea una nueva tarea
 *     tags: [Tareas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               fechaLimite:
 *                 type: string
 *               usuarioId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tarea creada exitosamente
 */
router.post("/", crear);

/**
 * @openapi
 * /tareas/{usuarioId}:
 *   get:
 *     summary: Lista las tareas de un usuario
 *     tags: [Tareas]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de tareas
 */
router.get("/:usuarioId", listar);

/**
 * @openapi
 * /tareas/{id}:
 *   put:
 *     summary: Actualiza una tarea existente
 *     tags: [Tareas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               fechaLimite:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tarea actualizada
 */
router.put("/:id", actualizar);

/**
 * @openapi
 * /tareas/{id}:
 *   delete:
 *     summary: Elimina una tarea
 *     tags: [Tareas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Tarea eliminada
 */
router.delete("/:id", eliminar);

/**
 * @openapi
 * /tareas/{id}/completar:
 *   patch:
 *     summary: Marca una tarea como completada o pendiente
 *     tags: [Tareas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               completada:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Tarea actualizada
 */
router.patch("/:id/completar", completar);

export default router;
import { Router } from "express";
import { middlewareAutenticacionAdmin } from "./middlewareAdmin";
import {
  obtenerEstadisticas,
  listarUsuarios,
  obtenerDetalleUsuario,
  cambiarEstadoUsuario,
  eliminarUsuario,
  listarTareasDeUsuario,
  eliminarTareaPuntual,
} from "./controladorAdmin";

const router = Router();

// Todas las rutas de administración requieren token válido y rol ADMIN
router.use(middlewareAutenticacionAdmin as any);

/**
 * @openapi
 * /admin/estadisticas:
 *   get:
 *     summary: Obtiene estadísticas globales del sistema
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas generales del sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsuarios:
 *                   type: integer
 *                 totalTareas:
 *                   type: integer
 *                 completadas:
 *                   type: integer
 *                 pendientes:
 *                   type: integer
 *                 usuariosUltimos7Dias:
 *                   type: integer
 *       401:
 *         description: Token no proporcionado o inválido
 *       403:
 *         description: Acceso denegado (no es ADMIN o cuenta inactiva)
 */
router.get("/estadisticas", obtenerEstadisticas);

/**
 * @openapi
 * /admin/usuarios:
 *   get:
 *     summary: Lista usuarios con búsqueda y cantidad de tareas
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *         description: Término de búsqueda por nombre o correo
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 */
router.get("/usuarios", listarUsuarios);

/**
 * @openapi
 * /admin/usuarios/{id}:
 *   get:
 *     summary: Obtiene el detalle de un usuario
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle del usuario
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Usuario no encontrado
 */
router.get("/usuarios/:id", obtenerDetalleUsuario);

/**
 * @openapi
 * /admin/usuarios/{id}/estado:
 *   patch:
 *     summary: Bloquea o activa la cuenta de un usuario
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *             required:
 *               - activo
 *             properties:
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *       400:
 *         description: Error en la solicitud o intento de auto-bloqueo
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Usuario no encontrado
 */
router.patch("/usuarios/:id/estado", cambiarEstadoUsuario);

/**
 * @openapi
 * /admin/usuarios/{id}:
 *   delete:
 *     summary: Elimina un usuario y todas sus tareas
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Usuario y tareas eliminados exitosamente
 *       400:
 *         description: Intento de auto-eliminación
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Usuario no encontrado
 */
router.delete("/usuarios/:id", eliminarUsuario);

/**
 * @openapi
 * /admin/usuarios/{id}/tareas:
 *   get:
 *     summary: Lista las tareas de un usuario específico para moderación
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de tareas del usuario
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Usuario no encontrado
 */
router.get("/usuarios/:id/tareas", listarTareasDeUsuario);

/**
 * @openapi
 * /admin/tareas/{id}:
 *   delete:
 *     summary: Elimina una tarea puntual por moderación
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Tarea eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Tarea no encontrada
 */
router.delete("/tareas/:id", eliminarTareaPuntual);

export default router;

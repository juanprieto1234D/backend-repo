import { Router } from "express";
import {
  registrar,
  login,
  solicitarRecuperacion,
  restablecerContrasena,
  loginGoogle,
} from "./controladorAutenticacion";

const router = Router();

router.post("/registro", registrar);
router.post("/login", login);
router.post("/google", loginGoogle);

/**
 * @openapi
 * /auth/solicitar-reset:
 *   post:
 *     summary: Envía un enlace de recuperación al correo (si existe)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correo]
 *             properties:
 *               correo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Respuesta genérica (no revela si el correo existe)
 */
router.post("/solicitar-reset", solicitarRecuperacion);

/**
 * @openapi
 * /auth/restablecer:
 *   post:
 *     summary: Cambia la contraseña usando el token del correo
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, contrasena]
 *             properties:
 *               token:
 *                 type: string
 *               contrasena:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *       400:
 *         description: Token inválido, expirado o contraseña débil
 */
router.post("/restablecer", restablecerContrasena);

export default router;

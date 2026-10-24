import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { RepositorioUsuariosPrisma } from "../baseDeDatos/repositorioUsuariosPrisma";

const repositorioUsuarios = new RepositorioUsuariosPrisma();

export interface SolicitudAutenticadaAdmin extends Request {
  usuarioAdmin?: {
    id: string;
    rol: string;
    correo: string;
  };
}

export async function middlewareAutenticacionAdmin(
  req: SolicitudAutenticadaAdmin,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token no proporcionado o formato inválido" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const secreto = process.env.JWT_SECRET || "secreto_temporal";

  let decoded: any;
  try {
    decoded = jwt.verify(token, secreto);
  } catch (err) {
    res.status(401).json({ error: "Token inválido o expirado" });
    return;
  }

  const usuarioId = decoded.userId;
  if (!usuarioId) {
    res.status(401).json({ error: "Token inválido" });
    return;
  }

  const usuario = await repositorioUsuarios.buscarPorId(usuarioId);

  if (!usuario) {
    res.status(403).json({ error: "Acceso denegado: el usuario no existe" });
    return;
  }

  if (!usuario.activo) {
    res.status(403).json({ error: "Acceso denegado: cuenta bloqueada" });
    return;
  }

  if (usuario.rol !== "ADMIN") {
    res.status(403).json({ error: "Acceso denegado: se requieren permisos de administrador" });
    return;
  }

  req.usuarioAdmin = {
    id: usuario.id,
    rol: usuario.rol,
    correo: usuario.correo,
  };

  next();
}

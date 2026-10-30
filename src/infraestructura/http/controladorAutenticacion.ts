import { Request, Response } from "express";
import { RegistrarUsuario } from "../../aplicacion/CasosDeUso/registrarUsuario";
import { IniciarSesion } from "../../aplicacion/CasosDeUso/iniciarSesion";
import { SolicitarReset } from "../../aplicacion/CasosDeUso/solicitarReset";
import { RestablecerContrasena } from "../../aplicacion/CasosDeUso/restablecerContrasena";
import { RepositorioUsuariosPrisma } from "../baseDeDatos/repositorioUsuariosPrisma";
import { RepositorioResetPrisma } from "../baseDeDatos/repositorioResetPrisma";
import { EnviadorCorreoNodemailer } from "../correo/enviadorCorreoNodemailer";
import { IniciarSesionConGoogle } from "../../aplicacion/CasosDeUso/iniciarSesionConGoogle";
import { VerificadorGoogleGoogleAuth } from "../google/verificadorGoogleGoogleAuth";

const repositorio = new RepositorioUsuariosPrisma();
const repositorioReset = new RepositorioResetPrisma();
const enviadorCorreo = new EnviadorCorreoNodemailer();

const registrarUsuario = new RegistrarUsuario(repositorio);
const iniciarSesion = new IniciarSesion(repositorio);
const solicitarReset = new SolicitarReset(repositorio, repositorioReset, enviadorCorreo);
const restablecer = new RestablecerContrasena(repositorio, repositorioReset);
const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
const iniciarSesionConGoogle = new IniciarSesionConGoogle(
  repositorio,
  new VerificadorGoogleGoogleAuth(googleClientId)
);

const MENSAJE_GENERICO = "Si el correo está registrado, te enviamos un enlace de recuperación.";

export async function registrar(req: Request, res: Response) {
  try {
    const { correo, contrasena, nombre } = req.body;
    const usuario = await registrarUsuario.ejecutar(correo, contrasena, nombre);
    res.status(201).json({ id: usuario.id, correo: usuario.correo, nombre: usuario.nombre });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { correo, contrasena } = req.body;
    const resultado = await iniciarSesion.ejecutar(correo, contrasena);
    res.status(200).json(resultado);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
}

export async function solicitarRecuperacion(req: Request, res: Response) {
  try {
    const { correo } = req.body;
    if (!correo) {
      res.status(400).json({ error: "El correo es obligatorio" });
      return;
    }
    await solicitarReset.ejecutar(String(correo));
    // Siempre la misma respuesta: no se revela si el correo existe.
    res.status(200).json({ mensaje: MENSAJE_GENERICO });
  } catch (error: any) {
    console.error("Error al solicitar recuperación:", error);
    // Aun con error interno se responde igual para no filtrar información.
    res.status(200).json({ mensaje: MENSAJE_GENERICO });
  }
}

export async function restablecerContrasena(req: Request, res: Response) {
  try {
    const { token, contrasena } = req.body;
    await restablecer.ejecutar(token, contrasena);
    res.status(200).json({ mensaje: "Contraseña actualizada. Ya puedes iniciar sesión." });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function loginGoogle(req: Request, res: Response) {
  try {
    if (!googleClientId) {
      res.status(501).json({ error: "El login con Google no está configurado en el servidor" });
      return;
    }
    const { idToken } = req.body;
    const resultado = await iniciarSesionConGoogle.ejecutar(idToken);
    res.status(200).json(resultado);
  } catch (error: any) {
    res.status(401).json({ error: error.message || "No se pudo iniciar sesión con Google" });
  }
}
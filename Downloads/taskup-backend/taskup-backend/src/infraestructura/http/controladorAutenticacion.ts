// controladorAutenticacion.ts
import { Request, Response } from "express";
import { RegistrarUsuario } from "../../aplicacion/CasosDeUso/registrarUsuario";
import { IniciarSesion } from "../../aplicacion/CasosDeUso/iniciarSesion";
import { RepositorioUsuariosPrisma } from "../baseDeDatos/repositorioUsuariosPrisma";

const repositorio = new RepositorioUsuariosPrisma();
const registrarUsuario = new RegistrarUsuario(repositorio);
const iniciarSesion = new IniciarSesion(repositorio);

export async function registrar(req: Request, res: Response) {
  try {
    const { correo, contrasena, nombre } = req.body;

    // El controlador respeta la FIRMA del puerto (caso de uso), no el orden
    // en que llegaron las claves del JSON. correo y contrasena van primero,
    // exactamente como lo declara RegistrarUsuario.ejecutar(correo, contrasena, nombre).
    const usuario = await registrarUsuario.ejecutar(correo, contrasena, nombre);

    res.status(201).json({ id: usuario.id, correo: usuario.correo, nombre: usuario.nombre });
  } catch (error: any) {
    console.error("Error al registrar:", error);
    res.status(400).json({ error: error.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { correo, contrasena } = req.body;
    const resultado = await iniciarSesion.ejecutar(correo, contrasena);
    res.status(200).json(resultado);
  } catch (error: any) {
    console.error("Error al iniciar sesión:", error);
    res.status(401).json({ error: error.message });
  }
}
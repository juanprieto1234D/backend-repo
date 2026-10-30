import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { Usuario } from "../../dominio/entidades/usuario";
import { RepositorioUsuarios } from "../../dominio/puertos/repositorioUsuario";
import { VerificadorGoogle } from "../../dominio/puertos/verificadorGoogle";

/**
 * Login con Google: se verifica el ID token, y si la cuenta no existe se crea
 * automáticamente (sin contraseña local usable; se guarda un hash aleatorio).
 */
export class IniciarSesionConGoogle {
  constructor(
    private repositorioUsuarios: RepositorioUsuarios,
    private verificadorGoogle: VerificadorGoogle
  ) {}

  async ejecutar(idToken: string): Promise<{
    token: string;
    usuario: { id: string; correo: string; nombre: string; rol: string };
  }> {
    if (!idToken) {
      throw new Error("Falta el token de Google");
    }

    const datos = await this.verificadorGoogle.verificar(idToken);
    if (!datos || !datos.emailVerificado) {
      throw new Error("No se pudo verificar la cuenta de Google");
    }

    let usuario = await this.repositorioUsuarios.buscarPorCorreo(datos.correo);

    if (!usuario) {
      const contrasenaAleatoria = await bcrypt.hash(randomUUID(), 10);
      usuario = await this.repositorioUsuarios.crear(
        new Usuario(
          randomUUID(),
          datos.correo,
          contrasenaAleatoria,
          datos.nombre,
          new Date(),
          "USUARIO",
          true
        )
      );
    }

    if (!usuario.activo) {
      throw new Error("La cuenta está bloqueada");
    }

    const secreto = process.env.JWT_SECRET || "secreto_temporal";
    const token = jwt.sign({ userId: usuario.id, rol: usuario.rol }, secreto, {
      expiresIn: "1d",
    });

    return {
      token,
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    };
  }
}

import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { Usuario } from "../../dominio/entidades/usuario";
import { RepositorioUsuarios } from "../../dominio/puertos/repositorioUsuario";

export class RegistrarUsuario {
  constructor(private repositorioUsuarios: RepositorioUsuarios) {}

  async ejecutar(correo: string, contrasena: string, nombre: string): Promise<Usuario> {
    const usuarioExistente = await this.repositorioUsuarios.buscarPorCorreo(correo);
    if (usuarioExistente) {
      throw new Error("El correo ya está registrado");
    }

    const contrasenaEncriptada = await bcrypt.hash(contrasena, 10);

    const nuevoUsuario = new Usuario(
      randomUUID(),
      correo,
      contrasenaEncriptada,
      nombre,
      new Date()
    );

    return this.repositorioUsuarios.crear(nuevoUsuario);
  }
}
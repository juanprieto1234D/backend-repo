import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RepositorioUsuarios } from "../../dominio/puertos/repositorioUsuario";

export class IniciarSesion {
  constructor(private repositorioUsuarios: RepositorioUsuarios) {}

  async ejecutar(correo: string, contrasena: string): Promise<{ token: string; usuario: { id: string; correo: string; nombre: string } }> {
    const usuario = await this.repositorioUsuarios.buscarPorCorreo(correo);
    if (!usuario) {
      throw new Error("Credenciales inválidas");
    }

    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      throw new Error("Credenciales inválidas");
    }

    const secreto = process.env.JWT_SECRET || "secreto_temporal";
    const token = jwt.sign({ userId: usuario.id }, secreto, { expiresIn: "1d" });

    return { token, usuario: { id: usuario.id, correo: usuario.correo, nombre: usuario.nombre } };
  }
}
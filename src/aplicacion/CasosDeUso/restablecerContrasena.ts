import bcrypt from "bcrypt";
import { createHash } from "crypto";
import { RepositorioReset } from "../../dominio/puertos/repositorioReset";
import { RepositorioUsuarios } from "../../dominio/puertos/repositorioUsuario";

export class RestablecerContrasena {
  constructor(
    private repositorioUsuarios: RepositorioUsuarios,
    private repositorioReset: RepositorioReset
  ) {}

  async ejecutar(token: string, contrasenaNueva: string): Promise<void> {
    if (!token) {
      throw new Error("Falta el enlace de recuperación");
    }
    if (!contrasenaNueva || contrasenaNueva.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const registro = await this.repositorioReset.buscarPorHash(tokenHash);

    if (!registro || registro.usedAt || registro.expiresAt.getTime() < Date.now()) {
      throw new Error("El enlace no es válido o ya expiró. Solicita uno nuevo.");
    }

    const usuario = await this.repositorioUsuarios.buscarPorId(registro.userId);
    if (!usuario) {
      throw new Error("El usuario ya no existe");
    }

    const hash = await bcrypt.hash(contrasenaNueva, 10);
    await this.repositorioUsuarios.actualizarContrasena(usuario.id, hash);
    await this.repositorioReset.marcarUsado(registro.id);
  }
}

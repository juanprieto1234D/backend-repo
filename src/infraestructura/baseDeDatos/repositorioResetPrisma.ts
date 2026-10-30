import { PrismaClient } from "@prisma/client";
import { RegistroReset, RepositorioReset } from "../../dominio/puertos/repositorioReset";

const prisma = new PrismaClient();

export class RepositorioResetPrisma implements RepositorioReset {
  async crear(datos: {
    id: string;
    tokenHash: string;
    userId: string;
    expiresAt: Date;
  }): Promise<void> {
    await prisma.passwordResetToken.create({
      data: {
        id: datos.id,
        tokenHash: datos.tokenHash,
        userId: datos.userId,
        expiresAt: datos.expiresAt,
      },
    });
  }

  async buscarPorHash(tokenHash: string): Promise<RegistroReset | null> {
    const registro = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!registro) return null;
    return {
      id: registro.id,
      userId: registro.userId,
      expiresAt: registro.expiresAt,
      usedAt: registro.usedAt,
    };
  }

  async marcarUsado(id: string): Promise<void> {
    await prisma.passwordResetToken.update({ where: { id }, data: { usedAt: new Date() } });
  }

  async invalidarDeUsuario(userId: string): Promise<void> {
    await prisma.passwordResetToken.deleteMany({ where: { userId, usedAt: null } });
  }
}

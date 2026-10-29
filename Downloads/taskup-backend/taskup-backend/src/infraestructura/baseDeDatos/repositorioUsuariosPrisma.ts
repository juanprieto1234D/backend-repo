import { PrismaClient } from "@prisma/client";
import { Usuario } from "../../dominio/entidades/usuario";
import { RepositorioUsuarios } from "../../dominio/puertos/repositorioUsuario";

const prisma = new PrismaClient();

export class RepositorioUsuariosPrisma implements RepositorioUsuarios {
  async buscarPorCorreo(correo: string): Promise<Usuario | null> {
    const usuario = await prisma.user.findUnique({ where: { email: correo } });
    if (!usuario) return null;
    return new Usuario(usuario.id, usuario.email, usuario.password, usuario.name, usuario.createdAt);
  }

  async crear(usuario: Usuario): Promise<Usuario> {
    const creado = await prisma.user.create({
      data: {
        id: usuario.id,
        email: usuario.correo,
        password: usuario.contrasena,
        name: usuario.nombre,
        createdAt: usuario.creadoEn,
      },
    });
    return new Usuario(creado.id, creado.email, creado.password, creado.name, creado.createdAt);
  }
}
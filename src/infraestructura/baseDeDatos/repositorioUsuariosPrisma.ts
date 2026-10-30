import { PrismaClient } from "@prisma/client";
import { Usuario } from "../../dominio/entidades/usuario";
import { RepositorioUsuarios, UsuarioConTareasCount } from "../../dominio/puertos/repositorioUsuario";

const prisma = new PrismaClient();

function convertir(u: any): Usuario {
  return new Usuario(
    u.id,
    u.email,
    u.password,
    u.name,
    u.createdAt,
    (u.role || "USUARIO") as "USUARIO" | "ADMIN",
    u.active !== undefined ? u.active : true
  );
}

export class RepositorioUsuariosPrisma implements RepositorioUsuarios {
  async buscarPorCorreo(correo: string): Promise<Usuario | null> {
    const usuario = await prisma.user.findUnique({ where: { email: correo } });
    if (!usuario) return null;
    return convertir(usuario);
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const usuario = await prisma.user.findUnique({ where: { id } });
    if (!usuario) return null;
    return convertir(usuario);
  }

  async crear(usuario: Usuario): Promise<Usuario> {
    const creado = await prisma.user.create({
      data: {
        id: usuario.id,
        email: usuario.correo,
        password: usuario.contrasena,
        name: usuario.nombre,
        role: usuario.rol,
        active: usuario.activo,
        createdAt: usuario.creadoEn,
      },
    });
    return convertir(creado);
  }

  async actualizarEstado(id: string, activo: boolean): Promise<Usuario> {
    const actualizado = await prisma.user.update({
      where: { id },
      data: { active: activo },
    });
    return convertir(actualizado);
  }

  async actualizarContrasena(id: string, contrasena: string): Promise<void> {
    await prisma.user.update({ where: { id }, data: { password: contrasena } });
  }

  async eliminar(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }

  async listar(buscar?: string): Promise<UsuarioConTareasCount[]> {
    const whereClause = buscar
      ? {
          OR: [
            { name: { contains: buscar, mode: "insensitive" as const } },
            { email: { contains: buscar, mode: "insensitive" as const } },
          ],
        }
      : {};

    const usuarios = await prisma.user.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return usuarios.map((u) => {
      const usuarioEntidad = convertir(u);
      return Object.assign(usuarioEntidad, {
        cantidadTareas: u._count.tasks,
      }) as UsuarioConTareasCount;
    });
  }

  async contarTotal(): Promise<number> {
    return prisma.user.count();
  }

  async contarRegistradosDesde(fecha: Date): Promise<number> {
    return prisma.user.count({
      where: {
        createdAt: {
          gte: fecha,
        },
      },
    });
  }
}
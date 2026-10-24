import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { RepositorioUsuariosPrisma } from "./baseDeDatos/repositorioUsuariosPrisma";
import { Usuario } from "../dominio/entidades/usuario";

const repositorioUsuarios = new RepositorioUsuariosPrisma();

export async function sembrarAdminInicial(): Promise<void> {
  const correoAdmin = process.env.ADMIN_CORREO;
  const contrasenaAdmin = process.env.ADMIN_CONTRASENA;
  const nombreAdmin = process.env.ADMIN_NOMBRE || "Administrador";

  if (!correoAdmin || !contrasenaAdmin) {
    console.log("ℹ️ Variables ADMIN_CORREO o ADMIN_CONTRASENA no configuradas. Omitiendo seed de admin.");
    return;
  }

  try {
    const adminExistente = await repositorioUsuarios.buscarPorCorreo(correoAdmin);
    if (adminExistente) {
      console.log(`✅ Admin inicial (${correoAdmin}) ya existe en la base de datos.`);
      return;
    }

    const contrasenaEncriptada = await bcrypt.hash(contrasenaAdmin, 10);
    const nuevoAdmin = new Usuario(
      randomUUID(),
      correoAdmin,
      contrasenaEncriptada,
      nombreAdmin,
      new Date(),
      "ADMIN",
      true
    );

    await repositorioUsuarios.crear(nuevoAdmin);
    console.log(`🎉 Administrador inicial creado con éxito: ${correoAdmin}`);
  } catch (error) {
    console.error("❌ Error al sembrar admin inicial:", error);
  }
}

import { createHash, randomBytes, randomUUID } from "crypto";
import { EnviadorCorreo } from "../../dominio/puertos/enviadorCorreo";
import { RepositorioReset } from "../../dominio/puertos/repositorioReset";
import { RepositorioUsuarios } from "../../dominio/puertos/repositorioUsuario";

const MINUTOS_VALIDEZ = 30;

export class SolicitarReset {
  constructor(
    private repositorioUsuarios: RepositorioUsuarios,
    private repositorioReset: RepositorioReset,
    private enviadorCorreo: EnviadorCorreo
  ) {}

  /**
   * No revela si el correo existe: si no hay usuario, termina sin error.
   */
  async ejecutar(correo: string): Promise<void> {
    const correoLimpio = (correo ?? "").trim().toLowerCase();
    if (!correoLimpio) return;

    const usuario = await this.repositorioUsuarios.buscarPorCorreo(correoLimpio);
    if (!usuario) return;

    // Se guarda solo el hash: si alguien lee la BD no puede usar el token.
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + MINUTOS_VALIDEZ * 60 * 1000);

    await this.repositorioReset.invalidarDeUsuario(usuario.id);
    await this.repositorioReset.crear({
      id: randomUUID(),
      tokenHash,
      userId: usuario.id,
      expiresAt,
    });

    const base = (process.env.FRONTEND_URL || "http://localhost:8081").replace(/\/$/, "");
    const enlace = `${base}/?resetToken=${token}`;

    await this.enviadorCorreo.enviar({
      para: usuario.correo,
      asunto: "Recupera tu contraseña de TaskUp",
      texto: `Hola ${usuario.nombre}.\n\nAbre este enlace para crear una nueva contraseña (válido ${MINUTOS_VALIDEZ} minutos):\n${enlace}\n\nSi no lo pediste, ignora este mensaje.`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1E293B;">
          <h2 style="color:#4C49ED; margin:0 0 12px;">TaskUp</h2>
          <p>Hola <strong>${usuario.nombre}</strong>,</p>
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          <p style="margin:24px 0;">
            <a href="${enlace}"
               style="background:#4C49ED;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold;">
              Crear nueva contraseña
            </a>
          </p>
          <p style="font-size:13px;color:#64748B;">El enlace vence en ${MINUTOS_VALIDEZ} minutos y solo puede usarse una vez.</p>
          <p style="font-size:13px;color:#64748B;">Si no lo solicitaste, ignora este correo.</p>
        </div>
      `,
    });
  }
}

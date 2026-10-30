import nodemailer from "nodemailer";
import { EnviadorCorreo, MensajeCorreo } from "../../dominio/puertos/enviadorCorreo";

/**
 * ADAPTADOR de salida para correo.
 *
 * Si no hay variables SMTP configuradas, el mensaje se imprime en consola
 * (modo desarrollo): así el flujo de recuperación se puede probar de punta a
 * punta sin depender de un proveedor.
 */
export class EnviadorCorreoNodemailer implements EnviadorCorreo {
  async enviar({ para, asunto, html, texto }: MensajeCorreo): Promise<void> {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.CORREO_FROM || user;

    if (!host || !user || !pass) {
      console.log("\n📧 [MODO CONSOLA] SMTP no configurado.");
      console.log(`   Para:    ${para}`);
      console.log(`   Asunto:  ${asunto}`);
      console.log(`   Mensaje: ${texto ?? "(ver html)"}\n`);
      return;
    }

    const puerto = Number(process.env.SMTP_PORT || 587);
    const transporte = nodemailer.createTransport({
      host,
      port: puerto,
      secure: puerto === 465,
      auth: { user, pass },
    });

    await transporte.sendMail({
      from: `TaskUp <${from}>`,
      to: para,
      subject: asunto,
      text: texto,
      html,
    });
  }
}

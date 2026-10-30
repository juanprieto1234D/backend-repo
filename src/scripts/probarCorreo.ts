import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

/**
 * Prueba aislada del SMTP: no toca la base de datos ni el flujo de reset.
 * Uso:  npx ts-node src/scripts/probarCorreo.ts
 */
async function main() {
  const host = process.env.SMTP_HOST;
  const puerto = Number(process.env.SMTP_PORT || 587);
  const usuario = process.env.SMTP_USER;
  const clave = process.env.SMTP_PASS;
  const remitente = process.env.CORREO_FROM || usuario;

  if (!host || !usuario || !clave) {
    console.error("❌ Faltan variables SMTP en el .env");
    console.error("   Revisa que estén descomentadas: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS");
    process.exit(1);
  }

  console.log(`Probando ${host}:${puerto} con la cuenta ${usuario} ...`);

  const transporte = nodemailer.createTransport({
    host,
    port: puerto,
    secure: puerto === 465,
    auth: { user: usuario, pass: clave },
  });

  await transporte.verify();
  console.log("✅ Conexión SMTP verificada");

  const info = await transporte.sendMail({
    from: `TaskUp <${remitente}>`,
    to: usuario,
    subject: "Prueba de correo TaskUp",
    text: "Si ves este mensaje, el envío de correos de TaskUp funciona.",
    html: "<p>Si ves este mensaje, el envío de correos de <b>TaskUp</b> funciona.</p>",
  });

  console.log("✅ Correo enviado. messageId:", info.messageId);
  console.log(`   Revisa la bandeja de ${usuario} (y la carpeta de spam).`);
}

main().catch((error: any) => {
  console.error("❌ Error:", error?.message || error);
  if (String(error?.code) === "EAUTH") {
    console.error(
      "   Credenciales rechazadas: debe ser una Contraseña de aplicación de 16 caracteres, no tu contraseña normal."
    );
  }
  if (String(error?.code) === "ETIMEDOUT" || String(error?.code) === "ESOCKET") {
    console.error("   Revisa el puerto: 587 (o 465 con SMTP_PORT=465) y que no haya firewall/proxy.");
  }
  process.exit(1);
});

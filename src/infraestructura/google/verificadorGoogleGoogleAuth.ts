import { OAuth2Client } from "google-auth-library";
import { DatosGoogle, VerificadorGoogle } from "../../dominio/puertos/verificadorGoogle";

export class VerificadorGoogleGoogleAuth implements VerificadorGoogle {
  private cliente: OAuth2Client;

  constructor(private clientId: string) {
    this.cliente = new OAuth2Client(clientId);
  }

  async verificar(idToken: string): Promise<DatosGoogle | null> {
    try {
      const ticket = await this.cliente.verifyIdToken({
        idToken,
        audience: this.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload?.email) return null;

      return {
        correo: payload.email.toLowerCase(),
        nombre: payload.name || payload.email.split("@")[0],
        emailVerificado: payload.email_verified === true,
      };
    } catch {
      return null;
    }
  }
}

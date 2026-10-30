export interface MensajeCorreo {
  para: string;
  asunto: string;
  html: string;
  texto?: string;
}

/** PUERTO de salida para enviar correos. */
export interface EnviadorCorreo {
  enviar(mensaje: MensajeCorreo): Promise<void>;
}

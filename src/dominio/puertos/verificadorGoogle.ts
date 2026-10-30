export interface DatosGoogle {
  correo: string;
  nombre: string;
  emailVerificado: boolean;
}

/** PUERTO de salida: verifica un ID token emitido por Google. */
export interface VerificadorGoogle {
  verificar(idToken: string): Promise<DatosGoogle | null>;
}

export interface RegistroReset {
  id: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
}

export interface RepositorioReset {
  crear(datos: { id: string; tokenHash: string; userId: string; expiresAt: Date }): Promise<void>;
  buscarPorHash(tokenHash: string): Promise<RegistroReset | null>;
  marcarUsado(id: string): Promise<void>;
  /** Borra los tokens pendientes del usuario (se invalida el anterior). */
  invalidarDeUsuario(userId: string): Promise<void>;
}

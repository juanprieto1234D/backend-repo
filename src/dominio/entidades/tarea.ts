export class Tarea {
  constructor(
    public readonly id: string,
    public readonly titulo: string,
    public readonly descripcion: string | null,
    public readonly completada: boolean,
    public readonly fechaLimite: Date | null,
    public readonly creadaEn: Date,
    public readonly usuarioId: string
  ) {}
}
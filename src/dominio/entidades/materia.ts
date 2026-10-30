export class Materia {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly color: string,
    public readonly icono: string,
    public readonly creadaEn: Date,
    public readonly usuarioId: string
  ) {}
}

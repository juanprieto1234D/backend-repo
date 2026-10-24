export class Usuario {
  constructor(
    public readonly id: string,
    public readonly correo: string,
    public readonly contrasena: string,
    public readonly nombre: string,
    public readonly creadoEn: Date,
    public readonly rol: "USUARIO" | "ADMIN" = "USUARIO",
    public readonly activo: boolean = true
  ) {}
}
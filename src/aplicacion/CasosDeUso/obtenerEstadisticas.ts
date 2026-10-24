import { RepositorioUsuarios } from "../../dominio/puertos/repositorioUsuario";
import { RepositorioTareas } from "../../dominio/puertos/repositorioTarea";

export interface EstadisticasSistema {
  totalUsuarios: number;
  totalTareas: number;
  completadas: number;
  pendientes: number;
  usuariosUltimos7Dias: number;
}

export class ObtenerEstadisticas {
  constructor(
    private repositorioUsuarios: RepositorioUsuarios,
    private repositorioTareas: RepositorioTareas
  ) {}

  async ejecutar(): Promise<EstadisticasSistema> {
    const totalUsuarios = await this.repositorioUsuarios.contarTotal();
    const totalTareas = await this.repositorioTareas.contarTotal();
    const completadas = await this.repositorioTareas.contarCompletadas();
    const pendientes = await this.repositorioTareas.contarPendientes();

    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);
    const usuariosUltimos7Dias = await this.repositorioUsuarios.contarRegistradosDesde(hace7Dias);

    return {
      totalUsuarios,
      totalTareas,
      completadas,
      pendientes,
      usuariosUltimos7Dias,
    };
  }
}

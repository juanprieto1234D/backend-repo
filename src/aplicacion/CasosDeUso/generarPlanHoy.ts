import { GeneradorPlan } from '../../dominio/puertos/generadorPlan';

export class GenerarPlanHoyUseCase {
  constructor(private generadorPlan: GeneradorPlan) {}

  async ejecutar(tareasPendientes: any[]): Promise<string> {
    if (!tareasPendientes || tareasPendientes.length === 0) {
      return "¡No tienes tareas pendientes! Disfruta tu día 🎉";
    }
    return this.generadorPlan.generarPlan(tareasPendientes);
  }
}
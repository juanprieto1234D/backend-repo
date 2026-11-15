export interface GeneradorPlan {
  // Recibe las tareas y devuelve un texto con el plan priorizado
  generarPlan(tareas: any[]): Promise<string>;
}
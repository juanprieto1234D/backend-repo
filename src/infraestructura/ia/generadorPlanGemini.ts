import { GoogleGenAI } from '@google/genai';
import { GeneradorPlan } from '../../dominio/puertos/generadorPlan';

export class GeneradorPlanGemini implements GeneradorPlan {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generarPlan(tareas: any[]): Promise<string> {
    // Convertimos las tareas a un texto simple para la IA
    const tareasTexto = tareas.map(t => 
      `- Título: ${t.titulo}, Materia: ${t.materia || 'General'}, Fecha Límite: ${t.fechaLimite || 'Sin fecha'}`
    ).join('\n');

       const prompt = `Eres un tutor experto en productividad. Basándote en estas tareas pendientes:\n${tareasTexto}\n\nDime cuáles 3 tareas debería hacer HOY.\n\nREGLAS ESTRICTAS:\n1. Sé ultra breve (máximo 15 palabras por tarea).\n2. No uses saludos ni despedidas.\n3. No uses formato Markdown (nada de asteriscos).\n4. Usa este formato exacto por línea:\nTarea - Razón breve.`;

        const modelos = [
      'gemini-3.1-flash-lite', // 👈 El rey de la cuota (500 peticiones al día)
      'gemini-3.5-flash-lite', // 👈 Opción secundaria
      'gemini-3.5-flash'       // 👈 Solo como último recurso
    ];
    let ultimoError: any = null;

    for (const modelo of modelos) {
      try {
        const response = await this.ai.models.generateContent({
          model: modelo,
          contents: prompt,
        });

        if (response.text) return response.text;
      } catch (error: any) {
        console.warn(`[Plan] Falló el modelo ${modelo}:`, error.message);
        ultimoError = error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    throw new Error('No se pudo generar el plan diario.');
  }
}
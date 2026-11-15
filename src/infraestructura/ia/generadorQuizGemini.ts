import { GoogleGenAI, Type } from '@google/genai';
import { GeneradorQuiz, PreguntaQuiz } from '../../dominio/puertos/generadorQuiz';
import fs from 'fs';
import path from 'path';

export class GeneradorQuizGemini implements GeneradorQuiz {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generar(textoContexto: string, adjuntos?: any[]): Promise<PreguntaQuiz[]> {
    const prompt = `Eres un profesor experto. Basándote en la información proporcionada, genera un quiz de 5 preguntas de opción múltiple.\n\nInformación de la tarea:\n${textoContexto}`;
    
    // Array de partes para enviar a Gemini (texto + archivos)
    const parts: any[] = [{ text: prompt }];

    // 👇 LÓGICA COPIADA DE TU SERVICIOGEMINI: Leer los archivos y adjuntarlos
    if (adjuntos && adjuntos.length > 0) {
      for (const adjunto of adjuntos) {
        try {
          const rutaArchivo = path.join(process.cwd(), "uploads", adjunto.ruta);
          if (fs.existsSync(rutaArchivo)) {
            const extension = path.extname(adjunto.nombre).toLowerCase();
            const buffer = fs.readFileSync(rutaArchivo);
            const base64Data = buffer.toString("base64");

            let mimeType = adjunto.mimeType || "";
            if (!adjunto.mimeType) {
              if (extension === ".pdf") mimeType = "application/pdf";
              else if (extension === ".png") mimeType = "image/png";
              else if (extension === ".jpg" || extension === ".jpeg") mimeType = "image/jpeg";
              else if (extension === ".webp") mimeType = "image/webp";
            }

            if (mimeType.startsWith("image/") || mimeType === "application/pdf") {
              parts.push({ inlineData: { data: base64Data, mimeType } });
            }
          }
        } catch (err) {
          console.warn(`[Quiz] No se pudo leer el adjunto ${adjunto.nombre}:`, err);
        }
      }
    }
    const modelos = [
      'gemini-3.1-flash-lite', // 👈 El rey de la cuota (500 peticiones al día)
      'gemini-3.5-flash-lite', // 👈 Opción secundaria
      'gemini-3.5-flash'       // 👈 Solo como último recurso
    ];
    let ultimoError: any = null;

    for (const modelo of modelos) {
      try {
        console.log(`[Quiz] Intentando generar con modelo: ${modelo}...`);
        
        const response = await this.ai.models.generateContent({
          model: modelo,
          contents: parts, // 👈 Pasamos el array con texto y archivos
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pregunta: { type: Type.STRING },
                  opciones: { type: Type.ARRAY, items: { type: Type.STRING } },
                  respuestaCorrecta: { type: Type.NUMBER },
                  explicacion: { type: Type.STRING },
                },
                required: ['pregunta', 'opciones', 'respuestaCorrecta', 'explicacion'],
              },
            },
          },
        });

        const textoJson = response.text;
        if (!textoJson) throw new Error('No se pudo generar el quiz (respuesta vacía)');
        
        console.log(`[Quiz] ¡Éxito con el modelo ${modelo}!`);
        return JSON.parse(textoJson) as PreguntaQuiz[];

      } catch (error: any) {
        console.warn(`[Quiz] Falló el modelo ${modelo}:`, error.message || error);
        ultimoError = error;
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    throw new Error('El servicio de IA está saturado. Intenta de nuevo en unos segundos.');
  }
}
import { GoogleGenAI, Type } from '@google/genai';
import { GeneradorFlashcards, TarjetaMemoria } from '../../dominio/puertos/generadorFlashcards';
import fs from 'fs';
import path from 'path';

export class GeneradorFlashcardsGemini implements GeneradorFlashcards {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generar(textoContexto: string, adjuntos?: any[]): Promise<TarjetaMemoria[]> {
    const prompt = `Eres un profesor experto. Basándote en la información proporcionada, genera 5 tarjetas de memoria (flashcards) para estudiar.\n\nInformación:\n${textoContexto}`;
    const parts: any[] = [{ text: prompt }];

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
            }
            if (mimeType.startsWith("image/") || mimeType === "application/pdf") {
              parts.push({ inlineData: { data: base64Data, mimeType } });
            }
          }
        } catch (err) {}
      }
    }

    // Usamos los modelos rápidos
    const modelos = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.5-flash'];
    
    for (const modelo of modelos) {
      try {
        const response = await this.ai.models.generateContent({
          model: modelo,
          contents: parts,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  frente: { type: Type.STRING }, // Pregunta
                  reverso: { type: Type.STRING }, // Respuesta
                },
                required: ['frente', 'reverso'],
              },
            },
          },
        });

        if (response.text) return JSON.parse(response.text) as TarjetaMemoria[];
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    throw new Error('No se pudieron generar las flashcards.');
  }
}
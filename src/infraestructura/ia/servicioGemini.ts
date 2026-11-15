import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

// Inicializa el cliente de Gemini con la API Key configurada
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export interface DatosTareaParaTips {
  titulo: string;
  descripcion?: string | null;
  materia?: string | null;
  adjuntos?: Array<{
    nombre: string;
    ruta: string;
    mimeType?: string | null;
  }>;
}

export async function generarTipsParaTarea(datos: DatosTareaParaTips): Promise<string> {
  // Texto base del prompt
  let promptTexto = `Analiza la siguiente tarea académica y proporciona al estudiante una guía estructurada para que la resuelva exitosamente por sí mismo.

INFORMACIÓN DE LA TAREA:
- Título: ${datos.titulo}
- Descripción: ${datos.descripcion || "Sin descripción proporcionada"}
- Materia/Asignatura: ${datos.materia || "General"}`;

  if (datos.adjuntos && datos.adjuntos.length > 0) {
    promptTexto += `\n- Documentos adjuntos: ${datos.adjuntos.map((a) => a.nombre).join(", ")}`;
  }

    const systemInstruction = `Eres un tutor académico universitario para TaskUp.
Tu misión es dar claridad, motivación y método de trabajo al estudiante.

REGLAS ESTRICTAS:
1. NUNCA resuelvas los ejercicios, no des respuestas finales.
2. Sé muy breve y conciso (máximo 2 o 3 líneas por punto).
3. NO USES MARKDOWN (nada de asteriscos *, almohadillas #, ni guiones ---).
4. Estructura tu respuesta usando EXACTAMENTE este formato de 4 bloques, separados por un salto de línea doble:

📌 ENFOQUE DE LA ACTIVIDAD
[Escribe aquí el texto breve]

🧠 CONCEPTOS CLAVE
[Escribe aquí el texto breve]

🗺️ PLAN DE ACCIÓN
[Escribe aquí el texto breve]

💡 CONSEJO PRO
[Escribe aquí el texto breve]`;
  // ── ESTRATEGIA 1: Interactions API (recomendada por Google para cuentas nuevas) ──
  // Construir el input como array multimodal
  const inputArray: any[] = [];

  // Intentar adjuntar archivos si los hay (Interactions API soporta imágenes/PDFs)
  if (datos.adjuntos && datos.adjuntos.length > 0) {
    for (const adjunto of datos.adjuntos) {
      try {
        const rutaArchivo = path.join(process.cwd(), "uploads", adjunto.ruta);
        if (fs.existsSync(rutaArchivo)) {
          const extension = path.extname(adjunto.nombre).toLowerCase();
          const buffer = fs.readFileSync(rutaArchivo);

          let mimeType = adjunto.mimeType || "";
          if (!adjunto.mimeType) {
            if (extension === ".pdf") mimeType = "application/pdf";
            else if (extension === ".png") mimeType = "image/png";
            else if (extension === ".jpg" || extension === ".jpeg") mimeType = "image/jpeg";
            else if (extension === ".webp") mimeType = "image/webp";
          }

          if (mimeType.startsWith("image/")) {
            inputArray.push({ type: "image", mime_type: mimeType, data: buffer });
          } else if (mimeType === "application/pdf") {
            inputArray.push({ type: "image", mime_type: mimeType, data: buffer });
          }
        }
      } catch (err) {
        console.error("[Gemini] Error al leer archivo adjunto:", err);
      }
    }
  }

  // Agregar el texto del prompt
  inputArray.push({ type: "text", text: promptTexto });

  // Modelos a intentar (el 404 es definitivo, el 503 es temporal → reintentamos)
    const modelos = [
    "gemini-3.1-flash-lite", // 👈 Prioridad 1
    "gemini-3.5-flash-lite", // 👈 Prioridad 2
    "gemini-3.5-flash"
  ];

  const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const MAX_REINTENTOS = 3;

  // ── Intentar con Interactions API con reintentos en 503 ──
  for (const modelo of modelos) {
    for (let intento = 1; intento <= MAX_REINTENTOS; intento++) {
      try {
        console.log(`[Gemini] Interactions API | ${modelo} | intento ${intento}/${MAX_REINTENTOS}`);
        const interaction = await (ai as any).interactions.create({
          model: modelo,
          system_instruction: systemInstruction,
          input: inputArray,
        });

        const texto: string =
          interaction?.output_text ||
          interaction?.output ||
          interaction?.timeline
            ?.find((s: any) => s.type === "model_output")
            ?.content?.find((c: any) => c.type === "output_text")?.text ||
          "";

        if (texto) {
          console.log(`[Gemini] ✅ Interactions API funcionó con: ${modelo} (intento ${intento})`);
          return texto;
        }
        // Si no hay texto pero tampoco error, salimos del reintento
        break;
      } catch (err: any) {
        const status = err?.status ?? err?.code ?? 0;
        console.warn(`[Gemini] Interactions API | ${modelo} | intento ${intento} | (${status}): ${err?.message?.slice(0, 80)}`);

        if (status === 404) break; // 404 = modelo no disponible → pasar al siguiente sin esperar
        if (status === 503 && intento < MAX_REINTENTOS) {
          const espera = intento * 2000; // 2s, 4s entre reintentos
          console.log(`[Gemini] Alta demanda, esperando ${espera / 1000}s antes de reintentar...`);
          await esperar(espera);
        }
      }
    }
  }

  // ── ESTRATEGIA 2: Fallback con generateContent (API clásica) ──
  console.log("[Gemini] Probando fallback con generateContent...");
  const parts: any[] = [{ text: promptTexto }];

  // Volver a agregar archivos como inlineData
  if (datos.adjuntos && datos.adjuntos.length > 0) {
    for (const adjunto of datos.adjuntos) {
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
      } catch (_) {}
    }
  }

  let ultimoError: any = null;
  for (const modelo of modelos) {
    for (let intento = 1; intento <= MAX_REINTENTOS; intento++) {
      try {
        console.log(`[Gemini] generateContent | ${modelo} | intento ${intento}/${MAX_REINTENTOS}`);
        const response = await ai.models.generateContent({
          model: modelo,
          contents: parts,
          config: { systemInstruction },
        });
        if (response.text) {
          console.log(`[Gemini] ✅ generateContent funcionó con: ${modelo} (intento ${intento})`);
          return response.text;
        }
        break;
      } catch (err: any) {
        const status = err?.status ?? 0;
        console.warn(`[Gemini] generateContent | ${modelo} | intento ${intento} | (${status}): ${err?.message?.slice(0, 80)}`);
        ultimoError = err;
        if (status === 404) break;
        if (status === 503 && intento < MAX_REINTENTOS) {
          const espera = intento * 2000;
          console.log(`[Gemini] Alta demanda, esperando ${espera / 1000}s...`);
          await esperar(espera);
        }
      }
    }
  }

  throw ultimoError || new Error("No se pudo contactar a ningún modelo de Gemini.");
}

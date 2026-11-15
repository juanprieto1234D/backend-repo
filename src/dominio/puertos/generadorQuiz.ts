export interface PreguntaQuiz {
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number;
  explicacion: string;
}

export interface GeneradorQuiz {
  // 👇 El cambio está aquí: agregamos el segundo parámetro
  generar(textoContexto: string, adjuntos?: any[]): Promise<PreguntaQuiz[]>;
}
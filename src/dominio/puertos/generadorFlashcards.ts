export interface TarjetaMemoria {
  frente: string; // La pregunta o término
  reverso: string; // La respuesta o definición
}

export interface GeneradorFlashcards {
  generar(textoContexto: string, adjuntos?: any[]): Promise<TarjetaMemoria[]>;
}
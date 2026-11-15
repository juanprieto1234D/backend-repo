import { GeneradorQuiz, PreguntaQuiz } from '../../dominio/puertos/generadorQuiz';
import { RepositorioTareas } from '../../dominio/puertos/repositorioTarea';

export class GenerarQuizUseCase {
  constructor(
    private generadorQuiz: GeneradorQuiz,
    private repositorioTareas: RepositorioTareas
  ) {}

  async ejecutar(tareaId: string): Promise<PreguntaQuiz[]> {
    const tarea = await this.repositorioTareas.buscarPorId(tareaId);
    if (!tarea) throw new Error('Tarea no encontrada');

    let textoContexto = '';
    const adjuntos = (tarea as any).adjuntos || [];

    // Si hay adjuntos, le decimos a la IA que se base en ellos
    if (adjuntos.length > 0) {
      textoContexto = `Genera un quiz basado estrictamente en el documento adjunto a la tarea: "${tarea.titulo}".`;
    } 
    // Si no hay adjuntos, usamos la descripción o el título
    else if (tarea.descripcion && tarea.descripcion.trim().length > 15) {
      textoContexto = tarea.descripcion || '';
    } 
    else {
      textoContexto = `Genera preguntas generales de estudio sobre el tema: "${tarea.titulo}".`;
    }

    // 👇 Le pasamos el texto Y los adjuntos al adaptador
    return this.generadorQuiz.generar(textoContexto, adjuntos);
  }
}
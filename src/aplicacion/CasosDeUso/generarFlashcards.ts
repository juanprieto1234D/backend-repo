import { GeneradorFlashcards, TarjetaMemoria } from '../../dominio/puertos/generadorFlashcards';
import { RepositorioTareas } from '../../dominio/puertos/repositorioTarea';

export class GenerarFlashcardsUseCase {
  constructor(
    private generadorFlashcards: GeneradorFlashcards,
    private repositorioTareas: RepositorioTareas
  ) {}

  async ejecutar(tareaId: string): Promise<TarjetaMemoria[]> {
    const tarea = await this.repositorioTareas.buscarPorId(tareaId);
    if (!tarea) throw new Error('Tarea no encontrada');

    let textoContexto = '';
    const adjuntos = (tarea as any).adjuntos || [];

    if (adjuntos.length > 0) {
      textoContexto = `Genera tarjetas de memoria basadas estrictamente en el documento adjunto a la tarea: "${tarea.titulo}".`;
    } else if (tarea.descripcion && tarea.descripcion.trim().length > 15) {
      textoContexto = tarea.descripcion || '';
    } else {
      textoContexto = `Genera tarjetas de memoria generales para estudiar el tema: "${tarea.titulo}".`;
    }

    return this.generadorFlashcards.generar(textoContexto, adjuntos);
  }
}
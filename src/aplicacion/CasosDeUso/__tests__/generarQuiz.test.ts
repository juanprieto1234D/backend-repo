import { GenerarQuizUseCase } from '../generarQuiz';
import { GeneradorQuiz } from '../../../dominio/puertos/generadorQuiz';

// Simulamos el puerto del generador de IA
const generadorMock: GeneradorQuiz = {
  generar: jest.fn().mockResolvedValue([
    { pregunta: '¿Pregunta de prueba?', opciones: ['A', 'B', 'C', 'D'], respuestaCorrecta: 0, explicacion: 'Explicación de prueba' }
  ])
};

// Simulamos el repositorio de tareas
const repositorioMock = {
  buscarPorId: jest.fn().mockResolvedValue({
    id: '123',
    titulo: 'Parcial de Bases de Datos',
    descripcion: 'Estudiar consultas SQL y álgebra relacional', // Tiene más de 15 caracteres
    adjuntos: []
  })
} as any;

describe('GenerarQuizUseCase', () => {
  it('debe generar un quiz basándose en la descripción si no hay adjuntos', async () => {
    const casoUso = new GenerarQuizUseCase(generadorMock, repositorioMock);
    
    const resultado = await casoUso.ejecutar('123');
    
    // Verificamos que devuelva el quiz
    expect(resultado).toHaveLength(1);
    expect(resultado[0].pregunta).toBe('¿Pregunta de prueba?');
    
    // Verificamos que el generador fue llamado con el texto correcto (la descripción) Y los adjuntos vacíos
    expect(generadorMock.generar).toHaveBeenCalledWith(
      expect.stringContaining('Estudiar consultas SQL'),
      [] // 👈 AQUÍ ESTÁ LA CORRECCIÓN: Añadimos el segundo parámetro
    );
  });
});
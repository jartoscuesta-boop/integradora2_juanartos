# Declaración de Uso de Inteligencia Artificial

## 1. ¿Qué herramientas de IA utilizó y en qué momentos?
- **Herramienta:** Asistente de Inteligencia Artificial (Gemini).
- **Momentos de uso:** Se empleó como apoyo técnico durante las fases de estructuración semántica de las etiquetas HTML/CSS, la revisión de sintaxis en el código JavaScript Vanilla (ES6+), y la conceptualización de la arquitectura basada en eventos (`CustomEvent`).

## 2. Prompts clave utilizados durante el desarrollo
1. *"Ayúdame a verificar la estructuración semántica de las etiquetas HTML en la interfaz y revisa si hay errores de sintaxis en el CSS."*
2. *"Revisa la sintaxis de la lógica en JavaScript Vanilla para el manejo del localStorage y la implementación de CustomEvents."*

## 3. ¿Qué partes del código sugerido por la IA contenían errores o requirieron ajustes manuales para integrarse correctamente a su proyecto?
- **Selectores del DOM:** Algunas referencias y nombres de clases o IDs sugeridos inicialmente en las funciones de JavaScript no coincidían de forma exacta con los elementos definidos en el `index.html`. Se realizaron ajustes manuales en los selectores (`getElementById`, `querySelector`) para asegurar la vinculación correcta de los eventos y la actualización del DOM.
- **Mapeo de datos de la API REST:** Los objetos proporcionados por la API pública de prueba (JSONPlaceholder) solo contenían campos básicos de tareas (`userId`, `id`, `title`, `completed`). Fue necesario ajustar manualmente la lógica de integración para mapear esos datos y añadirles propiedades de prioridad (`Alta`, `Media`, `Baja`) y marcas de tiempo (`createdAt`) acordes a los requerimientos de ordenamiento y filtrado de la tarea.
# Programas políticos

El catálogo local contiene programas oficiales de candidaturas al Congreso en las elecciones generales del 23J de 2023. La fuente de cada programa y su ámbito constan en el catálogo. No hay red ni backend requerido y los presets se aplican como configuración editable.

## Interpretación estandarizada

Un preset codifica posiciones expresadas en el programa mediante una escala común `-2, -1, 0, +1, +2` para los ocho controles actuales. Cada paso se convierte con el baseline, step y límites que ya usa el control. No se estiman costes, tipos efectivos ni efectos fiscales completos. El preset traduce solo las medidas identificables a los controles disponibles; no reproduce íntegramente un programa electoral ni predice el comportamiento real futuro de una candidatura.

- `DOCUMENTED + DIRECT`: equivalencia numérica literal, reservada para casos en que la unidad y semántica coinciden.
- `APPROXIMATED + STANDARDIZED_CODING`: posición textual interpretada mediante la rúbrica común. La interfaz lo denomina **Interpretación estandarizada del programa**.
- `UNMAPPED + NONE`: falta evidencia para asignar una posición; se conserva el valor actual. No implica que el programa proponga mantenerlo.

El score `0` significa que sí hay evidencia de mantenimiento o neutralidad programática; no equivale a `UNMAPPED`. La codificación no usa reputación, historia, familia ideológica ni nombre del actor como señal. Las posiciones y su evidencia aún requieren aprobación humana.

Consulta [metodología](political-presets/METHODOLOGY.md), [cobertura y mapeos 23J](political-presets/23J-2023-MAPPING.md), [tabla de revisión humana](political-presets/23J-2023-CODING-REVIEW.md), [JSON de codificación](political-presets/coding/) e [inventarios por candidatura](political-presets/inventory/).

Los inventarios creados durante la revisión cuantitativa siguen disponibles como evidencia, pero sus decisiones preliminares de `UNMAPPED` basadas en ausencia de una microsimulación quedan supersedidas por la rúbrica de posición. El análisis cuantitativo previo de componentes de Sumar se conserva como antecedente y no es la fuente del valor visible en producto.

## Aplicación y procedencia

El acceso inicial y el acceso desde `Configurar` usan el mismo catálogo. Aplicar un programa solo prepara un borrador editable. En mes 0 se confirma mediante el flujo normal. Después de avanzar, se propone como alternativa desde el estado actual: se conserva la historia y los cambios surten efecto en el paso siguiente. Un control `UNMAPPED` conserva el valor vigente de esa rama. El máximo sigue siendo dos trayectorias.

La procedencia es metadato opcional, no interviene en cálculos, y se conserva al exportar e importar. Las sesiones anteriores sin esta información siguen siendo válidas.

## Añadir o revisar un preset

1. Identificar actor/candidatura y elección concreta.
2. Usar el programa oficial y fijar su fecha de corte.
3. Registrar evidencia textual, IDs estables y localizadores en el inventario.
4. Codificar los ocho controles con la misma rúbrica; mantener `UNMAPPED` cuando no haya base textual suficiente.
5. Verificar ámbito estatal y evitar usar una medida en varios controles sin componentes explícitamente separables.
6. Comparar cada score con la tabla de revisión humana y obtener aprobación antes de considerarlo definitivo.

No inferir posiciones por ideología, no sumar magnitudes heterogéneas ni crear score, ranking o predicción de candidaturas.

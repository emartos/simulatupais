# Contribuir a Simula tu país

Gracias por ayudar a mejorar el proyecto. Las propuestas públicas pueden plantearse en [GitHub Issues](https://github.com/emartos/simulatupais/issues). Para cambios amplios, conviene acordar el enfoque antes de desarrollar la implementación completa.

## Añadir un nuevo país

España es la primera implementación. La dirección aprobada es incorporar nuevos países dentro del mismo proyecto, sobre una plataforma común, y no mantener una bifurcación del producto por país. El principio arquitectónico es: **el país debe ser configuración o implementación sobre una plataforma común, no una bifurcación del producto**.

La arquitectura actual aún no satisface por completo ese objetivo. Para proponer un país, abre una [issue de propuesta](https://github.com/emartos/simulatupais/issues/new?template=propuesta-nuevo-pais.yml) o contacta con las personas mantenedoras antes de una implementación extensa. Esto permite acordar el diseño y compartir mejoras entre países. Un fork temporal para preparar una contribución es válido; no recomendamos mantener con él una versión de país independiente y divergente.

La propuesta debería ayudar a concretar:

- fuentes de datos y sus condiciones de uso;
- año y base temporal de partida;
- indicadores disponibles, definiciones y unidades;
- decisiones o políticas que se quieren modelar;
- parámetros específicos del país;
- adaptaciones necesarias del motor común;
- localización e idioma;
- metodología, supuestos y documentación;
- pruebas de regresión y referencias esperadas;
- separación entre comportamiento genérico y comportamiento específico del país.

### Estado actual y trabajo futuro

La implementación disponible está centrada en España. Entre los acoplamientos que habría que abordar al diseñar el segundo país están el archivo `public/data/spain.json` y su comprobación de código `ES`, las rutas del build que nombran ese archivo, las etiquetas de interfaz que dicen España y unidades/formatos que presuponen euros y convenciones españolas. El motor recibe un catálogo de datos, pero eso por sí solo no demuestra que pueda representar correctamente otros países. No se afirma aquí que exista ya un sistema de plugins o una arquitectura multinacional completa.

Una contribución futura debería identificar qué reglas son comunes y cuáles dependen del país, y proponer los cambios mínimos necesarios para integrarlas. Esta política orienta la colaboración y la arquitectura; no modifica ni añade condiciones a la licencia del proyecto.

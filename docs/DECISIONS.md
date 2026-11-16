# Registro de decisiones

## 16 de noviembre de 2026

- D001: el modo clásico de tres misiones es la base; las expediciones se incorporarán después como alternativa. Motivo: mantener el bucle solicitado y evitar confundir ambos modos.
- D002: generación controlada mediante catálogos versionados. No se requieren llamadas a IA para cada misión. Motivo: reglas consistentes, coste previsible y operación fiable.
- D003: documentos de referencia en GitHub. MASTER_PLAN.md es la fuente del Word; PROGRESS.md y BACKLOG.md registran implementación y siguiente tarea. Motivo: continuidad entre sesiones.
- D004: no se presentan las fórmulas propuestas como fórmulas oficiales. Motivo: distinguir fidelidad de estructura y equilibrio propio verificable.
- D005: el usuario autoriza continuar el desarrollo una vez terminada la documentación. Trabajar por fases y actualizar evidencia. Esta instrucción no autoriza contratar servicios de pago.
- D006: el primer entorno de pruebas de base de datos será un PostgreSQL 17 efímero en GitHub Actions, con autenticación mínima simulada y sin acceso a usuarios reales. No crear una rama facturable de Supabase para esta entrega.
- D007: el núcleo clásico se publica como `classic-1`. Las reglas son compartidas mediante catálogos compilados y pruebas de igualdad JS y SQL. Después de publicar, una nueva versión de equilibrio necesita funciones versionadas distintas para respetar los contratos pendientes.
- D008: las cien unidades de aventura se reponen a medianoche de Europe/Madrid. Las misiones cuestan 5, 8 o 10 y duran treinta segundos por unidad. Arena de entrenamiento y reto de mazmorra tienen esperas de diez minutos y una hora respectivamente, sin consumo de aventura. Son valores propios iniciales para probar.
- D009: el nuevo estado online, los recibos y los movimientos viven en el esquema privado. El cliente anterior solicita recarga y no puede seguir modificando una economía paralela. Las partidas anteriores se conservan y se convierten al acceder.
- D010: la guía contextual se implementa como una capa independiente. Las reglas económicas y de combate classic-1 se mantienen congeladas después de v0.2.0. El avance se guarda en el personaje y los reintentos antiguos no lo alteran.

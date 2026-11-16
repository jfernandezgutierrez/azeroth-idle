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
- D011: el equipo se versiona como gear-1 y usa identificadores de instancia dentro del personaje. La clave de propiedad es personaje e identificador; no se permiten compras ni equipamientos enviando atributos o precios desde el cliente. Las filas de personaje siguen bloqueándose durante cada acción.
- D012: mochila inicial de veinte objetos incluyendo los equipados y bandeja de cincuenta. En v0.3 la bandeja no caduca; se impide iniciar aventuras si ambos espacios están llenos. La caducidad visible del diseño objetivo y el reciclaje quedan pendientes, sin pérdida silenciosa de premios.
- D013: cuatro rarezas iniciales y veintiuna plantillas. Las piezas legendarias, afijos especiales y servicios de herrero corresponden a fases posteriores. La primera armería agrupa equipo de la clase, incluidos báculos; no se anuncia una tienda de consumibles terminada.
- D014: el Guerrero bloquea con un escudo equipado. La conversión entrega un broquel sin estadísticas ni valor de venta para conservar el bloqueo que ya tenía la clase. Las misiones pendientes conservan su ficha anterior; no se recalculan con el equipo nuevo.
- D015: v0.3 usa realm_command_v3. La API anterior solicita recarga para evitar escrituras con el inventario antiguo. Los motores y contratos classic-1 se conservan y el equipo genera fichas compatibles con ese combate.

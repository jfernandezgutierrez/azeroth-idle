# Plan maestro de diseño y producción de Azeroth Idle

Documento de referencia para construir y mantener el juego completo

Versión 1.0 · 16 de noviembre de 2026

Propietario del producto Javier Fernández Gutiérrez

Repositorio https://github.com/jfernandezgutierrez/azeroth-idle

## Propósito y decisiones principales

Construiremos un RPG de navegador con la estructura de juego de las misiones clásicas de Shakes & Fidget: seleccionar entre encargos, invertir tiempo de aventura, resolver combates automáticos, conseguir equipo, entrenar atributos y competir mediante progreso personal y social. La ambientación solicitada sitúa a la Horda en Orgrimmar y a la Alianza en Ventormenta. Ambas facciones compartirán reglas y oportunidades equivalentes.

El juego completo se organizará alrededor de un motor de reglas y catálogos versionados. Las misiones, enemigos, objetos, recompensas y eventos se generarán automáticamente dentro de límites de diseño. Así podremos ampliar el contenido y equilibrarlo sin modificar repetidamente el código de cada pantalla.

Este documento define el producto objetivo, sus reglas iniciales, la arquitectura, las pruebas y el orden de construcción. Los valores numéricos propuestos son hipótesis de nuestro juego y deberán validarse con simulaciones y partidas. No se presentan como fórmulas oficiales de Shakes & Fidget. La fidelidad buscada está en las decisiones, el ritmo y el combate automático; las desviaciones se registrarán expresamente.

La entrega existente es un prototipo. El contenido que aquí se describe como objetivo no debe anunciarse como implementado. Un juego profesional necesita operación continua, aunque las tareas habituales estén automatizadas. Ningún apartado promete funcionamiento indefinido sin intervención.

## Cómo utilizar este documento

El Word es la edición para lectura y revisión. El archivo docs/MASTER_PLAN.md es su fuente editable y consultable por los asistentes. docs/PROGRESS.md conserva el estado de trabajo y el siguiente paso. El archivo AGENTS.md indica cómo continuar desde otra sesión. GitHub conserva las versiones y decisiones.

Antes de desarrollar, leer estos archivos, comprobar el código real y elegir una tarea desbloqueada del plan. Después de cada entrega, registrar cambios, pruebas, limitaciones y siguiente tarea. Si se modifica el diseño, actualizar la fuente y regenerar el Word. Si Javier edita el Word directamente, incorporar primero sus cambios a la fuente para no perderlos.

El acceso futuro depende de conservar el repositorio y la conexión o una copia local. El documento permite recuperar el contexto sin depender de la memoria de un chat. No implica que el asistente trabaje en segundo plano o pueda entrar en servicios sin conexión disponible.

<!-- page -->

## 1 Alcance y definición del juego completo

El producto objetivo es un RPG incremental multijugador asíncrono, accesible desde ordenador y móvil. El jugador prepara a su personaje y toma decisiones antes del combate. No controla desplazamientos en un mundo tridimensional ni ejecuta habilidades mediante reflejos durante una pelea.

La primera edición completa debe cubrir una partida prolongada: introducción, crecimiento, colecciones, cooperación, competición y objetivos avanzados. Los sistemas se desbloquearán de forma progresiva para que el jugador no reciba veinte menús al empezar. Cada desbloqueo tendrá una explicación y una primera acción guiada.

| Área | Incluido en el producto objetivo | Criterio de cierre |
| --- | --- | --- |
| Aventura | Misiones clásicas, expediciones opcionales y guardia | Progreso recuperable tras desconexión |
| Personaje | Clases, cinco atributos, equipo y entrenamiento | Cada atributo produce un efecto verificable |
| Combate | Turnos automáticos, registros y repetición | Resultado reproducible y validado en servidor |
| Progreso | Niveles, mazmorras, torre y desafíos sin fin | Hay objetivos útiles en todas las franjas |
| Comunidad | Arena PvP, gremios, correo y clasificaciones | Permisos, emparejamiento y moderación probados |
| Gestión | Fortaleza, subsuelo, producción y mejoras | Recursos calculados con límites y reloj del servidor |
| Colección | Mascotas, monturas, biblioteca y logros | Recompensas y condiciones visibles |
| Operación | Administración, eventos, alertas y recuperación | Despliegue y restauración ensayados |

No entran en la primera edición el combate en tiempo real, un mercado libre entre jugadores, el comercio por dinero real, el mundo abierto 3D ni aplicaciones nativas separadas. Podrán estudiarse después si no alteran el núcleo del juego.

La ambientación actual se tratará como dirección creativa del prototipo. Antes de una explotación pública o comercial habrá que decidir una identidad con recursos y nombres propios o disponer de las autorizaciones correspondientes. Esa decisión no cambia el diseño del motor ni exige rehacer los sistemas.

La versión completa se considerará alcanzada cuando todos los sistemas de esta matriz estén entregados, las pruebas de aceptación estén superadas y exista una versión desplegada y recuperable. Una pantalla decorativa, un botón sin acción o un sistema simulado localmente no cumplen ese criterio.

<!-- page -->

## 2 Estado real del proyecto y diferencias actuales

La referencia inicial es el commit 5f07f7f136bee732a293897e41f04c55075cf80d. El proyecto usa HTML, CSS y módulos JavaScript sin compilación. Supabase conserva el personaje online y valida las acciones principales. También existe una partida de práctica local independiente.

| Sistema | Existe hoy | Falta para la versión profesional |
| --- | --- | --- |
| Identidad y facción | Cuenta, tres clases y dos capitales | Razas, editor de apariencia y tutorial |
| Misiones | Tres encargos fijos repetibles | Generación, niveles, variedad y contratos persistentes |
| Combate | Comparación de poder con azar | Turnos, vida, daño, críticos y rasgos de clase |
| Atributos | Fuerza, aguante y suerte | Destreza e intelecto; efecto real de suerte |
| Equipo | Cuatro objetos y tres ranuras | Instancias, rareza, escalado, mochila y servicios |
| Mazmorra | Rival más fuerte tras cada victoria | Campañas, llaves, jefes y recompensas definidas |
| Arena | Rivales controlados por el juego | PvP real, honor y emparejamiento |
| Guardado | Local o una fila por cuenta online | Mundo, auditoría, versiones y recuperación |
| Arte | Dos capitales y doce ilustraciones | Animaciones, escenas, accesibilidad y audio |
| Calidad | Cinco pruebas de motor y CI | Pruebas integrales, carga, simulación y operación |

La energía del prototipo regenera un punto por minuto hasta cien. Esa regla no será la regla final del modo clásico. Se sustituirá por una reserva diaria de aventura y una política de reposición configurable. No se conservarán los valores actuales únicamente porque ya estén programados.

La arena actual no debe aparecer como competición entre usuarios. La mazmorra actual tampoco representa una campaña terminada. Las ilustraciones de personajes son imágenes estáticas en un atlas, no animaciones con todos sus estados.

Antes de transformar los datos habrá que exportar y comprobar las partidas reales. Una migración asignará atributos nuevos y convertirá los cuatro objetos en instancias sin duplicar oro ni experiencia. El modo de práctica deberá identificarse siempre como una simulación sin acceso a premios, clasificaciones ni economía online.

Esta tabla se actualizará al cerrar cada fase. Una tarea solo podrá pasar a completada después de verificar el comportamiento en la versión correspondiente y registrar la evidencia en docs/PROGRESS.md.

<!-- page -->

## 3 Fidelidad de la jugabilidad y experiencia diaria

La base elegida es el modo clásico. El manual oficial confirma que este modo permite elegir entre tres misiones con distintas recompensas y un coste de aventura, seguido de una espera [S1]. La documentación también describe expediciones como alternativa [S2]. Nuestro juego ofrecerá primero el modo clásico y añadirá el segundo sin cambiar silenciosamente el funcionamiento principal.

La secuencia principal será entrar en la capital, revisar encargos, comparar recompensa y tiempo, aceptar uno, preparar otras actividades mientras transcurre, ver el combate y recoger el resultado. Después se revisará la mochila, se elegirá equipo y se decidirá entre entrenar, explorar o competir. Elegir qué mejorar debe importar más que pulsar repetidamente un botón.

La sesión breve debe permitir consultar el estado, recoger tareas terminadas y comenzar otra en menos de dos minutos. Una sesión de diez a veinte minutos debe permitir revisar equipo, completar actividades secundarias y participar en el gremio. Estos tiempos son metas de experiencia, no límites obligatorios ni resultados ya medidos.

| Decisión | Información visible | Consecuencia esperada |
| --- | --- | --- |
| Elegir misión | Oro, EXP, duración, coste y riesgo aproximado | Priorizar dinero, nivel o botín |
| Cambiar objeto | Atributos, daño, vida y efectos comparados | Especializar o corregir una debilidad |
| Entrenar | Precio y efecto del siguiente punto | Elegir entre mejora inmediata y ahorro |
| Atacar en arena | Clase, rango y ficha pública del rival | Valorar el enfrentamiento |
| Entrar en mazmorra | Jefe, requisitos y recompensa principal | Medir un reto estable de progreso |

No habrá decisiones manuales obligatorias durante un combate. El jugador podrá verlo, acelerarlo o saltar a su resultado. El servidor resolverá la pelea una sola vez y la animación representará ese registro.

Habrá tres horizontes de progreso: mejorar algo en la sesión, desbloquear un sistema durante varios días y avanzar en colecciones o campañas durante semanas. Las tareas diarias servirán de orientación; no deberán exigir estar conectado todo el día ni perder recursos esenciales por no entrar unas horas.

Cada diferencia frente al referente se registrará en una matriz de fidelidad. Debe distinguir entre comportamiento confirmado, decisión propia y cuestión pendiente. No se afirmará una equivalencia exacta de fórmulas o contenido sin comprobarla.

<!-- page -->

## 4 Personaje facciones clases y atributos

La facción determinará capital, reparto de personajes, textos, música y presentación visual. Las oportunidades de progreso y los presupuestos de recompensa serán simétricos. No habrá una ventaja oculta por elegir Horda o Alianza. El cambio de facción no se habilitará hasta definir cómo afecta al gremio, al nombre y a las temporadas.

El lanzamiento incluirá Guerrero, Mago y Explorador. Cada clase tendrá su atributo ofensivo, defensa característica, equipo válido y comportamiento automático. Después se añadirán arquetipos como asesino, paladín, druida, chamán y nigromante mediante la misma interfaz de reglas. Estos nombres futuros son propuestas, no un compromiso de copiar todas las clases actuales del referente.

| Atributo | Función principal | Regla de diseño |
| --- | --- | --- |
| Fuerza | Ataque físico pesado y defensa relacionada | Ofensivo para Guerrero |
| Destreza | Ataque a distancia y agilidad | Ofensivo para Explorador |
| Intelecto | Potencia mágica y resistencia relacionada | Ofensivo para Mago |
| Aguante | Vida máxima | Útil para todas las clases |
| Suerte | Probabilidad de crítico | Efecto limitado y mostrado en porcentaje |

Los valores efectivos se calcularán a partir de atributos base, equipo, bonificaciones temporales y mejoras permanentes. La ficha mostrará el desglose para que se entienda por qué cambia una cifra. Las bonificaciones de distintos sistemas tendrán un orden de aplicación documentado; no se multiplicarán indiscriminadamente.

La raza aportará identidad y pequeñas diferencias iniciales. No debe invalidar una clase después de muchas horas. La apariencia se separará de los atributos y podrá ampliarse sin migrar las reglas de combate. Los retratos de los rivales serán públicos; correo, identidad de cuenta y datos de autenticación permanecerán privados.

La experiencia sobrante se conserva al subir de nivel. Un premio grande puede conceder varios niveles y sus mejoras se aplican exactamente una vez. Los puntos comprados se registrarán separados de los puntos recibidos por nivel. El precio de entrenamiento aumentará de forma monotónica y se podrá comprar una cantidad limitada de puntos mostrando el coste total antes de confirmar.

El poder resumido será una orientación, nunca el criterio que sustituya a un combate real. Dos héroes con poder parecido pueden tener resultados diferentes por su clase, su equipamiento y la distribución de atributos.

<!-- page -->

## 5 Combate automático y repetición de resultados

El motor recibirá dos fichas inmutables, una semilla aleatoria y una versión de reglas. Producirá un vencedor, un resumen y una lista de turnos. El cálculo será determinista: las mismas entradas deben producir exactamente la misma salida. El cliente no enviará ni decidirá el vencedor.

Cada turno comprobará el estado del atacante, los efectos de inicio, el ataque, las defensas permitidas, el crítico, la reducción de daño y la vida restante. Los efectos de final de turno se resolverán en un orden fijo. La pelea terminará con una derrota, una condición especial o un límite de seguridad de turnos definido en configuración.

| Clase inicial | Conducta objetivo | Prueba necesaria |
| --- | --- | --- |
| Guerrero | Vida alta, arma física y bloqueo con escudo | El bloqueo solo afecta a ataques compatibles |
| Explorador | Daño físico a distancia y evasión | La evasión respeta excepciones de tipo de ataque |
| Mago | Daño mágico y vida menor | La magia trata correctamente bloqueo y evasión |

Estas identidades siguen el tipo de diferencias descritas en la documentación de clases [S3]. Los coeficientes concretos de nuestra versión se equilibrarán por simulación. No se mezclarán números de distintas versiones del referente.

La documentación de arena describe combates por turnos con daño creciente mediante furia [S4]. Nuestro motor tendrá un multiplicador de intensidad para impedir enfrentamientos interminables. La intensidad se aplicará en un paso explícito y tendrá límites numéricos para evitar desbordamientos.

El registro de un ataque contendrá índice de turno, actor, tipo de ataque, daño antes y después de reducción, crítico, defensa activada, curación y vida restante. Las fichas y la versión se guardarán con el combate. Una repetición antigua no se recalculará usando el equipo actual ni una versión nueva de equilibrio.

Las probabilidades se comprobarán con grandes muestras y tolerancias estadísticas. Para cada clase se probarán enfrentamientos equivalentes, ventajas esperadas y situaciones extremas. La animación será accesible, tendrá modo de movimiento reducido y no bloqueará el cobro si se interrumpe.

Una derrota no reducirá nivel ni destruirá equipo normal. Los costes de entrada y las posibles pérdidas de honor serán específicos de cada modo y se mostrarán antes del ataque. La recompensa se asociará al identificador del combate y no podrá cobrarse dos veces.

<!-- page -->

## 6 Misiones infinitas con generación controlada

Siempre habrá tres ofertas válidas en la taberna del modo clásico. Una misión será una instancia persistente que combina zona, plantilla narrativa, objetivo, familia de enemigo, perfil de recompensa y semilla. No será necesario escribir manualmente cada combinación ni llamar a una IA durante cada partida.

El generador filtrará primero por nivel, facción, desbloqueos, calendario y contenido disponible. Después elegirá plantillas compatibles, aplicará un presupuesto de dificultad y comprobará que las tres ofertas representan decisiones diferentes. Habrá memoria de repeticiones recientes para evitar encargos con el mismo texto una y otra vez.

| Perfil de oferta | Prioridad | Compensación |
| --- | --- | --- |
| Experiencia | Más progreso de nivel por unidad de aventura | Menor rendimiento de oro |
| Oro | Más capacidad de compra y entrenamiento | Menor rendimiento de EXP |
| Exploración | Más oportunidad de botín o colección | Duración o riesgo distinto |

El nivel del enemigo dependerá de la franja del héroe y de una variación acotada. Sus atributos partirán de un presupuesto de referencia por clase y nivel, no de una copia exacta del equipo del jugador. Si cada mejora del héroe fortaleciese inmediatamente a todos los enemigos en la misma proporción, el progreso dejaría de sentirse.

Al aceptar se guardarán coste, hora de fin, ficha del enemigo, recompensa base, bonificaciones, semilla y versión. Cambiar de equipo o subir de nivel durante la espera no reescribirá esos términos. El combate usará la ficha del héroe capturada al iniciar la misión para impedir cambios oportunistas entre dispositivos. Esta decisión será visible en la ayuda.

La selección se renueva al cobrar o abandonar según la regla del modo. Recargar la página no generará ofertas gratis ni permitirá buscar indefinidamente una recompensa excepcional. Abandonar conservará el coste consumido y requerirá una confirmación clara dentro del juego.

Las misiones serán repetibles sin un número máximo de instancias. La variedad narrativa seguirá siendo finita y ampliable. Se diferenciará entre contenido combinable, progresión numérica y contenido escrito por autores; llamar infinito al sistema no implica historias nuevas ilimitadas.

Aceptación de este sistema: no hay ofertas imposibles, no se superan presupuestos de recompensa, el temporizador sobrevive a reinicios, los niveles altos siguen siendo válidos y ningún cobro duplicado altera la economía.

<!-- page -->

## 7 Aventura diaria monturas y trabajo offline

Para conservar el ritmo clásico, se propone una reserva de aventura que se repone una vez al día. La cifra inicial candidata es cien unidades. Sustituye a la regeneración continua del prototipo. La cantidad, las recargas y los costes se definirán en la versión de equilibrio, sin cantidades ocultas en el código de las pantallas.

El mundo guardará un identificador de día calculado a partir de una zona horaria IANA. Se propone Europe/Madrid para el primer mundo. El almacenamiento será UTC y los cambios de horario de verano no permitirán dobles reinicios. Cambiar la hora del teléfono no modificará reservas, esperas ni recompensas.

Las misiones consumirán aventura al iniciarse. Su duración será coste multiplicado por segundos por unidad y por los modificadores de viaje. Las monturas reducirán tiempo de espera; no abaratarán también el coste ni duplicarán recompensas sin que la regla lo indique. Las decisiones sobre su duración y renovación deben verse antes de adquirirlas.

La guardia será una actividad de varias horas que entrega oro al finalizar, con rendimiento escalado por nivel y duración. Compartirá la ranura principal con misiones y expediciones. La arena, las compras y la gestión podrán seguir disponibles durante una misión. Una matriz de exclusiones definirá qué actividades pueden coexistir.

| Actividad | Puede convivir con una misión | Recursos principales |
| --- | --- | --- |
| Arena y reto de mazmorra | Sí | Enfriamiento e intentos propios |
| Entrenamiento y comercio | Sí | Oro y objetos |
| Guardia | No | Tiempo de actividad principal |
| Construcción y producción | Sí | Recursos y colas de gestión |
| Expedición | No | Aventura y actividad principal |

El estado offline se calculará al consultar o ejecutar una acción: tiempo transcurrido, límites y diferencia pendiente. No se crearán tareas de servidor cada segundo para cada usuario. Una producción alcanzada en el límite no seguirá acumulándose de forma ilimitada.

El jugador volverá al mismo estado contractual: una misión terminada espera su cobro, un edificio concluido queda disponible y un almacén lleno permanece en su límite. No se ejecutarán compras ni se consumirá aventura automáticamente mientras el jugador está ausente.

Para una beta se permitirá acelerar el tiempo únicamente en un entorno separado. Las aceleraciones de prueba no deberán existir como parámetros aceptados por la API pública de producción.

<!-- page -->

## 8 Curvas de nivel dificultad y economía

Todas las fórmulas de esta sección son propuestas iniciales de nuestro juego. Se almacenarán con una versión y se validarán antes de convertirlas en equilibrio publicado. Su objetivo es producir decisiones estables y una progresión larga, no demostrar equivalencia numérica con el referente.

Como punto de partida, la experiencia necesaria para pasar del nivel L al siguiente será el redondeo de 80 × L elevado a 1,65. La recompensa base de una misión será Q × 12 × (1 + 0,06 × L) × M, donde Q es su coste de aventura y M un multiplicador acotado del perfil de misión. Con L igual a 10, Q igual a 5 y M igual a 1, la recompensa propuesta es 96 EXP y el siguiente nivel requiere unas 3573 EXP.

La duración inicial candidata será Q × 30 segundos × factor de montura. Ese valor es deliberadamente ajustable: debe probarse con sesiones reales antes de fijar el ritmo. Oro, precio de entrenamiento, renovación de tienda y mejora de objetos se simularán juntos; optimizar cada fórmula por separado puede romper toda la economía.

| Parámetro | Regla de validación | Resultado que se busca |
| --- | --- | --- |
| EXP requerida | Positiva y creciente | Más recorrido entre niveles avanzados |
| Recompensa por aventura | Dentro del presupuesto de su franja | Ninguna oferta domina siempre |
| Entrenamiento | Precio total monótono y comprobable | Decisiones de ahorro útiles |
| Presupuesto de objetos | Crece con nivel y rareza | Mejoras sin saltos descontrolados |
| Bonificaciones | Orden, tope y compatibilidad explícitos | Evitar multiplicaciones explosivas |

Las mazmorras de campaña tendrán dificultad fija por jefe. Un nivel nuevo no reforzará al jefe que ya bloqueaba el camino. Las misiones normales sí seguirán la franja de nivel. Los desafíos sin fin usarán tramos de dificultad y escalado propio, con mecanismos de compresión numérica para evitar desbordamientos.

Se probarán niveles 1, 10, 25, 50, 100, 250, 500 y 1000. El nivel 1000 es un horizonte de simulación, no una promesa de contenido narrativo exclusivo. El sistema no tendrá un límite de diseño bajo; sí tendrá límites técnicos explícitos, almacenamiento seguro y un plan de extensión antes de alcanzarlos.

El informe de simulación medirá tiempo hasta hitos, fuentes y gastos de oro, frecuencia de mejoras, probabilidad de victoria y ventaja entre clases. Si faltan datos de jugadores, los resultados se etiquetarán como simulados. Nunca se presentarán como métricas reales de retención.

<!-- page -->

## 9 Objetos mochila tiendas y servicios

Cada objeto será una instancia con identificador propio, plantilla, nivel, rareza, presupuesto de atributos, daño o armadura, ranura, aspecto, efectos, valor de venta y versión de generación. Poseer dos espadas de la misma plantilla será válido si son instancias distintas. La mochila tendrá capacidad y una política explícita para premios cuando esté llena.

Las ranuras objetivo serán arma, cabeza, torso, manos, pies, cintura, cuello, anillo y accesorio. Un escudo o arma secundaria dependerá de la clase. Equipar validará propiedad, clase, nivel, ranura y conflictos. Quitar o sustituir objetos será una única transacción para evitar duplicaciones.

| Rareza propuesta | Distribución de atributos | Uso |
| --- | --- | --- |
| Común | Presupuesto básico concentrado | Primeras mejoras y venta |
| Inusual | Presupuesto superior o reparto útil | Progresión habitual |
| Rara | Mejor reparto y posible efecto | Decisiones de especialización |
| Épica | Presupuesto alto con identidad propia | Metas de mazmorra y colección |
| Legendaria | Recompensa especial limitada y trazable | Contenido avanzado definido |

El presupuesto se repartirá antes de asignar atributos; añadir un afijo no creará poder gratuito fuera del rango. Los efectos especiales usarán un catálogo limitado, compatible con el motor de combate. Una validación bloqueará combinaciones que creen ciclos infinitos o daño sin límite.

La armería y la tienda mágica tendrán existencias persistentes por personaje y día. No cambiarán al recargar. El precio se calculará en el servidor y se guardará con la oferta. Renovar tendrá un coste visible y un identificador para impedir repetir una renovación cobrada.

Habrá comparación visual con lo equipado, filtros, orden, venta y protección de objetos favoritos. Destruir o reciclar un objeto valioso requerirá confirmación. Si la mochila está llena, los premios irán a una bandeja temporal con caducidad visible y avisos; nunca se perderán silenciosamente.

El herrero ofrecerá refuerzo, reciclaje, engarce y extracción de gemas mediante servicios separados. Encantamientos, pociones y runas tendrán reglas de acumulación y expiración. Cada servicio mostrará coste, resultado y pérdidas antes de ejecutarse. Cambiar la apariencia no alterará los atributos.

Los primeros cuatro objetos se convertirán sin pérdidas mediante una migración identificable. El nuevo sistema no reutilizará el índice del catálogo como identificador de propiedad de un usuario.

<!-- page -->

## 10 Mazmorras campañas torre y final de juego

La progresión PvE combinará campañas escritas y desafíos generados. La campaña ofrecerá capítulos con jefes estables, identidad visual y condiciones de apertura. El manual del referente describe llaves y condiciones de acceso a distintos contenidos [S5]; nuestro catálogo expresará estas condiciones con reglas verificables y mostradas al jugador.

Cada jefe tendrá ficha, clase o arquetipo, habilidades, recompensa de primera victoria, estado de derrota y vínculo con el siguiente objetivo. El servidor comprobará acceso y enfriamiento. Repetir una petición no entregará otra recompensa de primera victoria.

Las llaves se obtendrán mediante objetivos, botín protegido contra mala suerte o servicios concretos. No se podrá quedar bloqueado durante semanas por una condición que ya no puede cumplirse. La ayuda de la mazmorra indicará qué falta y dónde buscarlo.

La torre introducirá compañeros equipables y progresión de grupo asíncrona. Los compañeros tendrán una ficha separada y no duplicarán automáticamente el equipo principal. Sus roles, mejoras y límites se incluirán en el mismo simulador de combate.

| Contenido | Escalado | Recompensa |
| --- | --- | --- |
| Campaña | Fijo por jefe y capítulo | Primera victoria y desbloqueo |
| Torre | Pisos diseñados y presupuesto creciente | Mejoras de compañeros y colección |
| Portal | Jefe persistente con intentos acotados | Progreso acumulado y recompensa de ciclo |
| Desafío sin fin | Generación por tramo | Clasificación y premios limitados por ciclo |
| Mazmorra estacional | Reglas publicadas al abrir | Cosméticos y objetivos de temporada |

Las derrotas enseñarán el registro y las principales diferencias de atributos. No se revelará una certeza de victoria a partir de una única cifra de poder. La estimación, si existe, se expresará como intervalo y se calculará sobre simulaciones de la ficha correspondiente.

El final de juego se sostendrá con perfeccionamiento de equipo, colecciones, desafíos y cooperación. Un bucle de reinicio o prestigio solo se añadirá como subsistema separado y con explicación clara de qué conserva. El personaje principal no perderá niveles por una decisión escondida.

El generador puede ofrecer más niveles y variantes; los encuentros especiales requieren autoría y validación. El catálogo mínimo de campaña para lanzamiento se define en el plan de contenido, no se sustituye por repetir el mismo guardián con una cifra mayor.

<!-- page -->

## 11 Arena PvP clasificaciones y temporadas

La arena profesional enfrentará fichas de jugadores reales del mismo mundo. El atacante elige entre tres propuestas cercanas a su rango, consulta la información pública y acepta el duelo. Las esperas, premios diarios y reglas de honor se configurarán de forma visible. El flujo mantiene el tipo de decisiones descrito para la arena del referente [S4].

El rival se captura al aceptar. No necesita estar conectado y no perderá equipo por recibir un ataque. El combate usa el mismo motor que el PvE, con la versión de reglas activa y modificadores exclusivos de modo claramente separados.

El emparejamiento combinará rango, actividad y franja de progreso. Se ampliará gradualmente cuando haya pocos candidatos. Si no hay usuarios adecuados se ofrecerá un entrenamiento contra NPC identificado como tal; esos combates no concederán honor competitivo ni se harán pasar por PvP.

La variación de honor dependerá de la diferencia de rango y tendrá un máximo por duelo. Los ataques repetidos contra la misma cuenta tendrán rendimiento reducido y límites para evitar acuerdos de farmeo. Las recompensas de EXP estarán limitadas por día; agotarlas no impedirá practicar.

| Clasificación | Orden principal | Protección |
| --- | --- | --- |
| Personajes | Honor y desempates estables | Actividad y sanciones revisables |
| Progreso PvE | Mayor hito y tiempo de logro | Combate y versión registrados |
| Gremios | Puntuación de guerra o raid | Límite de contribución y membresía |
| Temporada | Puntos del ciclo | Cierre con instantánea inmutable |

Las tablas públicas mostrarán datos del personaje, nunca identificadores de autenticación o correo. Se paginarán con índices y no leerán todas las cuentas para mostrar una página. Cada temporada conservará un resultado congelado y un registro de premios.

Un reinicio competitivo afectará a la puntuación estacional, no al nivel, el inventario ni las compras. El calendario, los desempates y la elegibilidad se publicarán antes de empezar. Las recompensas serán principalmente cosméticas y de prestigio para evitar una ventaja acumulativa imposible de recuperar.

Se comprobarán empates, rivales eliminados, cambios de equipo, solicitudes paralelas y ataques desde dos dispositivos. Un duelo aceptado tendrá un solo identificador y una sola aplicación de honor.

<!-- page -->

## 12 Gremios correo y convivencia

Un gremio tendrá nombre, emblema, facción, descripción, requisitos de acceso, miembros, cargos, mejoras, recursos compartidos y registro de actividad. La propuesta inicial agrupa personajes de la misma facción. Las alianzas entre facciones quedarían como una decisión posterior, sin introducir ventajas numéricas asimétricas.

Los cargos serán líder, oficial y miembro. El sistema comprobará cada permiso en el servidor. Solo el líder podrá transferir el liderazgo o disolver; las invitaciones y guerras podrán delegarse. Habrá una política de sucesión por inactividad anunciada desde el inicio.

Las donaciones usarán un libro de movimientos. Una misma operación no descontará dos veces al personaje ni añadirá dos veces al gremio. Las bonificaciones compartidas tendrán topes, requisitos y un tiempo mínimo de pertenencia para evitar entrar y salir únicamente para cobrar premios.

Las guerras tendrán declaración, preparación, cierre de participantes, resolución automática y reparto. La raid cooperativa sumará aportaciones individuales a un objetivo compartido. No exigirá que toda la plantilla esté conectada simultáneamente. Los cambios de miembro durante una guerra seguirán reglas guardadas con el encuentro.

| Función social | Requisito de producto | Requisito operativo |
| --- | --- | --- |
| Chat del gremio | Historial y mensajes legibles | Límites de frecuencia y denuncia |
| Correo | Invitaciones, avisos y combates | Antispam y protección de enlaces |
| Reclutamiento | Requisitos y búsqueda | Bloqueo y revisión de nombres |
| Moderación | Denunciar y bloquear | Cola de revisión y auditoría |
| Sanciones | Motivo y duración visibles | Revisión y posibilidad de recurso |

Los mensajes y nombres se tratarán como texto no confiable: no ejecutarán HTML ni instrucciones. Las denuncias no producirán sanciones definitivas únicamente por volumen. Las medidas automáticas podrán frenar spam o abuso evidente, con revisión para los casos de impacto relevante.

Se definirán retenciones para mensajes, reportes y registros de combate. La eliminación de una cuenta no dejará datos privados en clasificaciones o cachés. Las necesidades de privacidad, recuperación y atención a usuarios deben resolverse antes de abrir una comunidad pública.

Las funciones sociales formarán parte del producto completo, pero llegarán después del motor económico y de combate para no construirlas sobre identificadores o reglas que todavía cambian.

<!-- page -->

## 13 Fortaleza subsuelo y producción automática

La fortaleza añadirá progreso de gestión: construcciones, recursos, capacidad, colas y decisiones de inversión. Se propone desbloquearla a partir del nivel 25, como parámetro propio de diseño. Sus bonificaciones no deben superar al resto de fuentes de progreso ni convertirla en una obligación constante de conexión.

El catálogo inicial incluirá centro de mando, aserradero, cantera, almacén, taller, academia, cuartel, defensas y mina de gemas. Cada construcción expresará costes, duración, requisitos, producción, capacidad y efecto por nivel. Añadir niveles será una extensión de configuración validada, no una modificación manual de cada usuario.

La producción se calculará como el menor valor entre la capacidad y el saldo anterior más la tasa multiplicada por tiempo transcurrido. Se conservará el instante hasta el que se ha liquidado para impedir que una consulta y una recogida simultáneas cuenten dos veces el mismo periodo.

| Operación | Comprobación atómica | Estado resultante |
| --- | --- | --- |
| Construir | Requisitos, coste y cola libre | Reserva de recursos y fecha de fin |
| Recoger | Tiempo no liquidado y capacidad | Saldo y fecha actualizados |
| Investigar | Nivel y materiales | Mejora pendiente o completada |
| Entrenar unidades | Coste y capacidad | Lote asociado a una cola |
| Asaltar | Elegibilidad y protección | Informe y movimiento limitado |

Los asaltos de fortaleza serán un modo distinto de la arena. Tendrán protección inicial, límites de pérdida, objetivos adecuados y un historial verificable. Los recursos protegidos no podrán ser saqueados. Los cambios de defensa se capturarán en una ficha de combate concreta.

El subsuelo será una segunda capa de gestión con recurso propio y enemigos atraídos mediante reglas limitadas. Debe reutilizar colas, producción y combate, sin duplicar una arquitectura completa. El gestor de arena funcionará como un subsistema de crecimiento y prestigio con reinicios propios y ganancias offline limitadas.

El panel mostrará cuándo se llenará cada almacén y qué requisito bloquea la mejora. Las notificaciones serán opcionales. Al volver de varios días de ausencia se explicará la producción recibida y el límite aplicado.

Aceptación: consultar repetidamente no crea recursos; iniciar dos construcciones no gasta saldo inexistente; cambiar el reloj local no acelera colas; una recuperación de copia conserva los puntos de liquidación.

<!-- page -->

## 14 Mascotas colecciones logros y expediciones

Las mascotas combinarán descubrimiento, obtención, alimentación y combates propios. Cada criatura tendrá familia, afinidad, condiciones de captura, aspecto, nivel y recursos compatibles. Sus bonificaciones al héroe tendrán topes y una curva decreciente para evitar que una colección antigua impida competir a usuarios nuevos.

La colección distinguirá conocido, desbloqueado y obtenido. Las condiciones se explicarán sin exigir consultas externas. Un calendario de disponibilidad no deberá crear pérdidas irreversibles por no entrar un día: habrá ventanas de repetición o alternativas de obtención.

La biblioteca registrará enemigos, equipo descubierto, regiones y logros. La colección se basará en identificadores de plantilla, no en conservar miles de objetos físicos. Su progreso tendrá objetivos útiles y no premiará repetidamente el mismo descubrimiento.

| Sistema | Fuente de progreso | Recompensa y límite |
| --- | --- | --- |
| Mascotas | Captura, alimento y combate | Bonos acotados y aspecto |
| Biblioteca | Descubrir plantillas y regiones | Progreso permanente limitado |
| Logros | Hitos comprobados por eventos | Títulos y cosméticos |
| Tareas diarias | Acciones normales de la sesión | Recompensas dentro del presupuesto diario |
| Títulos | Desafíos acumulativos y especiales | Presentación pública |

Las expediciones serán un modo opcional que reutiliza la reserva de aventura. Ofrecerán rutas con encuentros y decisiones ligeras, un objetivo y un resultado final. La referencia oficial describe dos propuestas y decisiones de recorrido [S2]; nuestra implementación fijará su número de etapas en un catálogo propio y conservará el modo clásico.

Una elección de ruta quedará guardada. No podrá retrocederse recargando para cambiar un premio ya conocido. Habrá un plan de recuperación para rutas interrumpidas y un resultado inequívoco al cerrarlas.

Los minijuegos de suerte, si se incorporan, usarán únicamente recursos del juego, probabilidades visibles y límites de gasto. No se introducirán premios de valor monetario. Son secundarios y no deben bloquear el lanzamiento del núcleo ni dominar la economía.

La bruja, el altar de reciclaje y los encantamientos servirán como gastos de objetos sobrantes y recursos. Deberán reutilizar el libro de movimientos y la validación de propiedad. Ningún sistema consumirá un objeto favorito sin explicar la pérdida y pedir confirmación dentro del juego.

<!-- page -->

## 15 Catálogos eventos y continuidad de contenido

La automatización se basará en catálogos de datos revisados. Cada entrada tendrá identificador estable, tipo, versión, estado, requisitos y referencias a recursos. Se validará que todas las referencias existen y que el contenido puede aparecer en alguna condición real.

El calendario asignará eventos por mundo, fecha, prioridad y compatibilidad. Los multiplicadores se resolverán con una regla única. Un evento de doble oro y otro de fin de semana no se combinarán de manera imprevista por estar activos a la vez. Las fechas se guardarán como intervalos con inicio incluido y fin excluido.

| Catálogo mínimo candidato | Cantidad de salida | Control de calidad |
| --- | --- | --- |
| Capitales | Dos completas | Igualdad funcional entre facciones |
| Zonas de aventura | Doce | Variación de familias y presentación |
| Plantillas de misión | Sesenta | Compatibilidad y reducción de repetición |
| Familias enemigas | Cuarenta | Silueta, arquetipo y tabla de atributos |
| Plantillas de objetos | Ciento veinte | Ranura, clase, rareza y presupuesto |
| Mazmorras de campaña | Diez con diez encuentros | Acceso, curva y recompensa de cada jefe |
| Mascotas iniciales | Treinta | Condiciones posibles y recursos válidos |
| Eventos de calendario | Ocho | Presupuesto, fechas y desactivación |

Estas cantidades definen un objetivo de producción, no describen recursos ya creados. La variedad final se aprobará por calidad y decisiones, no solo por el número de combinaciones posibles. Compartir una estructura entre facciones no obliga a duplicar reglas económicas.

El panel de administración permitirá preparar, validar, previsualizar y publicar una versión. La publicación registrará autor, fecha y diferencias. Los premios o combates ya aceptados conservarán su versión. Un cambio de catálogo no reescribirá objetos que ya pertenecen a usuarios sin una migración expresa.

Se podrá añadir contenido por archivos revisados en GitHub o mediante un editor restringido que genere esos mismos datos. Las funciones de generación no aceptarán código arbitrario suministrado por el administrador. Las condiciones serán expresiones limitadas con tipos y operadores conocidos.

La IA puede ayudar a producir borradores de nombres, relatos y arte durante desarrollo. El funcionamiento habitual del juego no dependerá de llamadas generativas por misión: reduce coste, variabilidad y fallos. El contenido generado se revisará, etiquetará y empaquetará antes de publicarlo.

<!-- page -->

## 16 Arte interfaz animación y sonido

La dirección visual será fantasía pintada con siluetas legibles, contraste suficiente y una interfaz pensada para consultar recursos y comparar objetos. La Horda usará materiales cálidos, piedra y metal; la Alianza usará piedra clara, azul y oro. Las diferencias de color no serán la única forma de identificar facción, rareza o resultado.

El mapa de capital será la entrada principal. Los edificios representarán sistemas reales con acceso equivalente desde un menú. Los elementos bloqueados mostrarán condición y utilidad futura. No habrá fachadas que aparenten una función entregada cuando solo existe una ilustración.

Se necesitan pantallas completas de creación, tutorial, capital, taberna, espera, combate, personaje, mochila, tiendas, mazmorras, arena, gremio, gestión, colecciones, correo y ajustes. Cada pantalla tendrá estados de carga, vacío, error, reconexión y permisos insuficientes.

| Recurso | Entrega necesaria | Validación |
| --- | --- | --- |
| Personajes | Retrato y capas compatibles con equipo | Tamaño, transparencia y anclajes |
| Combate | Reposo, ataque, impacto, defensa y derrota | Registro y animación coinciden |
| Enemigos | Retrato y variantes de estado | Siluetas distinguibles en móvil |
| Objetos | Iconos por familia y rareza | Lectura a tamaño de mochila |
| Entornos | Capitales, tabernas y escenarios | Texto legible y recorte adaptable |
| Audio | Ambientes, acciones y avisos | Volumen, licencia y silencio |

El atlas actual de doce ilustraciones es una referencia inicial. No cumple por sí solo este inventario de producción. Cada recurso nuevo se registrará en un manifiesto con tamaño, autoría o procedencia, uso, versión y permisos de distribución.

Se prepararán exportaciones optimizadas y carga por pantalla. No se descargará toda la colección al iniciar. El objetivo de calidad es una navegación fluida y una primera pantalla interactiva rápida en un móvil de gama media; el presupuesto medido se fijará antes de beta.

La interfaz permitirá teclado, foco visible, etiquetas para lectores, texto ampliable y movimiento reducido. Los controles importantes tendrán un área táctil suficiente. El reloj y los mensajes de combate no inundarán los anuncios de accesibilidad.

Los sonidos tendrán controles independientes y estarán desactivados hasta una interacción admitida por el navegador. La música no será una condición para comprender el estado del juego. El idioma de lanzamiento será español, con textos externalizados para permitir traducción.

<!-- page -->

## 17 Arquitectura propuesta y evolución del prototipo

La arquitectura conservará GitHub como historial y Supabase como plataforma de identidad, datos y servicios del juego. El frontend podrá evolucionar a TypeScript y componentes de interfaz sin rehacer la lógica económica. No es necesario migrar todo antes de demostrar el nuevo motor.

La lógica se dividirá en un dominio puro para fórmulas y simulación, servicios de acciones autorizadas, persistencia y presentación. El dominio no dependerá del navegador. El servidor tendrá la autoridad final sobre toda operación con valor o progreso.

| Capa | Responsabilidad | No debe hacer |
| --- | --- | --- |
| Cliente | Interfaz, consultas, comparaciones y repetición | Crear saldo o decidir premios |
| Dominio | Cálculo determinista y validación de reglas | Conocer sesiones o secretos |
| Servicios | Identidad, límites, transacciones y resultados | Confiar en precios del cliente |
| Postgres | Propiedad, estados, movimientos y bloqueos | Exponer tablas privilegiadas |
| Procesos programados | Eventos, agregaciones y limpieza | Depender de un bucle por segundo |
| Recursos estáticos | Arte, sonido y catálogos públicos | Contener secretos de servidor |

Las acciones simples y críticas se ejecutarán en una transacción de base de datos. Un cálculo complejo en un servicio deberá persistir entrada y resultado mediante una operación atómica e idempotente. No se aceptará un diseño que gaste recursos en una petición y conceda el premio en otra sin recuperación.

Los módulos propuestos serán account, character, combat, adventure, items, economy, pvp, guilds, buildings, collections, events y operations. Cada uno tendrá contratos, reglas y pruebas. No habrá una única función gigante que acumule todos los sistemas.

El motor de práctica y el online compartirán la definición de fórmulas o vectores de prueba equivalentes. La práctica seguirá aislada. Cambiar una fórmula exigirá comprobar ambos modos para evitar que el usuario vea una simulación contradictoria.

Desarrollo, pruebas y producción usarán proyectos o entornos separados. Primero se protegerán las partidas existentes. Las migraciones se versionarán y se ensayarán con datos representativos. Los detalles de SDK, herramientas y servicios se comprobarán contra su documentación vigente al implementar, porque pueden cambiar.

El primer alojamiento deberá servir HTTPS y permitir desplegar versiones identificables. Se elegirá tras medir necesidades y coste. Subir el código a GitHub no equivale a tener una versión pública desplegada.

<!-- page -->

## 18 Modelo de datos y contratos de acciones

El modelo objetivo separará cuenta, personaje y mundo. Un personaje pertenece a una cuenta y a un mundo; su facción y progresión se guardan en ese contexto. Los identificadores serán estables y las cantidades usarán tipos capaces de representar el rango previsto sin errores de redondeo.

| Grupo de datos | Entidades principales | Garantía necesaria |
| --- | --- | --- |
| Identidad | worlds, profiles, characters | Propiedad y un personaje por cuenta y mundo |
| Reglas | rule_versions, catalogs, unlocks | Versiones publicadas e inmutables |
| Aventura | offers, activities, rewards | Una actividad principal y un cobro por premio |
| Combate | battles, snapshots, battle_events | Entrada y repetición reproducibles |
| Economía | wallets, ledger, item_instances, equipment | Saldos no negativos y propiedad única |
| Social | guilds, memberships, invitations, messages | Roles y pertenencia coherentes |
| Gestión | buildings, queues, production_states | Recursos liquidados una sola vez |
| Colecciones | pets, discoveries, achievements | Cada desbloqueo se concede una vez |
| Operación | jobs, admin_audit, reports | Trazabilidad y recuperación |

Una petición de acción incluirá tipo, identificador del recurso, parámetros permitidos, clave de idempotencia y, cuando proceda, versión esperada del estado. Identidad, precio, hora, probabilidades y recompensa vendrán del servidor.

La respuesta incluirá identificador de acción, hora del servidor, versión de reglas, cambios aplicados, estado relevante y resultado. Los errores tendrán códigos estables para sesión caducada, saldo insuficiente, acción bloqueada, conflicto de versión, límite de frecuencia y recurso inexistente.

La clave de idempotencia quedará asociada a usuario, mundo, tipo de acción y resumen de parámetros. Si la misma clave llega con parámetros diferentes se rechazará. Si llega igual después de un fallo de red se devolverá el resultado ya guardado, sin repetir el movimiento.

Cada movimiento registrará moneda o recurso, cantidad, origen, destino cuando exista, motivo y acción. No se permitirán modificaciones manuales de saldo sin asiento. Las compensaciones de soporte usarán el mismo sistema y quedarán auditadas.

Se aplicarán restricciones únicas a ofertas activas, premios de primera victoria, pertenencia y equipamiento. El bloqueo de filas seguirá un orden definido para reducir interbloqueos. Las consultas públicas usarán vistas o funciones que solo devuelvan los campos aprobados.

La migración desde realm_heroes conservará nombre, facción, clase, progreso y propiedad. La correspondencia se documentará y se probará antes de retirar el modelo antiguo.

<!-- page -->

## 19 Seguridad fiabilidad y prevención de abusos

La seguridad del juego se basa en que el servidor decide, valida y registra. El navegador es una interfaz modificable por el jugador. Ninguna comprobación importante podrá depender únicamente de un botón desactivado, un precio visible o una variable local.

Las tablas expuestas tendrán RLS y permisos mínimos. Las políticas comprobarán propiedad real y mundo. Las funciones privilegiadas se mantendrán fuera del esquema público, con permisos limitados, comprobación de identidad y rutas de resolución explícitas. Solo se incluirá una clave publicable en el frontend.

| Amenaza | Protección prevista | Prueba obligatoria |
| --- | --- | --- |
| Cobro duplicado | Transacción y clave de premio única | Solicitudes paralelas y reintento |
| Alteración de reloj | Tiempo del servidor | Reloj local adelantado y atrasado |
| Lectura de otra cuenta | RLS y consultas mínimas | Dos identidades y acceso anónimo |
| Compra falsa | Precio y propiedad validados | Parámetros manipulados |
| Automatización abusiva | Límites de frecuencia y análisis | Ráfagas y uso legítimo intenso |
| Robo de sesión | Manejo seguro y cierre de sesiones | Expiración, renovación y revocación |
| Inyección en chat | Escape y validación de texto | HTML, enlaces y textos maliciosos |

El control de bots combinará frecuencia, repetición y contexto. No se sancionará permanentemente por una sola señal. Las medidas deberán reducir abuso sin bloquear accesibilidad, redes compartidas o una conexión inestable.

El azar de recompensas se generará en el servidor y se guardará de forma que no pueda repetirse selectivamente. Las semillas públicas de una repetición no permitirán predecir premios futuros. Las tablas de probabilidades estarán versionadas.

Las tareas de fondo usarán arrendamiento, reintentos limitados y registro de errores. Una tarea agotada irá a revisión; no permanecerá repitiéndose indefinidamente. Los cambios administrativos tendrán identidad, motivo y valores anteriores y posteriores cuando corresponda.

Los registros técnicos no incluirán contraseñas, tokens ni mensajes privados completos por defecto. Se definirán caducidad y acceso. La recuperación de cuentas, las denuncias y las solicitudes sobre datos personales tendrán un procedimiento antes del lanzamiento público.

Se probarán desconexiones durante gasto y cobro, dos pestañas, dos dispositivos, mensajes fuera de orden y despliegues durante una actividad. La experiencia debe permitir reintentar sin perder ni duplicar valor.

<!-- page -->

## 20 Operación automática y mantenimiento reducido

El objetivo es que el día a día del juego no requiera crear misiones, restablecer reservas o repartir premios a mano. Las reglas y tareas programadas deben cubrir esas operaciones. La supervisión humana se centrará en incidencias, equilibrio, moderación y nuevas versiones.

| Automatización | Disparador | Recuperación prevista |
| --- | --- | --- |
| Reserva diaria | Cambio del día del mundo | Cálculo diferido idempotente |
| Oferta y producción | Consulta o acción del usuario | Recalcular desde el último estado válido |
| Eventos | Calendario publicado | Reconciliar estado al arrancar |
| Clasificación | Lote periódico y cierre de ciclo | Rehacer agregado desde registros |
| Premios estacionales | Cierre con instantánea | Libro de concesiones y reintento |
| Copias | Política del entorno elegido | Restauración ensayada |
| Limpieza | Retención por tipo de dato | Lotes con límites y auditoría |
| Avisos operativos | Umbrales de error o coste | Incidencia con contexto útil |

Se medirán errores de acciones, latencia, sesiones fallidas, atascos de colas, crecimiento de tablas, divergencias de saldo y consumo de recursos. Una alerta necesita responsable, umbral y acción concreta. No se enviarán avisos repetidos sin cambio de estado.

El panel de operación permitirá ver el estado de un personaje, consultar acciones, corregir mediante compensación, suspender una función, revisar denuncias y publicar contenido. Los permisos de administración estarán separados de los de jugador y se comprobarán también en el servidor.

Antes de beta se fijarán objetivos de disponibilidad y latencia a partir de pruebas. Como hipótesis inicial, se buscará que el 95 por ciento de las acciones normales responda en menos de un segundo en el entorno de prueba y que no haya pérdidas o duplicaciones bajo reintento. No es una medición del prototipo.

La política inicial candidata buscará un objetivo de pérdida de datos no superior a 24 horas y recuperación en cuatro horas. Se ajustará al plan y capacidad disponibles y solo se considerará cumplida después de restaurar una copia en un entorno independiente. Si se necesita menor pérdida, habrá que elegir y probar una solución que la soporte.

El coste mensual dependerá de usuarios activos, acciones, base de datos, almacenamiento, correo y transferencia. Se establecerán presupuesto y alertas antes de abrir el servicio. Las integraciones de pago o planes de coste se decidirán por separado; este documento no autoriza contrataciones.

<!-- page -->

## 21 Pruebas equilibrio y aceptación del lanzamiento

La calidad se comprobará en varios niveles. Las pruebas unitarias cubren fórmulas y restricciones; las integrales cubren transacciones y permisos; las de interfaz cubren flujos completos; las simulaciones cubren progreso y enfrentamientos; las operativas cubren despliegue y recuperación.

| Área | Casos mínimos | Condición de aceptación |
| --- | --- | --- |
| Combate | Clases, críticos, defensas y límite de turnos | Repetición determinista y sin estados imposibles |
| Misiones | Inicio, espera, derrota, cobro y abandono | Un coste y una recompensa por instancia |
| Economía | Compra, venta, equipar, reciclaje y bandeja | Conservación de saldos y propiedad |
| Concurrencia | Dos pestañas y peticiones simultáneas | Sin premios ni gastos duplicados |
| Acceso | Anónimo, propietario, tercero y administrador | Solo operaciones autorizadas |
| Tiempo | Medianoche, cambio horario y ausencia larga | Reinicio y producción correctos |
| Social | Invitación, salida, cargos y guerra | Membresías y premios coherentes |
| Migración | Datos antiguos y ejecución repetida | Progreso conservado y cambio idempotente |
| Interfaz | Móvil, teclado, error y reconexión | Acciones realizables y mensajes comprensibles |

Se crearán vectores de combate conocidos, pruebas de propiedades y simulaciones por semilla. La comparación entre clases usará poblaciones con presupuesto equivalente. La probabilidad observada de críticos o esquivas se evaluará con tolerancias estadísticas, no mediante una muestra pequeña.

La carga se definirá con un objetivo de concurrencia antes de beta. Se probará la demanda normal, picos y el cierre de una temporada. No se afirmará que el juego soporta miles de usuarios porque una consulta aislada haya sido rápida.

Una entrega estará terminada cuando tenga comportamiento real, manejo de errores, persistencia, pruebas adecuadas, accesibilidad básica, documentación actualizada y despliegue verificado en pruebas. Los elementos puramente visuales no cerrarán tareas de sistemas.

El lanzamiento requerirá catálogo mínimo, cero incidencias críticas abiertas, recuperación ensayada, política de soporte, costes controlados y una prueba de partidas prolongadas sin bloqueos de progresión. Las incidencias menores aceptadas tendrán una razón y un plan registrado.

Los indicadores de jugadores se introducirán con minimización de datos. Se medirán finalización del tutorial, vuelta al juego, abandono de pantallas, ritmo de nivel y utilidad de gastos. Las metas de retención se establecerán al disponer de una muestra; no se inventarán resultados ni porcentajes de éxito.

<!-- page -->

## 22 Fases de construcción y dependencias

El desarrollo avanzará por entregas jugables. No se fijan fechas artificiales: cada fase termina al cumplir su salida. El estado y las estimaciones se actualizarán con trabajo medido. Los identificadores de esta tabla se detallan en docs/BACKLOG.md.

| Fase | Trabajo principal | Dependencia | Salida verificable |
| --- | --- | --- | --- |
| F0 Base segura | Entornos, exportación, reglas y pruebas | Prototipo actual | Migración ensayada y datos protegidos |
| F1 Núcleo clásico | Atributos, combate, aventura y ofertas | F0 | Bucle clásico completo y persistente |
| F2 Economía y PvE | Equipo, tiendas, campañas y monturas | F1 | Progreso de varias franjas equilibrado |
| F3 Competición social | PvP, gremios, correo y moderación | F1 y F2 | Comunidad real con permisos probados |
| F4 Progreso paralelo | Fortaleza, mascotas y colecciones | F2 | Gestión offline y objetivos largos |
| F5 Contenido avanzado | Torre, subsuelo, expediciones y ciclos | F3 y F4 | Recorrido completo y final de juego |
| F6 Lanzamiento | Arte final, carga, soporte y recuperación | Todas | Beta validada y producción recuperable |

La siguiente entrega prioritaria será F0 seguida de un corte vertical de F1. Ese corte permitirá crear un héroe con cinco atributos, aceptar una misión generada según nivel, esperar, resolver un combate por turnos en servidor, recibir un objeto y equiparlo. Es la primera prueba de que el diseño funciona como un juego y no como menús independientes.

Las capas de arte final y contenido se ampliarán sobre ese corte. Crear cientos de ilustraciones antes de fijar ranuras, estados de animación y proporciones puede causar retrabajo. Los recursos actuales servirán como referencia durante la transición.

Los sistemas sociales dependen de identificadores, combate y economía estables. Los de gestión dependen de la infraestructura de tiempo y movimientos. Las temporadas dependen de la clasificación y la concesión idempotente de premios.

Se mantendrá un máximo de una fase principal en curso. Los problemas que bloqueen una entrega se resolverán o registrarán con una alternativa concreta. No se abrirán múltiples sistemas a medias para aparentar cobertura.

Cada fase producirá versión de código, migraciones, pruebas, cambios de catálogo, actualización de este documento y un resumen de lo que se puede jugar realmente. Si un objetivo cambia, se revisará el alcance y su impacto antes de considerarlo completado.

<!-- page -->

## 23 Decisiones abiertas riesgos y criterios de cambio

Las decisiones siguientes tienen una opción inicial para poder avanzar. Se confirmarán al acercarse a su implementación y no deben bloquear el trabajo independiente. Cambiar una decisión que afecte a datos o economía exige describir conversión, pruebas y compatibilidad.

| Decisión | Opción inicial propuesta | Momento de revisión |
| --- | --- | --- |
| Modo principal | Misiones clásicas de tres ofertas | Antes de cerrar F1 |
| Aventura | Reserva diaria configurable | Con simulación del ritmo clásico |
| Mundo inicial | Un mundo con horario Europe/Madrid | Antes de beta |
| Clases de salida | Guerrero, Mago y Explorador | Tras equilibrar el motor |
| Personajes | Uno por cuenta y mundo | Antes de migración definitiva |
| Monetización | Sin cobros en el prototipo ni beta inicial | Tras validar juego y costes |
| Facciones | Igualdad funcional y gremios separados | Antes de funciones sociales |
| Identidad pública | Marca y recursos propios o autorizados | Antes de publicación comercial |
| Hosting y presupuesto | Alojamiento HTTPS por seleccionar | Antes de desplegar beta |

El mayor riesgo de diseño es un escalado que haga inútiles las mejoras: se evita separando enemigos por franja y jefes fijos. El mayor riesgo técnico es duplicar valor por concurrencia: se evita con transacciones, restricciones y reintentos idempotentes. El mayor riesgo de producción es multiplicar sistemas antes de validar el núcleo: se evita con las salidas de fase.

Una economía con bonificaciones multiplicativas sin límite puede obligar a reinicios o correcciones dolorosas. Cada fuente de bonificación tendrá presupuesto, orden y tope. Un catálogo procedimental sin revisión puede ofrecer muchas combinaciones y pocas decisiones; los informes medirán repetición y dominancia de ofertas.

El proyecto no debe depender de la permanencia de una conversación ni de que una persona recuerde valores ocultos. Diseño, estado, decisiones y procedimientos estarán en el repositorio. Un nuevo asistente debe poder reconstruir el contexto leyendo los archivos indicados en AGENTS.md.

Las intervenciones humanas que no pueden eliminarse incluyen revisión de abusos, recuperación de cuentas, aprobación de contenido, cambios de equilibrio e incidencias de proveedores. La automatización puede reducirlas y proporcionar herramientas; no elimina la responsabilidad de operar un servicio online.

Una desviación del referente deberá explicar qué comportamiento cambia, por qué y cómo se comprobará que mantiene el tipo de experiencia solicitado. No se añadirán sistemas de acción, autojugado total o gastos reales por iniciativa accidental durante la implementación.

<!-- page -->

## 24 Continuidad del trabajo y fuentes

El repositorio contendrá el diseño, su edición Word, una lista de trabajo y un registro de progreso. Cada sesión empezará por AGENTS.md, docs/MASTER_PLAN.md, docs/PROGRESS.md y docs/BACKLOG.md. Después se comprobarán los archivos afectados y el estado de Git. La documentación orienta; el código y las pruebas determinan qué está entregado.

El registro de progreso identificará el último trabajo terminado, la evidencia de pruebas, el estado del despliegue, los bloqueos y la siguiente tarea. Las decisiones con impacto se registrarán con fecha y motivo. Un asistente no marcará una fase como completada por haber redactado su diseño.

El Word se regenerará mediante scripts/build_design_doc.py. Su fuente es este documento. La publicación de una revisión requiere comprobar su estructura y representación visual, actualizar la versión y subir ambos archivos en el mismo cambio. Los archivos temporales de revisión no se guardarán en GitHub.

La matriz de fidelidad se mantendrá en docs/FIDELITY.md. Permitirá distinguir el flujo clásico que debemos preservar de propuestas propias o características pendientes de verificar. Las fuentes se volverán a comprobar cuando se implemente el sistema relacionado.

### Fuentes oficiales consultadas

[S1] Playa Games. Quests. Consulta del 16 de noviembre de 2026. Base para la elección entre tres misiones, recompensas y temporizador. https://playa-games.helpshift.com/hc/en/4-shakes-fidget-1653988985/faq/287-quests/

[S2] Playa Games. Expeditions. Consulta del 16 de noviembre de 2026. Base para distinguir las expediciones del modo clásico. https://playa-games.helpshift.com/hc/en/4-shakes-fidget-1653988985/faq/237-expeditions/

[S3] Playa Games. Classes. Consulta del 16 de noviembre de 2026. Base para identidades de combate y cinco atributos. No se adoptan aquí sus coeficientes como equilibrio propio. https://playa-games.helpshift.com/hc/en/4-shakes-fidget-1653988985/faq/109-classes/

[S4] Playa Games. Arena. Consulta del 16 de noviembre de 2026. Base para elección de rivales, turnos automáticos, furia y repetición de combates. https://playa-games.helpshift.com/hc/en/4-shakes-fidget-1653988985/faq/29-arena/

[S5] Playa Games. Dungeons. Consulta del 16 de noviembre de 2026. Base para acceso por llaves, progresión y premios PvE. https://playa-games.helpshift.com/hc/en/4-shakes-fidget-1653988985/faq/51-dungeons/

[S6] Playa Games. Game Manual. Consulta del 16 de noviembre de 2026. Índice de sistemas para revisar la cobertura funcional. https://playa-games.helpshift.com/hc/en/4-shakes-fidget-1653988985/section/13-game-manual/

Las fuentes describen el referente. Las cantidades de contenido, arquitectura, fórmulas, fases, metas de calidad y decisiones económicas de este plan son propuestas del proyecto. El inventario del estado inicial procede de los archivos y pruebas del repositorio en la referencia indicada en la sección 2.

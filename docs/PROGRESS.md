# Estado de desarrollo

Actualizado: 16 de noviembre de 2026.

## Entregado

- Prototipo v0.1 en commit `5f07f7f`: dos facciones, tres clases, tres misiones fijas, comparación de poder, cuatro objetos, guardado local y acciones validadas en Supabase.
- Pruebas del prototipo: cinco casos de motor, sintaxis y CI correctos. Pruebas SQL revertidas de propiedad, compra, equipo, cobro, reloj y RLS.
- Plan maestro v1.0, matriz de fidelidad, tareas y protocolo de continuidad. El Word se genera desde la fuente Markdown.
- Núcleo clásico v0.2 desarrollado en `1108c69` y completado con pruebas de migración y restricciones de acceso. Cinco atributos, combate por turnos, repetición, ofertas por nivel, aventura diaria y API idempotente. Backend actualizado en Supabase.
- Veinte pruebas JS correctas. Doce fichas y ofertas, treinta y seis combates y veintiocho acciones coinciden entre JS y SQL. Pruebas de conversión de partida antigua, permisos y reconciliación económica correctas dentro de transacciones revertidas.
- CI aislado en PostgreSQL 17 correcto en la ejecución `43838688348`, incluida la prueba de doce solicitudes simultáneas con un solo gasto y una sola mejora.
- Versión v0.2.0 integrada en main y etiquetada en `6d50c62`; segunda verificación completa correcta en `43841048303`.
- Guía contextual v0.2.1 implementada con progreso persistente y una capa separada que no altera las reglas económicas classic-1. Veintitrés pruebas JS correctas y pruebas SQL específicas de avance, reintentos y conservación de saldo.
- Guía desarrollada en `87d8e67`, CI completo correcto en `43842801170` y backend de guía actualizado en Supabase. Pruebas SQL revertidas correctas; la revisión de seguridad no devuelve avisos. No se han dejado cuentas sintéticas en el proyecto.
- F0 y F1 cerradas como fases de núcleo: no equivalen al lanzamiento del producto completo. F2 a F6 siguen pendientes.
- Automatización de GitHub actualizada a acciones oficiales v7 fijadas por commit y Ubuntu 24.04, con límite de ejecución y cancelación de comprobaciones sustituidas. Evita depender de la transición automática de ubuntu-latest y del runtime antiguo de las acciones v4.
- Equipo v0.3 desarrollado en `f68c9e0`; CI completo correcto en `43856398163`. Treinta y siete pruebas JS, comparación JS SQL del motor de equipo y compras paralelas correctas. Backend gear-1 instalado en Supabase, pruebas revertidas correctas y revisión de seguridad sin avisos.
- Verificación online de permisos: la API anónima, las tablas de auditoría y copias, y los motores anteriores no permiten ejecución o lectura directa del jugador. Las cuentas sintéticas de prueba se revierten y el proyecto sigue sin cuentas reales.

## En curso

Entrega v0.3.0 integrada en main y etiquetada en `23b90e4`: instancias de equipo, nivel, cuatro rarezas, diez ranuras según clase, tienda diaria de seis ofertas, mochila de veinte piezas y bandeja de cincuenta. Compra, equipamiento, venta protegida, favoritos, filtros y comparación implementados. CI correcto y backend publicado. Las tareas F2 01 a F2 03 están completadas; F2 04 continúa en curso.

Verificación local: 37 pruebas correctas, incluidos presupuestos de atributos, conversión sin pérdida de estadísticas, escudo equipado, compra repetida, propiedad, favoritos y botín en bandeja. Verificación SQL revertida: 144 objetos, tres conversiones, tres fichas, tres tiendas y 51 acciones coinciden con JS; las pruebas de API y propiedad entre cuentas también pasan.

La revisión visual de v0.3 está pendiente. El navegador de pruebas no puede iniciar su entorno después de la actualización de herramientas. Se validaron plantillas HTML, escapado de nombres y comparación de atributos con pruebas; no se presenta eso como una revisión visual.

Revisión en navegador: práctica anterior conservada, cinco atributos visibles, combate de arena, misión aceptada y conservada tras recargar, cobro al finalizar, victoria y nivel 2, nuevas ofertas escaladas y persistencia de la recompensa.

El Word y la planificación ya están subidos en el commit `0352c26`. Su revisión visual sigue pendiente y no se considera verificada su maquetación.

## Siguiente entrega

Completar F2 04 con reciclaje y política definitiva de bandeja, y continuar F2 05 con campañas y llaves. Repetir la revisión visual de v0.3 cuando se recupere el navegador. No iniciar gremios o fortaleza antes de estabilizar esta economía.

## Límites

- Prototipo público en https://jfernandezgutierrez.github.io/azeroth-idle/. No equivale a una beta profesional validada.
- El registro real de una cuenta por correo no se ha comprobado de principio a fin; las funciones online sí se probaron en transacciones revertidas.
- No se ha validado carga, restauración de copias ni ritmo de progreso largo.
- La arena sigue siendo entrenamiento contra NPC. La primera tienda nueva combina equipo físico y mágico; no incluye todavía consumibles, gemas o servicios de herrero.
- Los sistemas descritos como objetivo en el plan no están implementados salvo indicación expresa.

## Protocolo de cierre de cada entrega

Registrar commit o versión, funciones jugables, pruebas, cambios de datos, estado de despliegue, límites y siguiente tarea. Si el trabajo se interrumpe, dejar aquí el estado exacto para continuar sin depender del chat.

## Publicación GitHub Pages · 16 de noviembre de 2026

Petición de publicar la web priorizada sobre la siguiente entrega de inventario. Javier autoriza expresamente abrir el repositorio después de que GitHub rechazara Pages con el plan privado actual. Repositorio público y Pages activado, HTTPS obligatorio.

Preparado empaquetado de 24 archivos del juego, con rutas relativas compatibles con /azeroth-idle/. Excluye documentos, SQL, herramientas, pruebas y archivos de entorno del alojamiento estático. El repositorio público sí contiene documentación e historial, conforme a la autorización.

38 pruebas locales correctas, sintaxis, catálogos y SQL generado comprobados. Se revisaron diez commits con patrones de credenciales privadas sin coincidencias; esta revisión no es una garantía exhaustiva. Publicación automática tras el éxito del flujo Comprobar juego en main, fijada al commit comprobado. Primera publicación correcta del commit 15af3f0: pruebas completas en GitHub 43858935351 y despliegue 43859005429. Portada HTTP 200 y los 24 archivos públicos coinciden byte a byte con el commit de GitHub, incluidas las tres imágenes. La comparación utiliza el contenido del commit para evitar diferencias de finales de línea de Windows.

No se han implementado reciclaje, campañas ni mejoras de inventario en esta entrega. Se mantienen las siguientes tareas de F2 y los límites de revisión visual y registro real por correo.


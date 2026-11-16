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

## En curso

Preparada la siguiente fase de equipo y economía. La entrega de núcleo y guía está en la rama principal con las etiquetas v0.2.0 y v0.2.1. No se ha iniciado todavía la implementación de F2.

Revisión en navegador: práctica anterior conservada, cinco atributos visibles, combate de arena, misión aceptada y conservada tras recargar, cobro al finalizar, victoria y nivel 2, nuevas ofertas escaladas y persistencia de la recompensa.

El Word y la planificación ya están subidos en el commit `0352c26`. Su revisión visual sigue pendiente y no se considera verificada su maquetación.

## Siguiente entrega

F2 01 a F2 03: objetos como instancias con nivel, rareza y presupuesto, mochila y tiendas persistentes escalables. No iniciar gremios o fortaleza antes de estabilizar esta economía.

## Límites

- No hay versión pública alojada.
- El registro real de una cuenta por correo no se ha comprobado de principio a fin; las funciones online sí se probaron en transacciones revertidas.
- No se ha validado carga, restauración de copias ni ritmo de progreso largo.
- El inventario actual aún tiene cuatro objetos de prototipo. La arena sigue siendo entrenamiento contra NPC.
- Los sistemas descritos como objetivo en el plan no están implementados salvo indicación expresa.

## Protocolo de cierre de cada entrega

Registrar commit o versión, funciones jugables, pruebas, cambios de datos, estado de despliegue, límites y siguiente tarea. Si el trabajo se interrumpe, dejar aquí el estado exacto para continuar sin depender del chat.

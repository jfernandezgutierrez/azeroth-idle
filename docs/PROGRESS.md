# Estado de desarrollo

Actualizado: 16 de noviembre de 2026.

## Entregado

- Prototipo v0.1 en commit `5f07f7f`: dos facciones, tres clases, tres misiones fijas, comparación de poder, cuatro objetos, guardado local y acciones validadas en Supabase.
- Pruebas del prototipo: cinco casos de motor, sintaxis y CI correctos. Pruebas SQL revertidas de propiedad, compra, equipo, cobro, reloj y RLS.
- Plan maestro v1.0, matriz de fidelidad, tareas y protocolo de continuidad. El Word se genera desde la fuente Markdown.

## En curso

Entrega v0.2 del núcleo clásico. Implementados cinco atributos, combate por turnos, repetición, ofertas escaladas persistentes, aventura diaria, conversión de partidas y comandos idempotentes. Veinte pruebas JS correctas. Paridad comprobada en Supabase dentro de transacciones revertidas con doce fichas y ofertas, treinta y seis combates y veintiocho acciones. Pendiente completar CI aislado y publicar el nuevo backend.

Revisión en navegador: práctica anterior conservada, cinco atributos visibles, combate de arena, misión aceptada y conservada tras recargar, cobro al finalizar, victoria y nivel 2, nuevas ofertas escaladas y persistencia de la recompensa.

El Word y la planificación ya están subidos en el commit `0352c26`. Su revisión visual sigue pendiente y no se considera verificada su maquetación.

## Siguiente entrega

Completar la publicación y verificación de v0.2. Después F2 01 a F2 03: objetos como instancias con nivel, rareza y presupuesto, mochila y tiendas persistentes escalables. No iniciar gremios o fortaleza antes de estabilizar esta economía.

## Límites

- No hay versión pública alojada.
- El registro real de una cuenta por correo no se ha comprobado de principio a fin; las funciones online sí se probaron en transacciones revertidas.
- No se ha validado carga, restauración de copias ni ritmo de progreso largo.
- El inventario actual aún tiene cuatro objetos de prototipo. La arena sigue siendo entrenamiento contra NPC.
- Los sistemas descritos como objetivo en el plan no están implementados salvo indicación expresa.

## Protocolo de cierre de cada entrega

Registrar commit o versión, funciones jugables, pruebas, cambios de datos, estado de despliegue, límites y siguiente tarea. Si el trabajo se interrumpe, dejar aquí el estado exacto para continuar sin depender del chat.

# Actualización del núcleo clásico

## Orden de instalación

En una instalación vacía, aplicar por orden `supabase/schema.sql`, `supabase/classic_v1.sql` y `supabase/onboarding_v1.sql`. En el proyecto existente, aplicar las actualizaciones necesarias después de comprobar el estado y ejecutar las pruebas dentro de una transacción revertida. El núcleo clásico se compila con `npm run build:sql` y no se edita manualmente.

La guía se aplica siempre después del núcleo clásico. Su función pública delega en una capa de tutorial que conserva las reglas económicas congeladas. No renombra ni modifica el motor `classic-1`. La capa de guía puede repetirse y no crea recompensas ni modifica saldos.

Con usuarios activos, preparar una sola transacción que contenga los scripts necesarios, suprimiendo sus BEGIN y COMMIT internos, y confirmar únicamente al finalizar todos. Esto evita un intervalo entre la revocación de permisos del núcleo y la instalación de la capa pública correspondiente. Ensayar primero el mismo lote con ROLLBACK.

La actualización no elimina realm_heroes ni sobrescribe sus filas. Guarda una copia privada de las partidas iniciales y crea tablas privadas de estado, comandos y movimientos. La conversión se realiza al primer acceso. La API antigua deja de aceptar mutaciones para impedir dos economías independientes.

El 16 de noviembre de 2026 se comprobó que el proyecto tenía cero cuentas, cero personajes y cero misiones activas antes de la actualización. Las pruebas posteriores utilizan datos sintéticos dentro de transacciones revertidas; nunca se exportan datos reales al repositorio.

## Pruebas aisladas

GitHub Actions crea un PostgreSQL 17 temporal. `tests/bootstrap.sql` simula únicamente las identidades necesarias para probar permisos. Ese archivo no se aplica al proyecto real de Supabase. `scripts/test-concurrency.mjs` exige una variable específica y se niega a continuar si detecta el esquema completo de usuarios de Supabase.

Las pruebas generan escenarios a partir del motor JS y comprueban igualdad completa con la implementación SQL. También prueban permisos, cobros anticipados, duplicados, claves reutilizadas con otros argumentos y reconciliación económica. La prueba paralela envía doce solicitudes con la misma clave y exige una sola mejora y un solo gasto.

## Recuperación y límites

La primera versión permanece accesible en Git, y sus tablas originales se conservan. Volver al cliente anterior después de que haya partidas v2 requiere una conversión inversa diseñada y probada; no se debe restaurar ciegamente la función antigua ni perder el progreso nuevo. La recuperación operativa completa y la restauración de copias son tareas pendientes de F6.

No exponer realm_private mediante PostgREST. No conceder acceso directo de jugador a las tablas ni a los helpers de cálculo. No publicar claves secretas ni de servicio en config.js.

# Continuidad del proyecto

Antes de implementar, leer en este orden:

1. `docs/PROGRESS.md` para conocer el estado y la siguiente tarea.
2. `docs/MASTER_PLAN.md` para conocer el diseño aprobado como dirección de trabajo.
3. `docs/BACKLOG.md` para elegir tareas desbloqueadas y sus criterios.
4. `docs/FIDELITY.md` para mantener la jugabilidad clásica de referencia.

El usuario ha pedido continuar el desarrollo después de entregar el documento. Avanzar por fases con entregas jugables; no confundir alcance diseñado con alcance entregado. Comprobar el estado real de los archivos y las pruebas antes de afirmar que una función existe.

## Reglas del producto

- Preservar el bucle clásico: tres encargos, coste de aventura, espera persistente, combate automático y mejoras del héroe. No convertirlo en acción en tiempo real ni autojuego total.
- Horda en Orgrimmar y Alianza en Ventormenta en el prototipo; igualdad funcional entre facciones.
- Supabase es la autoridad online. El cliente no decide monedas, premios, relojes ni victorias.
- Toda acción con valor necesita validación de propiedad, transacción, protección de concurrencia e idempotencia.
- La generación se basa en catálogos y reglas versionados; no depende de IA en tiempo de ejecución.
- Los coeficientes del plan son candidatos propios. No anunciarlos como fórmulas oficiales de Shakes & Fidget.
- No contratar servicios ni introducir pagos reales sin una petición específica del usuario.

## Documentación viva

`docs/MASTER_PLAN.md` es la fuente del Word `docs/Plan_maestro_Azeroth_Idle.docx`. Si el usuario ha editado el Word, incorporar sus cambios a la fuente antes de regenerarlo. No sobrescribir revisiones del usuario.

Actualizar `docs/PROGRESS.md` y el estado de `docs/BACKLOG.md` al terminar una entrega. Registrar decisiones de diseño y diferencias importantes en `docs/DECISIONS.md`. Cuando cambie el diseño maestro, regenerar el Word y verificar visualmente su resultado con las herramientas disponibles.

Cada tarea completa debe incluir evidencia de pruebas adecuadas, límites conocidos y siguiente paso. No marcar completa una fase por añadir botones o redactar documentos.

## Referencias del entorno

- Repositorio: https://github.com/jfernandezgutierrez/azeroth-idle
- Supabase actual: `zhubckfwdfnuhxwvbgvv`; inspeccionar estado antes de modificar.
- Configuración pública: `config.js`; nunca guardar claves secretas en Git.
- El prototipo original está en el commit `5f07f7f136bee732a293897e41f04c55075cf80d`.
- `npm test` y `npm run check` son las comprobaciones iniciales. Ampliar pruebas al añadir reglas.
- Usar los runtimes resueltos por el entorno cuando los comandos globales no funcionen. Para generar Word, localizar primero las dependencias de documentos.

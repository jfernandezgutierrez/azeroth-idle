# Lista de trabajo del juego completo

Estados: pendiente, en curso, completada. La documentación no cierra tareas de implementación. No hay fechas comprometidas. Cada salida requiere pruebas y actualización de PROGRESS.md.

| ID | Estado | Entrega | Depende de | Aceptación |
| --- | --- | --- | --- | --- |
| F0 01 | Pendiente | Inventario y protección de datos | Prototipo | Esquema y cuentas inspeccionados; exportación o respaldo verificable |
| F0 02 | Pendiente | Entorno de pruebas separado | F0 01 | Configuración aislada y sin secretos en cliente |
| F0 03 | Pendiente | Versiones de reglas y contratos | F0 01 | Configuración validada y resultado versionado |
| F0 04 | Pendiente | Migración compatible | F0 03 | Partidas antiguas conservan valor y propiedad |
| F1 01 | Pendiente | Cinco atributos y clases | F0 03 | Desglose correcto y efecto de cada atributo |
| F1 02 | Pendiente | Combate por turnos | F1 01 | Determinista; vida, críticos, defensas y final válidos |
| F1 03 | Pendiente | Repetición del combate | F1 02 | Registro corresponde al resultado y puede saltarse |
| F1 04 | Pendiente | Ofertas generadas por nivel | F0 03 | Tres ofertas distintas y sin cambio por recarga |
| F1 05 | Pendiente | Aventura diaria y tiempo | F1 04 | Reinicio único con zona horaria y reloj del servidor |
| F1 06 | Pendiente | Inicio y cobro transaccionales | F1 02 y F1 05 | Snapshot, espera y premio único bajo concurrencia |
| F1 07 | Pendiente | Tutorial del bucle clásico | F1 06 | Crear, misión, combate, mejora sin ayuda externa |
| F2 01 | Pendiente | Objetos como instancias | F0 04 | Propiedad, ranuras y mochila probadas |
| F2 02 | Pendiente | Rarezas y presupuestos | F2 01 | Generación dentro de límites por nivel |
| F2 03 | Pendiente | Tiendas persistentes | F2 02 | Precios y renovación validados por servidor |
| F2 04 | Pendiente | Venta reciclaje y bandeja | F2 01 | Sin pérdida silenciosa ni duplicación |
| F2 05 | Pendiente | Campañas y llaves | F1 06 | Acceso y primera recompensa únicos |
| F2 06 | Pendiente | Monturas y guardia | F1 05 | Exclusiones y duración correctas |
| F2 07 | Pendiente | Herrero gemas y pociones | F2 04 | Consumo, efectos y expiración probados |
| F2 08 | Pendiente | Simulador económico | F2 03 y F2 05 | Informe reproducible por franjas y clases |
| F3 01 | Pendiente | Fichas públicas y mundos | F0 04 | Datos públicos mínimos y aislamiento |
| F3 02 | Pendiente | Arena PvP real | F3 01 y F1 02 | Rival real, enfriamiento y honor único |
| F3 03 | Pendiente | Clasificaciones paginadas | F3 02 | Índices, desempate y estabilidad |
| F3 04 | Pendiente | Gremios y permisos | F3 01 | Invitación, cargos, salida y sucesión |
| F3 05 | Pendiente | Donaciones y mejoras | F3 04 | Libro de movimientos sin doble aplicación |
| F3 06 | Pendiente | Guerras y raids | F3 05 | Preparación, participantes y reparto |
| F3 07 | Pendiente | Correo chat y moderación | F3 04 | Bloqueo, denuncia, límites y auditoría |
| F4 01 | Pendiente | Edificios y colas | F1 05 | Gastos y finalización atómicos |
| F4 02 | Pendiente | Producción offline | F4 01 | Liquidación única y capacidades respetadas |
| F4 03 | Pendiente | Asaltos de fortaleza | F4 02 | Protección y pérdidas limitadas |
| F4 04 | Pendiente | Mascotas y hábitats | F2 02 | Captura y alimento con condiciones visibles |
| F4 05 | Pendiente | Biblioteca y logros | F1 06 | Desbloqueos únicos y progreso por plantilla |
| F4 06 | Pendiente | Tareas diarias y títulos | F4 05 | Reinicio y premios sin explotación |
| F5 01 | Pendiente | Torre y compañeros | F2 05 | Equipo y combates de grupo |
| F5 02 | Pendiente | Subsuelo | F4 02 | Reutiliza motor de producción y límites |
| F5 03 | Pendiente | Gestor de arena | F4 02 | Prestigio separado sin pérdidas del héroe |
| F5 04 | Pendiente | Expediciones opcionales | F1 06 | Elecciones persistentes y cierre único |
| F5 05 | Pendiente | Eventos y temporadas | F3 03 y F4 06 | Calendario, instantánea y premios idempotentes |
| F5 06 | Pendiente | Catálogo de lanzamiento | F2 08 | Cobertura mínima y compatibilidad de recursos |
| F6 01 | Pendiente | Arte animación y sonido finales | F1 03 | Estados de combate y manifiesto completos |
| F6 02 | Pendiente | Accesibilidad y traducciones | F1 07 | Teclado, móvil, contraste y texto ampliado |
| F6 03 | Pendiente | Administración y soporte | F3 07 | Roles, auditoría y compensaciones |
| F6 04 | Pendiente | Alertas y presupuesto | F5 05 | Umbrales, responsables y límites |
| F6 05 | Pendiente | Copias y restauración | F0 02 | Restauración ensayada y objetivos medidos |
| F6 06 | Pendiente | Carga y pruebas prolongadas | Todas las fases de juego | Objetivo de usuarios y progreso validados |
| F6 07 | Pendiente | Despliegue beta y lanzamiento | F6 01 a F6 06 | URL comprobada, recuperación y cero fallos críticos |

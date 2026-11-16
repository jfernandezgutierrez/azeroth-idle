# Azeroth · Crónicas de dos reinos

Prototipo jugable de RPG incremental en español inspirado en el bucle de misiones de Shakes & Fidget y la fantasía de Warcraft. Proyecto de aficionados sin afiliación con Blizzard ni Playa Games. No es una reproducción completa de ninguno de esos juegos.

## Plan del juego completo

El [plan maestro en Word](docs/Plan_maestro_Azeroth_Idle.docx) define la jugabilidad, el escalado automático, los sistemas, la arquitectura y las fases de producción. Su revisión visual está pendiente; el contenido también puede consultarse en [la fuente de texto](docs/MASTER_PLAN.md).

Para continuar el desarrollo, consultar [el estado actual](docs/PROGRESS.md), [las tareas y sus dependencias](docs/BACKLOG.md) y [la matriz de fidelidad](docs/FIDELITY.md). Las instrucciones de continuidad están en [AGENTS.md](AGENTS.md). El plan describe el producto objetivo; no implica que todos esos sistemas estén implementados.

## Jugar

Con Node.js 22 o posterior: `npm run dev`, abrir http://127.0.0.1:4173. No hay dependencias que instalar ni proceso de compilación. También funciona en cualquier alojamiento estático HTTPS. No abrir index.html directamente desde el explorador: los módulos necesitan un servidor HTTP.

Modo práctica: se guarda por navegador, separado del personaje online. Para el modo online, crear cuenta y confirmar el correo si Supabase lo solicita; después iniciar sesión. La práctica no se importa a la nube. Un personaje por cuenta.

## Incluido

- Horda en Orgrimmar y Alianza en Ventormenta, con ilustraciones propias generadas.
- Tres clases y cinco atributos funcionales, entrenamiento, experiencia y niveles.
- Tres ofertas de misión generadas por nivel con perfiles de experiencia, oro y exploración. Las ofertas y las condiciones aceptadas son persistentes.
- Combate automático por turnos con vida, críticos, defensas de clase, furia y repetición guardada.
- Equipo individual con nivel, cuatro rarezas y veintiuna plantillas; nueve ranuras y escudo adicional para Guerrero.
- Mochila de veinte piezas, favoritos, filtros, comparación, venta confirmada y bandeja de botín de cincuenta piezas.
- Armería con seis ofertas persistentes, renovación diaria y renovación opcional con oro del juego.
- Arena contra NPC, mazmorra progresiva y clasificación online.
- Cien unidades de aventura por día, repuestas a medianoche de Madrid. Arena de entrenamiento y mazmorras usan esperas independientes.
- Diseño adaptable a móvil y escritorio.
- Guía contextual persistente para aceptar una misión, cobrarla y mejorar al héroe. Se puede ocultar y volver a mostrar.

## Supabase

Proyecto conectado: `zhubckfwdfnuhxwvbgvv`. Configuración pública en `config.js`; solo contiene URL y clave publicable. Nunca colocar claves secretas o service_role en el navegador.

`supabase/schema.sql` conserva el esquema inicial. `supabase/classic_v1.sql` es la actualización aditiva del núcleo clásico, generada desde `classic_v1.template.sql` y los catálogos compartidos. La versión nueva guarda estado, comandos y movimientos económicos en `realm_private`, inaccesible directamente al jugador. `realm_command` comprueba identidad, serializa acciones por cuenta y devuelve el resultado guardado cuando se reintenta el mismo identificador. La clasificación solo devuelve nombre, facción, nivel y experiencia.

El cliente anterior debe recargar: no se permite mantener dos economías modificables en paralelo. Las partidas iniciales se convierten al acceder y se conserva una copia privada previa. La práctica también se convierte sin reiniciar oro ni propiedad. La semilla de un combate pendiente no se envía al cliente online.

Aplicar `supabase/onboarding_v1.sql` después del núcleo clásico para activar la guía persistente. Esta capa mantiene las reglas `classic-1` y procesa el avance de la guía en la misma transacción que la acción del juego.

Aplicar después `supabase/gear_v1.sql`, compilado desde su plantilla y catálogos compartidos. El cliente v0.3 usa `realm_command_v3`; el contrato anterior pide recargar. La conversión conserva las piezas antiguas y sus efectos, registra eventos de objetos y protege los premios cuando la mochila está llena. No hay caducidad de bandeja en esta primera versión.

Las funciones privilegiadas están en `realm_private`, con search_path vacío, comprobación explícita de auth.uid y permisos de ejecución limitados. Las funciones públicas son envoltorios SECURITY INVOKER. No añadir realm_private a los esquemas expuestos por la API.

Autenticación por correo y contraseña mediante Supabase Auth. Configurar Site URL/Redirect URLs y correo de producción en el panel antes de abrir un registro público a gran escala. La configuración de confirmación de correo se conserva.

## Validación

`npm test` comprueba reglas, tiempo, migración, combate, probabilidades y reintentos de conexión. `npm run check` valida sintaxis, importaciones, catálogos y correspondencia del SQL generado. GitHub Actions arranca PostgreSQL 17 aislado, compara resultados JS y SQL, comprueba permisos y ejecuta doce reintentos simultáneos contra el mismo comando. Las pruebas online de Supabase se ejecutan dentro de transacciones revertidas.

Los archivos de `tests/bootstrap.sql` y el script de concurrencia son exclusivamente para la base efímera de CI; no se aplican a Supabase real. Las reglas son propias, versionadas como `classic-1`, y todavía requieren equilibrio con partidas prolongadas.

## Siguientes etapas

Reciclaje, servicios de herrero, gemas, consumibles, campañas con llaves, más clases y razas, gremios, PvP real, chat moderado, mascotas, monturas, fortaleza y eventos. La tienda inicial agrupa el equipo de cada clase; no se presenta como un sistema completo de comercio y servicios. Los sprites son ilustraciones estáticas y la repetición usa barras de vida y registro de ataques.

## Recursos visuales

`assets/cities.png`: atlas de dos capitales. `assets/sprites.png`: atlas transparente 4 × 3 con seis personajes, cuatro objetos y dos enemigos. Generados con la herramienta integrada de imágenes. Especificaciones de generación en `assets/prompts.md`.

`assets/gear.png`: doce iconos nuevos de armas, armaduras, joyería y escudo. La revisión visual de las nuevas pantallas de v0.3 queda pendiente por una incidencia del entorno del navegador; sí pasan las pruebas de sus plantillas, comparación y escapado de texto.

## Web en GitHub Pages

Dirección: https://jfernandezgutierrez.github.io/azeroth-idle/

El flujo Publicar web despliega automáticamente después de que Comprobar juego termine correctamente en main. Publica exactamente el commit comprobado. Genera la web con npm run build:pages en tmp/pages, una carpeta que debe estar vacía o no existir. Solo se incluyen los archivos necesarios para jugar, con rutas relativas. No se publican documentos o SQL en el alojamiento estático; el repositorio es público por autorización del propietario.

Publicación inicial verificada: portada y 24 archivos correctos; consultar docs/PROGRESS.md para la evidencia. La práctica funciona por separado del progreso online. Publicar este prototipo no cierra la fase de lanzamiento profesional.


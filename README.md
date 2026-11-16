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
- Cuatro objetos, compras, mochila y equipamiento por ranura.
- Arena contra NPC, mazmorra progresiva y clasificación online.
- Cien unidades de aventura por día, repuestas a medianoche de Madrid. Arena de entrenamiento y mazmorras usan esperas independientes.
- Diseño adaptable a móvil y escritorio.

## Supabase

Proyecto conectado: `zhubckfwdfnuhxwvbgvv`. Configuración pública en `config.js`; solo contiene URL y clave publicable. Nunca colocar claves secretas o service_role en el navegador.

`supabase/schema.sql` conserva el esquema inicial. `supabase/classic_v1.sql` es la actualización aditiva del núcleo clásico, generada desde `classic_v1.template.sql` y los catálogos compartidos. La versión nueva guarda estado, comandos y movimientos económicos en `realm_private`, inaccesible directamente al jugador. `realm_command` comprueba identidad, serializa acciones por cuenta y devuelve el resultado guardado cuando se reintenta el mismo identificador. La clasificación solo devuelve nombre, facción, nivel y experiencia.

El cliente anterior debe recargar: no se permite mantener dos economías modificables en paralelo. Las partidas iniciales se convierten al acceder y se conserva una copia privada previa. La práctica también se convierte sin reiniciar oro ni propiedad. La semilla de un combate pendiente no se envía al cliente online.

Las funciones privilegiadas están en `realm_private`, con search_path vacío, comprobación explícita de auth.uid y permisos de ejecución limitados. Las funciones públicas son envoltorios SECURITY INVOKER. No añadir realm_private a los esquemas expuestos por la API.

Autenticación por correo y contraseña mediante Supabase Auth. Configurar Site URL/Redirect URLs y correo de producción en el panel antes de abrir un registro público a gran escala. La configuración de confirmación de correo se conserva.

## Validación

`npm test` comprueba reglas, tiempo, migración, combate, probabilidades y reintentos de conexión. `npm run check` valida sintaxis, importaciones, catálogos y correspondencia del SQL generado. GitHub Actions arranca PostgreSQL 17 aislado, compara resultados JS y SQL, comprueba permisos y ejecuta doce reintentos simultáneos contra el mismo comando. Las pruebas online de Supabase se ejecutan dentro de transacciones revertidas.

Los archivos de `tests/bootstrap.sql` y el script de concurrencia son exclusivamente para la base efímera de CI; no se aplican a Supabase real. Las reglas son propias, versionadas como `classic-1`, y todavía requieren equilibrio con partidas prolongadas.

## Siguientes etapas

Objetos como instancias con nivel y rareza, tiendas escalables, campañas, más clases y razas, gremios, PvP real, chat moderado, mascotas, monturas, fortaleza y eventos. El catálogo actual conserva cuatro objetos; no se presenta como una economía de equipo completa. Los sprites siguen siendo ilustraciones estáticas y la repetición usa barras de vida y registro de ataques.

## Recursos visuales

`assets/cities.png`: atlas de dos capitales. `assets/sprites.png`: atlas transparente 4 × 3 con seis personajes, cuatro objetos y dos enemigos. Generados con la herramienta integrada de imágenes. Especificaciones de generación en `assets/prompts.md`.

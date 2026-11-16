# Azeroth · Crónicas de dos reinos

Prototipo jugable de RPG incremental en español inspirado en el bucle de misiones de Shakes & Fidget y la fantasía de Warcraft. Proyecto de aficionados sin afiliación con Blizzard ni Playa Games. No es una reproducción completa de ninguno de esos juegos.

## Jugar

Con Node.js 22 o posterior: `npm run dev`, abrir http://127.0.0.1:4173. No hay dependencias que instalar ni proceso de compilación. También funciona en cualquier alojamiento estático HTTPS. No abrir index.html directamente desde el explorador: los módulos necesitan un servidor HTTP.

Modo práctica: se guarda por navegador, separado del personaje online. Para el modo online, crear cuenta y confirmar el correo si Supabase lo solicita; después iniciar sesión. La práctica no se importa a la nube. Un personaje por cuenta.

## Incluido

- Horda en Orgrimmar y Alianza en Ventormenta, con ilustraciones propias generadas.
- Tres clases, personaje, atributos, entrenamiento, experiencia y niveles.
- Tres misiones temporizadas persistentes con resultado de combate y recompensas.
- Cuatro objetos, compras, mochila y equipamiento por ranura.
- Arena contra NPC, mazmorra progresiva y clasificación online.
- Energía que regenera un punto por minuto y guardado local o en Supabase.
- Diseño adaptable a móvil y escritorio.

## Supabase

Proyecto conectado: `zhubckfwdfnuhxwvbgvv`. Configuración pública en `config.js`; solo contiene URL y clave publicable. Nunca colocar claves secretas o service_role en el navegador.

`supabase/schema.sql` contiene el esquema instalado. `realm_heroes` tiene RLS: cada usuario puede leer su propia fila. Las escrituras directas están revocadas; todas las acciones pasan por funciones que comprueban identidad, propiedad, precios, energía, temporizadores e inventario. Bloqueo de fila para evitar recompensas duplicadas bajo concurrencia. La clasificación solo devuelve nombre, facción, nivel y experiencia.

Las funciones privilegiadas están en `realm_private`, con search_path vacío, comprobación explícita de auth.uid y permisos de ejecución limitados. Las funciones públicas son envoltorios SECURITY INVOKER. No añadir realm_private a los esquemas expuestos por la API.

Autenticación por correo y contraseña mediante Supabase Auth. Configurar Site URL/Redirect URLs y correo de producción en el panel antes de abrir un registro público a gran escala. La configuración de confirmación de correo se conserva.

## Validación

`npm test` comprueba temporizadores, doble cobro, compra, propiedad, equipo, niveles y regeneración. `npm run check` comprueba sintaxis. Se ejecutaron además pruebas de funciones y permisos en Supabase dentro de transacciones revertidas, sin dejar cuentas de prueba.

## Siguientes etapas

Combate por turnos con habilidades, más clases y razas, inventario ampliado, gremios, PvP real, chat moderado, mascotas, monturas, fortaleza, eventos y economía equilibrada. La suerte se muestra pero aún no interviene en el botín. Los combates actuales se resuelven por poder con variación aleatoria; no hay simulación de turnos. Los sprites son ilustraciones estáticas, no animaciones completas.

## Recursos visuales

`assets/cities.png`: atlas de dos capitales. `assets/sprites.png`: atlas transparente 4 × 3 con seis personajes, cuatro objetos y dos enemigos. Generados con la herramienta integrada de imágenes. Especificaciones de generación en `assets/prompts.md`.

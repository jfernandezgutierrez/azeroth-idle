# Matriz de fidelidad de la jugabilidad

La referencia principal son las misiones clásicas. Consulta oficial: 16 de noviembre de 2026. Las reglas propias se diferencian de las fórmulas oficiales. Fuentes completas en MASTER_PLAN.md.

| Elemento | Referencia confirmada | Decisión del proyecto | Estado v0.2 |
| --- | --- | --- | --- |
| Taberna | Tres misiones clásicas con recompensas y coste S1 | Mantener elección entre tres ofertas persistentes | Generación por nivel y perfiles de recompensa |
| Espera | Temporizador después de aceptar S1 | Reloj del servidor y recuperación offline | Contrato persistente con ficha capturada |
| Combate | Automático por turnos y furia S4 | Turnos, registro, repetición y sin control manual obligatorio | Implementado y comprobado en JS y SQL |
| Clases | Atributo principal y defensas diferentes S3 | Tres arquetipos iniciales y cinco atributos | Cinco atributos funcionales y defensas por clase |
| Arena | Rivales de rango cercano, honor y enfriamiento S4 | PvP asíncrono con ficha capturada | NPC sin PvP |
| Mazmorras | Acceso condicionado, jefes y recompensas S5 | Campaña fija más desafío generado | Un rival progresivo |
| Expediciones | Alternativa al modo clásico S2 | Modo posterior opcional | No existe |
| Aventura diaria | Reposición a cien a medianoche documentada en Tavern | Cien unidades y reposición diaria en Madrid | Implementada con pruebas de cambio horario |
| Facciones | Ambientación pedida por Javier | Capital distinta e igualdad económica | Ambas capitales disponibles |
| Fórmulas | No se afirma paridad numérica | Coeficientes propios versionados y simulados | classic-1 con pruebas deterministas y estadísticas |

La fidelidad se revisa sobre acciones y decisiones reales. Un aspecto visual parecido no acredita equivalencia de jugabilidad. Antes de añadir una desviación, registrar comportamiento, motivo y aceptación en DECISIONS.md.

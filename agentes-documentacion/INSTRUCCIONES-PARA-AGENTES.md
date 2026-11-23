# Instrucciones para agentes

Lee esto antes de trabajar en el proyecto.

1. **Contexto rápido:** lee `README.md` (raíz) para el estado de cada reto y `RETOS/DOCUMENTACION_COMPLETA.md` para el detalle técnico.
2. **Retomar trabajo:** abre el archivo más reciente de `agentes-documentacion/<tu-agente>/` y busca la última entrada `🔄 En progreso`. Su campo "Pendiente" dice exactamente por dónde seguir.
3. **Documenta cada acción** en `agentes-documentacion/<tu-agente>/YYYY-MM-DD.md` justo después de hacerla, con el formato de `README.md` de esta carpeta.
4. **Si el contexto se agota a medias:** deja una entrada `🔄 En progreso` con el "Pendiente" completo para que otro agente siga sin re-explicación.
5. **Organización de retos:** cada reto va en `RETOS/retoNN_nombre/` con `descripcion.txt` (enunciado), evidencias, script de solución y un `.md` de solución. Al resolver uno, actualiza la tabla del `README.md` raíz y la sección "Banderas finales" de `DOCUMENTACION_COMPLETA.md`.
6. **Banderas:** el CTF usa `FLAG{ md5(respuesta) }`. Verifica con un script antes de reportar una bandera.
7. **Git:** no subir `.playwright-mcp/` (ya está en `.gitignore`). Commits en español, descriptivos.

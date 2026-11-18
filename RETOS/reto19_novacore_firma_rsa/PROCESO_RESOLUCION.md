# Reto 19 — NovaCore · PROCESO DE RESOLUCIÓN (cómo llegamos a todo)

> Bitácora metodológica: el camino real, con razonamientos, pistas y callejones sin salida.
> Para los resultados/valores finales ver `SOLUCION_COMPLETA.md`. Para la referencia técnica del cripto ver `HALLAZGOS_WEB.md`.

---

## 0. Punto de partida
El reto pide **3 cosas**: *mensaje original*, *mensaje cifrado* y *llave pública con la que verifican la firma* (1000 c/u). Entrada: `COMUNICADO_OFICIAL.zip`.

Teníamos trabajo previo (carpeta `firmas/`, `stego_imagenes/`, un `SOLUCION.md` viejo) con una **hipótesis equivocada**: que era un "many-time pad XOR" y que la llave pública era la del comunicado. Un intento (`FLAG{b4445da0…}`) dio **Incorrect**, lo que obligó a replantear todo.

## 1. El diario de Canva (la pista que reencuadró el reto)
Se subió un export de Canva: *"NO PUEDO DEJARLO ASÍ — Diario NovaCore"*.
- Lo leímos extrayendo el texto del HTML (ojo: encoding UTF-8 por los emojis/acentos).
- Pistas clave: *"Dejé las evidencias en la **bóveda**"*, *"comprobar cuáles archivos son **auténticos**"*, *"una confesión firmada con mi clave, tendrá que **verificarla** antes de creerla"*.
- Conclusión: el reto gira en torno a **verificar una firma digital**, y la fuente real está en un sitio web. El párrafo "corrupto" de la página 7 resultó ser ruido narrativo (probamos acrósticos: sin señal).

## 2. Esteganografía → el sitio
Las 4 imágenes (steghide, passphrases `paradise/animals/perfect/titanic`) apuntaban a `https://novacore-seven.vercel.app/` con la frase *"el acceso visible no cuenta toda la historia"* → hay que mirar el **código fuente / JS**.

## 3. Descarga y RE del bundle JS (la mina de oro)
```bash
curl -s https://novacore-seven.vercel.app/ -o nc_index.html        # -> /assets/index-DI3u337G.js
curl -s https://novacore-seven.vercel.app/assets/index-DI3u337G.js -o nc.js   # 534 KB minificado
```
Buscando en el bundle (`grep` de `xor/descifr/clave/atob/sealedContent`) descubrimos el **cripto-primitivo real**, al que llamamos **NC1**:
```
keystream[bloque r] = SHA256("clave|r")   (32 bytes)
plano = base64decode(blob) XOR keystream  →  debe empezar con "NC1:"  →  quitar 4 bytes
```
- `sr` = SHA-256 (sus constantes de init lo delataron). Prefijo mágico `ur = "NC1:"`.
- Transformaciones halladas: `dr=sha256hex`, `fr(e,t)=dr("novacore|t|e")`, `pr(e)=dr("comprobar|e")`, `mr=normalizar` (sin acentos, minúsculas, solo `a-z0-9`), `hr(e)=pr(fr(mr(e),"acertijo"))`.

**Callejón sin salida #1:** el "dsjyB…" del intento previo (XOR many-time pad) era una lectura incorrecta; el esquema real es NC1.

## 4. La bóveda y los acertijos
Implementamos el descifrador NC1 en Python y resolvimos los **19 acertijos** de la bóveda. La contraseña de cada blob = `fr(mr(respuesta), "sello|"+id_acertijo)`; la clave del label = `hr(respuesta)`.
- Respuestas (trivia cripto): `hexadecimal / simetrico / asimetrico / phishing / troyano / vector de inicializacion`.
- La mayoría de blobs eran **señuelos** ("aquí no es", "este memo ya venció", "solo un borrador").
- Los útiles apuntaban a: **Llave DES = fila vigente de `carta_sin_enviar`**, **Vector DES (IV)**, la **SIGNATURE**.
- Mapa de recompensas: `actas→message`, `respaldos→signature`, `ultima→confession`.

## 5. El objetivo real en el código
Localizamos el objeto `Qn` con `message:{name:orden_pago_OP-0430.txt, sealedContent:"Apyf…"}` y `signature:{name:SIGNATURE.sig, sealedContent:"Apyf…"}` (ambos NC1, **misma clave** `ee`).
`ee = Ur() = kr(custodia, qn)` → `ee` sale de la **bóveda** y se valida con `sha256("comprobar|"+ee)===qn`.

## 6. La cadena de dependencias (el orden que descubrimos)
Reconstruyendo el flujo del vault:
```
ee  ←  código de custodia  ←  Mensaje DES (tabla oculta)  ←  llave DES (llavero)  ←  consola MySQL  ←  …
acta_custodia.enc  ←  llave de cuenta  ←  login (SQLi/contraseña)
```
Clave del hallazgo: `acta_custodia_documental.txt` (al descifrarlo) dice: *"El código de custodia es el **Mensaje DES ya descifrado**"*. Y `carta_sin_enviar` apunta a una **tabla oculta**.

## 7. Crackeo en cascada (verificadores exactos)
Cada secreto tenía un **verificador** en el bundle, así que se podían brutear offline:
1. **Login**: `email` validado por `sha256("correo|"+email)` → `ramirezseto@novacore.com`. `password` validado por `sha256("comprobar|"+sha256("novacore|ingreso|"+pw))===Kn`. Brute con wordlist (rockyou-75) → **`nopassword`**.
   - Llave de cuenta = `sha256("novacore|ingreso|nopassword")`. Descifra los `.enc`.
2. **Consola MySQL** (`mysql -u <user> -p`): user por `sha256("usuario|"+u)` → **`tesoreria`**; password por `sha256("comprobar|"+sha256("novacore|mysql|"+pw))===897c68a3…` → **`Trebol2025`**.
   - Con la llave de consola desciframos la tabla **`llavero`** → `carta_sin_enviar | des-cbc | 133457799BBCDFF1 | vigente` (la otra fila `reemplazada` era señuelo).
3. **DES-CBC**: llave `133457799BBCDFF1` (¡la clave de prueba clásica del FIPS!) + IV `F4DBAE5A65F00546`.
   - `carta_sin_enviar.enc` (NC1, llave cuenta) → hex → DES-CBC → una **confesión** que revela: *"lo que de verdad guardé está en una tabla que SHOW TABLES no muestra. Su nombre va corrido tantos puestos como filas tiene la tabla llavero: `FDMRQ_SULYDGR`"*.
   - `llavero` tiene **3 filas** → **César −3** → `FDMRQ_SULYDGR` = **`CAJON_PRIVADO`**.
4. **Tabla oculta `CAJON_PRIVADO`** (blob `Xn`, llave de consola) → fila `mensaje_des` (des-cbc, hex).
   - DES-CBC → **`LO_MAS_INTIMO_NUNCA_SE_ENCUENTRA`** = el **código de custodia**.
5. **`ee`** = `sha256("novacore|boveda|"+mr(codigo))` → **valida contra `qn` ✓**.

## 8. Apertura final
Con `ee` desciframos (NC1):
- **Mensaje original** = la orden `OP-0430` (262 bytes).
- **Mensaje cifrado** = la firma RSA (base64, 128 bytes = RSA-1024).

**Verificación de la firma (RSA crudo):** el padding es **PKCS#1 v1.5 + SHA-256** válido, y 128 bytes ⇒ la verifica la llave **comunicado (1024-bit)**, no las de firma de 2048. PERO el hash firmado (`e87c6618…`) **no coincide** con el mensaje → la firma está **forjada**. Eso confirma la moraleja del diario: *"no confiar en algo solo porque parece verdadero"*.

## 9. Callejones sin salida (para no repetirlos)
- ❌ Hipótesis "many-time pad XOR" (era NC1/SHA-256).
- ❌ Llave pública = firma_vigente 2048-bit (la firma es 1024 → es la del comunicado).
- ❌ Flags md5 del **archivo local** OP-0430 (271 B) en vez del **descifrado** (262 B).
- ❌ Brute del código/clave con listas cortas (se recuperan por la cadena, no se adivinan).
- ❌ Buscar el mensaje firmado por su hash `e87c6618` (no existe: la firma es forjada).

## 10. Pendiente
Confirmar el **formato exacto** que acepta CTFd para cada hallazgo (md5 de: archivo / base64 / con o sin salto). Candidatos en `SOLUCION_COMPLETA.md`. En cuanto uno acierte, se deduce el formato de los otros dos.

## Scripts
- `decryptor_nc1.py` — descifrador NC1 + solver de acertijos (reutilizable).
- Verificadores de brute (login/consola/código) y DES-CBC: ver comandos en esta bitácora.

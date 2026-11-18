# Reto 19 — NovaCore "Mensaje Original" — DOCUMENTACIÓN COMPLETA

> Reto CRYPTO (firmas digitales RSA). 3 hallazgos × 1000: **mensaje original**, **mensaje cifrado**, **llave pública**.
> Entrada: `COMUNICADO_OFICIAL.zip`. Infraestructura: `https://novacore-seven.vercel.app`.
> Formato de flag del CTF (instructivo): **`FLAG{ md5(respuesta) }`** (ej. respuesta `fotografía` → `FLAG{8aa6a366656863589ceb7a8d90a88acb}`).

---

## 1. Credenciales y secretos (todos verificados en vivo con Playwright)

| Qué | Valor | Cómo se obtuvo |
|---|---|---|
| **Login cuenta** | `ramirezseto@novacore.com` / `nopassword` | Vuln SQLi en login; brute del verificador `Kn` (wordlist) |
| Llave de cuenta | `sha256("novacore\|ingreso\|nopassword")` = `514a30e8…` | Descifra los `.enc` (esquema NC1) |
| **Consola MySQL** | `mysql -u tesoreria -p` / `Trebol2025` | user: `sha256("usuario\|tesoreria")`; pass vs verificador `897c68a3…` |
| Llave de consola | `sha256("novacore\|mysql\|Trebol2025")` = `dc9468d7…` | Descifra la tabla `llavero` |
| **Llave DES (vigente)** | `133457799BBCDFF1` | Tabla `llavero` (consola), fila `carta_sin_enviar` vigente |
| IV DES | `F4DBAE5A65F00546` | blob `Zn` |
| Tabla oculta | `CAJON_PRIVADO` (= `FDMRQ_SULYDGR` con **César −3** = nº filas del llavero) | `SHOW TABLES` no la muestra |
| Mensaje DES | `LO_MAS_INTIMO_NUNCA_SE_ENCUENTRA` | DES-CBC de `cajon_privado.mensaje_des` |
| **Código de bóveda** | `LO_MAS_INTIMO_NUNCA_SE_ENCUENTRA` | = el Mensaje DES descifrado |
| Clave maestra bóveda `ee` | `sha256("novacore\|boveda\|"+mr(código))` = `fee45a37…` | Valida vs `qn` ✓ |
| **Llave AES-256 (Gestión Humana)** | `1d8e4fa07c36b29d5e01f7ca846b3d92a07ec5183bd64f29e8710c5ab6d3f924` | Stego LSB en `plano_sede_piso2.png` |
| **Llave AES-256 (Tesorería)** | `7f3a91c4e20b58d6a1f47c3e9b06d2584ce17a93f05b28c6d94e10ab37f2c865` | Stego LSB en `plano_oficinas_tesoreria.png` |
| IV AES (GH) | `c07a15e93d6f28b4a1907e5dc2483fb6` | `control_de_cifrado_gestion_humana.txt` |
| IV AES (Tesorería v0) | `4b9e27d1a06c83f5e2197dc04a6bf138` | `control_de_cifrado_tesoreria.txt` |

## 2. Criptografía reverseada del bundle (`index-DI3u337G.js`)
- **Esquema NC1**: `keystream[bloque r]=SHA256("clave|r")`; `plano = base64decode XOR keystream`; prefijo `NC1:`.
- `dr`=sha256hex · `fr(e,t)`=sha256(`novacore|t|e`) · `pr(e)`=sha256(`comprobar|e`) · `mr`=normalizar (sin acentos, minús., `[a-z0-9]`).
- Verificadores: `Kn`=cuenta, `qn`=custodia, `897c68a3`=consola, email-hash `e25d2247`.

## 3. Pistas narrativas decodificadas
- **Memos de rotación** (Vigenère, clave = mes en curso):
  - *noviembre* → "EL PLANO DE LA SEDE ESCONDE LA LLAVE DEL ARCHIVO RESERVADO DE TESORERIA"
  - *octubre* → "LA REUNION DE CIERRE DE SEPTIEMBRE PASA AL JUEVES EN LA SALA DOS"
  - *septiembre* → "RENUEVE EL CERTIFICADO DEL PORTAL ANTES DE TERMINAR EL MES"
- **Bóveda `/boveda`** (9 cajas, acertijos resueltos): 35 min · $21.350.000 · "hash" · César `MPYTH`→`FIRMA`.
  - Recompensas: `actas`→**message** (`orden_pago_OP-0430.txt`); `respaldos`→**signature** (`SIGNATURE.sig`); `ultima`→confession (link Canva).
- **Diario/Expediente NC-1101** (Canva): *"cambié el beneficiario de la orden para pagarle a Comercial Altamira"*, *"preparé una versión alterada de un reporte"*, *"¿Cómo demostrar que fui yo? La respuesta está en la **firma**"*.

## 4. Los 3 artefactos (confirmados en vivo en la bóveda)
1. **Mensaje original** → `orden_pago_OP-0430.txt` (262 B):
   ```
   ORDEN DE PAGO OP-0430
   Emisor: NovaCore Solutions S.A.S.
   Area: Tesoreria
   Referencia: TRX-2026-0430
   Beneficiario: Comercial Altamira S.A.S.
   Identificacion: NIT 999000589-0
   Cuenta de destino: CTA-FICTICIA-77120
   Valor: $ 86.300.000 COP
   Autoriza: Gerencia Financiera
   ```
2. **Mensaje cifrado** → `SIGNATURE.sig` (base64, RSA-1024):
   `a9MSHSjSAZKLPTy9ebS+66COvYIylR4bAosGggx5UREnxC/rY56yYAFPc1UQyCej6xlDvlnNoSfRbJ8xcR/1U7EUWq3LJbb/HZXcEXOx1B0ZmFNfjKATgZPgN8MU0+QJpkjGjSzUXI9puatg6nEzVIoM/4/f73qIuN6sLLA1GUk=`
3. **Llave pública** → `llave_publica_comunicado.pem` (RSA 1024-bit, del `COMUNICADO_OFICIAL.zip`).

## 5. Verificación de la firma (RSA crudo)
- Padding **PKCS#1 v1.5 + SHA-256** válido; hash firmado embebido = `e87c6618798bc11967f9a9b3c22cd47e3049b98059238398b64bf3622ab85a63`.
- `sha256(OP-0430)` = `9e651fb6…` ≠ `e87c6618…` → **la firma NO verifica la OP-0430** = firma **forjada** / firma el documento ORIGINAL (no el manipulado). Moraleja: *verificar antes de creer*.
- `openssl dgst -sha256 -verify llave_publica_comunicado.pem -signature firma.sig mensaje_original.txt` → **Verification failure** (esperado).

## 6. Archivos AES/DES descifrados (todos señuelos para el hash firmado)
| Archivo | Cripto | Descifrado | sha256 |
|---|---|---|---|
| `reporte_cifrado_gestion_humana.enc` | AES-256-CBC | "Encuesta de clima laboral: 82 respuestas…" | ee8eb861 |
| `informe_reservado_tesoreria_v0.enc` | AES-256-CBC | "BORRADOR ANULADO. Reemplazado por la versión definitiva." | 53c9020d |
| `carta_sin_enviar.enc` | DES-CBC | confesión "Les avisé en agosto…" (apunta a `CAJON_PRIVADO`) | 4b0e5751 |
| `informe_reservado_tesoreria.enc` (definitivo, 624 B hex) | AES (clave desconocida) | **no descifrado** — su llave no aparece en ningún lado hallado | — |
| `ordenes_de_pago.csv` (integridad) | — | **MODIFICADO** (hash real ≠ hash registrado) = evidencia de manipulación | — |

## 7. Pendiente / bloqueos
1. **Formato exacto del flag**: `md5` del contenido de los 3 artefactos **no es aceptado** en ningún formato probado (archivo/strip/base64/hex/CRLF/sin-salto). Se requiere calibrar con un flag aceptado de otro reto, o confirmar si reto 19 tiene "instrucciones especiales".
2. **Mensaje original firmado** (hash `e87c6618`): es el **informe definitivo de Tesorería** (AES, 624 B), cuya llave AES no se encontró (la del plano descifra solo el borrador v0). Falta ese eslabón o la confesión byte-exacta.

## 8. Candidatos de flag (por si la convención es md5 del contenido)
```
Mensaje original:  FLAG{e5f6560b9d5685dde1679a11e3a713e7}  (OP-0430 con \n)  /  FLAG{67d0d98194266679cc1a19a6a3bc55f4} (sin \n)
Mensaje cifrado:   FLAG{7075328c50ca3b783c356963caedb439}  (firma base64)
Llave pública:     FLAG{4e2aa20d495a58ec6a206ca38e1b7ad2}  (PEM archivo)  /  FLAG{b4445da0af8ddb3bb2e0b5f2ced0e819} (PEM strip)
```

## 8b. Intentos de flag DESCARTADOS (ya probados = Incorrect)
Llave pública (todos fallaron):
```
FLAG{b4445da0af8ddb3bb2e0b5f2ced0e819}   md5(PEM comunicado strip)
FLAG{cb879f575d7cc972c2adcd57ca555e69}   md5(PEM vigente strip)
FLAG{dcd8cc65b7c9b6407f01c9d9c6e0670f}   md5(vigente local file)
FLAG{d91cb9eaaf24d86ace88d26f10edd34d}   md5(base64 cuerpo vigente)
FLAG{41cfa7836c83e72e202c209d02b58884}   md5(vigente file +nl)
```
Mensaje/firma probados y fallidos: `e5f6560b…`, `67d0d98…`, `f18a4fa4…`, `7075328c…`, `4e2aa20d…`, y variantes short-string.
**Conclusión:** la convención `md5(contenido_del_archivo)` NO aplica a reto 19 → el `respuesta` es otra cosa (pendiente de calibrar con un flag aceptado o instrucción especial del reto).

## 9. Scripts
- `decryptor_nc1.py` — descifrador NC1 + solver de acertijos.
- `solve_full_chain.py` — cadena NC1→DES→código→ee→message/signature.
- `entregables/` — `mensaje_original.txt`, `firma.sig`, `llave_publica.pem` (para `openssl`).

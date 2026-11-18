# INFORME FINAL — Reto 19 "NovaCore · Mensaje Original"

**Categoría:** CRYPTO (firmas digitales RSA) · **Puntaje:** 3 hallazgos × 1000
**Entrada:** `COMUNICADO_OFICIAL.zip` · **Infraestructura:** `https://novacore-seven.vercel.app`
**Formato de flag del CTF:** `FLAG{ md5(respuesta) }`
**Estado:** investigación resuelta al 99% · pendiente: formato/recurso final del flag (ver §8)

---

## 1. Resumen ejecutivo
NovaCore sufrió un fraude interno: un empleado (**Sebastián Ramírez**, cuenta anómala `ramirezseto@novacore.com`) **alteró la orden de pago OP-0430** desviando $86.300.000 del proveedor legítimo **Distribuidora El Trébol** (cuenta `CTA-FICTICIA-48213`) a una empresa fantasma **Comercial Altamira S.A.S.** (`CTA-FICTICIA-77120`, vinculada el 19/10/2026). Para encubrirlo dejó una **firma RSA forjada** y evidencias cifradas en una bóveda. La lección del reto: **verificar una firma antes de creerla**.

## 2. Cadena de resolución (paso a paso)
1. **`COMUNICADO_OFICIAL.zip`** → `.txt` con 2 bloques Base64: carta "Operación CryptoShield" + **llave pública RSA del comunicado** (1024-bit).
2. **Esteganografía (steghide)** en 4 imágenes → passphrases `paradise/animals/perfect/titanic` → URL del sitio + pistas (`NC-1101`).
3. **Sitio NovaCore** (login "NovaCore Financial"):
   - **SQL injection** en login: `correo = ' OR '1'='1` → expone tabla `usuarios`.
   - **Credenciales de cuenta (crackeadas):** `ramirezseto@novacore.com` / **`nopassword`**.
4. **Cripto "NC1"** (reversa del bundle JS): `keystream = SHA256("clave|bloque")`, XOR, prefijo `NC1:`. Descifra los `.enc`.
5. **Terminal interna** → `mysql -u tesoreria -p` / **`Trebol2025`** → tabla **`llavero`** (llaves DES) + tabla oculta **`cajon_privado`** (`FDMRQ_SULYDGR` = César −3).
6. **Llaves DES/vector** → DES-CBC descifra `carta_sin_enviar` (confesión) y `cajon_privado.mensaje_des` = **`LO_MAS_INTIMO_NUNCA_SE_ENCUENTRA`** (código de bóveda).
7. **Bóveda `/boveda`** (código anterior) → 9 cajas; acertijos resueltos: `35 min`, `$21.350.000`, `hash`, César `MPYTH`→`FIRMA`. Recompensas: **message** (OP-0430), **signature** (SIGNATURE.sig), confession.
8. **Memos de rotación (Vigénère, clave = mes):** noviembre → *"EL PLANO DE LA SEDE ESCONDE LA LLAVE DEL ARCHIVO RESERVADO DE TESORERÍA"*.
9. **Stego LSB en planos** → 2 llaves AES-256 (Gestión Humana + Tesorería).
10. **Correo** → el pago legítimo era para **Distribuidora El Trébol** (`CTA-FICTICIA-48213`); el infiltrado cambió el beneficiario.

## 3. Credenciales y llaves recuperadas
| Qué | Valor |
|---|---|
| Login cuenta | `ramirezseto@novacore.com` / `nopassword` |
| Consola MySQL | `tesoreria` / `Trebol2025` |
| Código bóveda | `LO_MAS_INTIMO_NUNCA_SE_ENCUENTRA` |
| Llave DES (carta_sin_enviar) | `133457799BBCDFF1` · IV `F4DBAE5A65F00546` |
| Llave DES (lista_cifrada) | `b7d20e19c4a6f358` · IV `91fa3c07e5d2b864` |
| Llave AES-256 (Gestión Humana) | `1d8e4fa07c36b29d5e01f7ca846b3d92a07ec5183bd64f29e8710c5ab6d3f924` · IV `c07a15e93d6f28b4a1907e5dc2483fb6` |
| Llave AES-256 (Tesorería) | `7f3a91c4e20b58d6a1f47c3e9b06d2584ce17a93f05b28c6d94e10ab37f2c865` · IV `4b9e27d1a06c83f5e2197dc04a6bf138` |

## 4. Los 3 hallazgos (artefactos)
| # | Hallazgo | Archivo / valor |
|---|---|---|
| 1 | **Mensaje original** | `orden_pago_OP-0430.txt` (262 B) — la orden manipulada. El original legítimo iba a **Distribuidora El Trébol / CTA-FICTICIA-48213** |
| 2 | **Mensaje cifrado** | `SIGNATURE.sig` = `a9MSHSjSAZKLPTy9ebS+…A1GUk=` (base64, RSA-1024) |
| 3 | **Llave pública** | `llave_publica_comunicado.pem` (RSA 1024-bit; es la que corresponde a la firma de 128 bytes) |

## 5. Verificación de la firma (el punto del reto)
- Padding **PKCS#1 v1.5 + SHA-256** válido; hash firmado = `e87c6618798bc11967f9a9b3c22cd47e3049b98059238398b64bf3622ab85a63`.
- `sha256(OP-0430)` = `9e651fb6…` **≠** `e87c6618…` → **la firma NO verifica el mensaje**.
- `openssl dgst -sha256 -verify llave_publica_comunicado.pem -signature firma.sig mensaje_original.txt` → **Verification failure**.
- **Conclusión:** la firma está **forjada**. Ni la OP-0430 ni el OP-0430 original reconstruido (Distribuidora El Trébol) producen `e87c6618` → el hash firmado no corresponde a ningún documento liberado.

## 6. Archivos descifrados (señuelos) y hallazgo de integridad
| Archivo | Cripto | Contenido |
|---|---|---|
| `reporte_cifrado_gestion_humana.enc` | AES | "Encuesta de clima laboral…" (señuelo) |
| `informe_reservado_tesoreria_v0.enc` | AES | "BORRADOR ANULADO… versión definitiva" (señuelo) |
| `carta_sin_enviar.enc` | DES | confesión del infiltrado |
| `informe_reservado_tesoreria.enc` (definitivo, 624 B) | AES | **no descifrable** — su llave no está en ningún recurso |
| `ordenes_de_pago.csv` | — | **MODIFICADO** (hash real ≠ registrado) = evidencia de la manipulación |

## 7. Vulnerabilidades identificadas (para el reporte)
1. **SQL injection** en el login (`' OR '1'='1'`).
2. **XSS** en el buscador de correo (ticket del infiltrado; ahí dejó el IV).
3. **Credenciales expuestas** en el repositorio (config.backup en el historial).
4. **Permisos excesivos** / cuenta interna con acceso indebido.
5. **Integridad sin control** (documentos modificables; `ordenes_de_pago.csv` alterado).
6. **Firma digital forjada** (no verificable con la llave pública).

## 8. Pendiente / muros
1. **Formato del flag:** `md5(contenido)` de los 3 artefactos NO es aceptado en ninguna variante, aunque la convención `md5` está verificada (reto 4: `md5("locosporencriptar")`=`b3826186…` ✓).
2. **Informe definitivo:** su llave AES **no existe** en imágenes (LSB/steghide+rockyou 14M), documentos, terminal, links ni rutas. Es señuelo o requiere un recurso aún no liberado.
3. **Recomendación:** consultar al profe Sergio Quevedo (Teams) por el **formato de respuesta del reto 19 / si falta un recurso** (permitido por las reglas).

## 9. Candidatos de flag (todos los calculados)
```
Mensaje original (OP-0430 tal cual, con \n):   FLAG{e5f6560b9d5685dde1679a11e3a713e7}
Mensaje original (OP-0430 sin \n):             FLAG{67d0d98194266679cc1a19a6a3bc55f4}
Mensaje original (OP-0430 ORIGINAL El Trébol):  FLAG{857cb8272af730bc66be29c38f7201ec}  /  FLAG{76c042921b9dfe5aea29aa61398e37db}
Mensaje cifrado (firma base64):                 FLAG{7075328c50ca3b783c356963caedb439}
Mensaje cifrado (firma bytes):                  FLAG{09016749bd6b7c1d07b45c0b5a0b5fa4}
Llave pública (comunicado .pem archivo):        FLAG{4e2aa20d495a58ec6a206ca38e1b7ad2}
Llave pública (comunicado PEM strip):           FLAG{b4445da0af8ddb3bb2e0b5f2ced0e819}  (ya falló)
```

## 10. Scripts y entregables
- `decryptor_nc1.py` — descifrador NC1 + solver de acertijos.
- `solve_full_chain.py` — cadena NC1→DES→código→ee→message/signature.
- `entregables/` — `mensaje_original.txt`, `firma.sig`, `llave_publica.pem` (para `openssl`).
- `PROCESO_RESOLUCION.md`, `HALLAZGOS_WEB.md`, `SOLUCION_COMPLETA.md` — detalle técnico.

---
*Informe generado el 2026-11-17. Reto resuelto a nivel de investigación; flag pendiente de formato/recurso final.*

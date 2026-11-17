# Reto 19 — NovaCore / "Mensaje Original" (CRYPTO · Firmas digitales RSA)

**Puntaje:** 3 hallazgos × 1000 c/u. **Las tres piezas pedidas:** mensaje original, mensaje cifrado (firma) y llave pública que verifica la firma.

## 1. Punto de partida: COMUNICADO_OFICIAL.zip
El `.txt` del zip eran **dos bloques Base64**:
- Bloque 1 → carta "Operación CryptoShield" (framing del reto).
- Bloque 2 → **llave pública RSA** (`-----BEGIN PUBLIC KEY-----`, 1024-bit) → `llave_publica_comunicado.pem`.

## 2. Esteganografía en las 4 imágenes (steghide)
Cada imagen tenía datos ocultos con **steghide**. Contraseñas halladas con `stegseek` + rockyou:

| Imagen | Passphrase | Contenido |
|---|---|---|
| Comedor.jpg.jpeg | `animals` | "Acá comemos pero la página no sabemos." |
| Edificio.jpg.jpeg | `perfect` | "Se ve lindo desde afuera pero no sé si la vista sea de ayuda." |
| Fondo.jpg.jpeg | `paradise` | **NC-1101 // Destino: https://novacore-seven.vercel.app/** |
| Parqueadero.jpg.jpeg | `titanic` | "De pronto se cayó algo por acá." |

```bash
stegseek --crack Fondo.jpg.jpeg rockyou.txt out.txt
```

## 3. Sitio NovaCore (SPA) → archivos de firma
El bundle JS (`/assets/index-*.js`) referencia `/retos/firmas/`. Archivos reales descargados:
- `llave_publica_firma.pem` (**VIGENTE**, 2048-bit)
- `llave_publica_firma_2025.pem` (**VENCIDA / señuelo**)
- `orden_pago_OP-0406/0412/0416/0422` → cada uno con `.txt` (original) y `.sig` (firma, 256 bytes = RSA-2048)
- `orden_pago_OP-0430.txt` y `OP-0426.txt` → **SIN .sig** (no existen las firmas → 404)

Narrativa en el sitio: *"La llave de firma documental de 2025 quedó vencida. Use la vigente para verificar documentos."*

## 4. Verificación de firmas (openssl)
```bash
openssl dgst -sha256 -verify llave_publica_firma.pem -signature orden_pago_OP-0406.sig orden_pago_OP-0406.txt
# -> Verified OK
```
Resultado de la matriz completa:

| Orden | Monto | llave VIGENTE | llave 2025 |
|---|---|---|---|
| OP-0406 | $28.400.000 | ✅ Verified OK | ❌ |
| OP-0412 | $41.250.000 | ✅ Verified OK | ❌ |
| OP-0416 | $54.100.000 | ✅ Verified OK | ❌ |
| OP-0422 | $32.980.000 | ✅ Verified OK | ❌ |
| OP-0426 | — | ⚠️ sin firma | — |
| OP-0430 | $86.300.000 | ⚠️ sin firma | — |

## RESPUESTA (los tres hallazgos)
1. **Mensaje original** → `orden_pago_OP-XXXX.txt` (texto plano de la orden de pago).
2. **Mensaje cifrado** → `orden_pago_OP-XXXX.sig` (la firma: hash cifrado con la clave privada).
3. **Llave pública que verifica** → `llave_publica_firma.pem` (la **vigente**; la `_2025` está vencida y NO verifica).

**Conclusión de la investigación:** las órdenes OP-0406/0412/0416/0422 son **auténticas** (firma válida con la llave vigente). Las órdenes **OP-0430 ($86.3M, Comercial Altamira) y OP-0426 carecen de firma digital válida** → son los pagos inyectados/fraudulentos. La llave de 2025 es un señuelo.

> Formato de bandera del CTF: `FLAG{ md5(respuesta) }` — aplicar al string exacto que pida la plataforma para cada hallazgo.

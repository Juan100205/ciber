# Reto 19 — NovaCore · Flags para probar (copiar y pegar)

> Formato del CTF: `FLAG{md5(contenido)}`. Prueba el **1º de cada bloque** primero.
> Cuando uno acierte, avísame: con ese formato confirmo los otros dos.

---

## 1️⃣ MENSAJE ORIGINAL (orden OP-0430)

```
FLAG{e5f6560b9d5685dde1679a11e3a713e7}
```
```
FLAG{67d0d98194266679cc1a19a6a3bc55f4}
```
```
FLAG{f18a4fa4cd095dbc8f9f007c085371f1}
```
```
FLAG{40a55a628a55a2ef024f9ab0e1484119}
```

- `e5f6560b…` = texto con salto de línea final (como queda descifrado) ← **probar primero**
- `67d0d98…` = texto sin salto final
- `f18a4fa4…` = con CRLF (Windows)
- `40a55a62…` = CRLF sin salto final

---

## 2️⃣ MENSAJE CIFRADO (la firma)

```
FLAG{7075328c50ca3b783c356963caedb439}
```
```
FLAG{09016749bd6b7c1d07b45c0b5a0b5fa4}
```
```
FLAG{b9683a71c852b8cc7909f343e405399f}
```
```
FLAG{e8269bda14963f83299ee50a984a254a}
```

- `7075328c…` = firma en base64 tal cual ← **probar primero**
- `09016749…` = bytes crudos (128 B)
- `b9683a71…` = hex minúsculas
- `e8269bda…` = hex MAYÚSCULAS

---

## 3️⃣ LLAVE PÚBLICA (comunicado, 1024-bit)

```
FLAG{4e2aa20d495a58ec6a206ca38e1b7ad2}
```
```
FLAG{6f69e7f3bcf733725f23fd0dcc20d2a9}
```
```
FLAG{3c6490ec3f7192215c93a9ab4890e684}
```
```
FLAG{4af0e1ae10380d3615c21cd79696ae43}
```

- `4e2aa20d…` = archivo `.pem` tal cual ← **probar primero**
- `6f69e7f3…` = PEM + salto final
- `3c6490ec…` = base64 del cuerpo
- `4af0e1ae…` = DER (base64 decodificado)
- ❌ `b4445da0af8ddb3bb2e0b5f2ced0e819` (PEM strip) — **ya falló, no reintentar**

---

## Primeros 3 intentos (los más probables)

```
FLAG{e5f6560b9d5685dde1679a11e3a713e7}
FLAG{7075328c50ca3b783c356963caedb439}
FLAG{4e2aa20d495a58ec6a206ca38e1b7ad2}
```

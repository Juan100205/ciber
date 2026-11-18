# Reto 21 — "Un Vigenere fácil" (CRYPTO · 95 pts)

**Flag:** `FLAG{6c4ac552216760b66573a17d0ffaae3f}` ✅ (aceptado)

---

## Enunciado
> Este es el Vigenere más fácil que van a poder hacer en este CTF:
> `vybowszcewnyvybcsdkwodmyxcomdodeb...` (bloque largo de ~5.7k letras minúsculas)

## Cómo llegamos a la solución

### 1. Reconocer que NO es un Vigenère real
El título dice "el Vigenere **más fácil**". Un Vigenère con clave de **una sola letra**
es matemáticamente idéntico a un **cifrado César** (desplazamiento constante).
El texto cifrado es todo minúsculas, sin espacios ni puntuación → pista de cifrado por sustitución simple.

### 2. Deducir el desplazamiento
Se asume que el texto plano empieza con el clásico relleno `lorem ipsum`.
Comparando las primeras letras:

```
cifrado : v  y  b  o  w   s  z  c  e  w
plano   : l  o  r  e  m   i  p  s  u  m
          └── v(21) − l(11) = 10 ──┘
```

El desplazamiento es **10** y es constante en todo el texto (se verificó que el
bloque final —que difiere del resto— también descifra correctamente con shift 10,
confirmando clave de 1 letra).

> Clave Vigenère equivalente: **`K`** (convención estándar A=0, la fila `A` = sin
> desplazamiento → fila `K` = +10). La clave `j` (convención A=1) fue un intento
> fallido antes de identificar la convención correcta.

### 3. Descifrar
Restando 10 a cada letra (mod 26) se obtiene **"lorem ipsum" repetido ~15 veces**
y un párrafo final distinto ("pellentesque habitant morbi tristique... porta gravida").
Todo es **texto de relleno estándar** — no hay mensaje oculto; el contenido es decoy.

```
loremipsumdolorsitametconsecteturadipiscingelitsed...
...donecsedodioduinonportagravida   (5692 chars en total)
```

### 4. Construir el flag
El CTF usa la convención **`FLAG{ md5(respuesta) }`** (igual que el reto 4 de ROT13,
donde se hace MD5 del mensaje decodificado, no de la clave).
La *respuesta* es el **texto descifrado completo**, en minúsculas y sin espacios:

```
md5( "loremipsum...portagravida" )  = 6c4ac552216760b66573a17d0ffaae3f
```

→ **`FLAG{6c4ac552216760b66573a17d0ffaae3f}`**

## Reproducir
```bash
python solve.py descripcion.txt
```

## Lección
"Vigenère fácil" = clave de 1 letra = César. El relleno (lorem ipsum) es decoy:
lo que importa es demostrar el descifrado. El flag es el MD5 del texto plano completo.

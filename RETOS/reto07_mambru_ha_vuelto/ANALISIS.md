# Reto 07 - Mambrú ha vuelto (CRYPTO, 200 pts) - PENDIENTE

## Procedimiento verificado
1. El reto entrega un bloque Base64 de 8296 chars.
2. Se decodifica Base64 **5 veces** (tamaños: 6222 -> 4666 -> 3499 -> 2624 -> 1968).
3. El resultado (1968 chars) se parte en dos:
   - Primeros 344 chars Base64  -> cifrado RSA de 256 bytes (rsa.bin)
   - Resto (1624 chars) Base64  -> clave privada RSA-2048 en DER (private.der)
4. Descifrado RSA correcto: **OAEP, hash SHA-256, MGF1 con SHA-1**.
   Comando:
   openssl pkeyutl -decrypt -inkey private.der -keyform DER -in rsa.bin \
     -pkeyopt rsa_padding_mode:oaep -pkeyopt rsa_oaep_md:sha256 -pkeyopt rsa_mgf1_md:sha1
5. Resultado (43 bytes): https://www.youtube.com/watch?v=aNCCuzYbyOx

## Hallazgo clave
- El ID "aNCCuzYbyOx" NO es un ID valido de YouTube (termina en 'x', caracter
  prohibido en la posicion final). noembed y el oEmbed oficial devuelven 400.
  No hay snapshot en Wayback. => Video inexistente a proposito.

## Candidatos de flag
- MD5("aNCCuzYbyOx")  = e1d1580a48736bf00d966c1b063910a1   <-- probar
- MD5(URL completa)   = ec319b9e1218c0e00ed9633df8b09185   (RECHAZADO)

## Estado: sin confirmar. Retomar o pedir pista al profesor sobre el formato.

## Update: video de practica (cmJOvFKNeFA) descargado
- Archivo: "Su bella voz y sus hermosas melodias, han conmovido por generaciones.mp4"
- El MP4 NO contiene texto/FLAG/metadatos/subtitulos legibles en bytes.
- La respuesta del reto de practica esta en el CONTENIDO VISUAL del video.
- El video del reto REAL (aNCCuzYbyOx) tiene ID invalido (termina en 'x') => nunca
  existio en YouTube. Sin ese contenido, no hay forma de derivar la palabra-respuesta.
- ACCION: abrir el mp4 de practica en VLC para ver el patron de respuesta, y
  confirmar con el profesor el formato/validez del video del reto real.

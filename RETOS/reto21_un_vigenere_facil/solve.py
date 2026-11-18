#!/usr/bin/env python3
"""
Reto 21 - "Un Vigenere facil" (CRYPTO, 95 pts)
Solucion: el cifrado es un Vigenere de clave de UNA sola letra = Cesar
con desplazamiento 10. El texto plano es "lorem ipsum" repetido.
El flag del CTF = FLAG{ md5(respuesta) }, donde la respuesta es el
TEXTO DESCIFRADO COMPLETO (minusculas, sin espacios).

Uso:  python solve.py descripcion.txt
"""
import sys, hashlib


def decrypt_caesar(text: str, shift: int) -> str:
    out = []
    for c in text:
        if c.isalpha():
            out.append(chr((ord(c) - 97 - shift) % 26 + 97))
        else:
            out.append(c)
    return "".join(out)


def main() -> None:
    path = sys.argv[1] if len(sys.argv) > 1 else "descripcion.txt"
    with open(path, encoding="utf-8") as fh:
        # el cuerpo cifrado es la linea larga (>200 chars) de minusculas
        body = next(l.strip() for l in fh if len(l.strip()) > 200)

    # El desplazamiento se deduce porque "vybow" -> "lorem":
    #   v(21) - l(11) = 10  =>  shift = 10
    shift = 10
    plain = decrypt_caesar(body, shift)

    md5 = hashlib.md5(plain.encode()).hexdigest()
    print(f"[+] shift detectado : {shift} (clave Vigenere de 1 letra)")
    print(f"[+] longitud texto  : {len(plain)} chars")
    print(f"[+] inicio          : {plain[:60]}...")
    print(f"[+] final           : ...{plain[-60:]}")
    print(f"[+] md5(respuesta)  : {md5}")
    print(f"[+] FLAG            : FLAG{{{md5}}}")


if __name__ == "__main__":
    main()

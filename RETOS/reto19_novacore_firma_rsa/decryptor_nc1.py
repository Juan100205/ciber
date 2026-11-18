#!/usr/bin/env python3
"""
Reto 19 - NovaCore. Descifrador del esquema "NC1" del bundle JS + solver de acertijos.
Reversa del cifrado (index-DI3u337G.js):
  keystream[bloque r] = SHA256(f"{clave}|{r}")  (32 bytes)
  plano = base64decode(blob) XOR keystream ; debe empezar con "NC1:" -> quitar 4 bytes
Uso:
  1) curl -s https://novacore-seven.vercel.app/assets/index-DI3u337G.js -o nc.js
  2) python decryptor_nc1.py nc.js
"""
import re, sys, hashlib, base64, unicodedata

def dr(e):  return hashlib.sha256(e.encode()).hexdigest()
def fr(e, t): return dr(f"novacore|{t}|{e}")
def pr(e):  return dr(f"comprobar|{e}")
def mr(e):
    e = unicodedata.normalize("NFD", e)
    e = "".join(c for c in e if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]", "", e.lower())
def hr(e):  return pr(fr(mr(e), "acertijo"))

def keystream(pw, n):
    out = bytearray(); r = 0
    while len(out) < n:
        out += hashlib.sha256(f"{pw}|{r}".encode()).digest(); r += 1
    return bytes(out[:n])

def nc1_decrypt(b64, pw):
    """Descifra un blob NC1. Devuelve el texto (sin 'NC1:') o None si la clave no sirve."""
    try:
        data = base64.b64decode(b64)
    except Exception:
        return None
    pt = bytes(a ^ b for a, b in zip(data, keystream(pw, len(data))))
    try:
        s = pt.decode("utf-8")
    except UnicodeDecodeError:
        return None
    return s[4:] if s.startswith("NC1:") else None

RESPUESTAS = ["simetrico", "hexadecimal", "asimetrico", "phishing", "troyano",
              "vectordeinicializacion", "iv", "publica"]

def solve_acertijos(js):
    objs = re.findall(
        r'"([a-zA-Z0-9_\-]+)":\{question:`([^`]+)`,hint:`([^`]*)`,labels:\{([^}]+)\}', js)
    print(f"[+] {len(objs)} acertijos encontrados\n")
    for rid, q, hint, lab in objs:
        labels = dict(re.findall(r'"?([0-9a-f]{64})"?:`([^`]+)`', lab))
        for a in RESPUESTAS:
            k = hr(a)
            if k in labels:
                pt = nc1_decrypt(labels[k], fr(mr(a), f"sello|{rid}"))
                if pt:
                    print(f"  [{rid}] resp='{a}' -> {pt}")
                break

if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "nc.js"
    js = open(path, encoding="utf-8", errors="ignore").read()
    solve_acertijos(js)

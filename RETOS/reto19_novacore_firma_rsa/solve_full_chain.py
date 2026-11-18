#!/usr/bin/env python3
"""
Reto 19 - NovaCore. Solver END-TO-END de toda la cadena.
Reproduce: login -> consola -> llavero -> DES -> tabla oculta -> codigo -> ee -> mensaje+firma.

Requisitos:  pip install pycryptodome
Uso:
  1) curl -s https://novacore-seven.vercel.app/assets/index-DI3u337G.js -o nc.js
  2) python solve_full_chain.py nc.js
"""
import re, sys, hashlib, base64, unicodedata
from Crypto.Cipher import DES

# ---- primitivas del bundle ----
def dr(e):   return hashlib.sha256(e.encode()).hexdigest()
def fr(e, t): return dr(f"novacore|{t}|{e}")
def mr(e):
    e = unicodedata.normalize("NFD", e)
    e = "".join(c for c in e if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]", "", e.lower())

def keystream(pw, n):
    out = bytearray(); r = 0
    while len(out) < n:
        out += hashlib.sha256(f"{pw}|{r}".encode()).digest(); r += 1
    return bytes(out[:n])

def nc1(b64, pw):
    """Descifra blob NC1 -> bytes (sin 'NC1:') o None."""
    try:
        data = base64.b64decode(b64)
    except Exception:
        return None
    pt = bytes(a ^ b for a, b in zip(data, keystream(pw, len(data))))
    return pt[4:] if pt[:4] == b"NC1:" else None

def des_cbc(hex_ct, key_hex, iv_hex):
    pt = DES.new(bytes.fromhex(key_hex), DES.MODE_CBC, bytes.fromhex(iv_hex)).decrypt(bytes.fromhex(hex_ct))
    return pt[:-pt[-1]] if 1 <= pt[-1] <= 8 else pt

def main():
    js = open(sys.argv[1] if len(sys.argv) > 1 else "nc.js", encoding="utf-8", errors="ignore").read()
    grab = lambda rx: re.search(rx, js).group(1)

    # 1) credenciales (ya crackeadas vs sus verificadores Kn / 897c68a3 / correo-hash)
    acct    = dr("novacore|ingreso|nopassword")     # login: ramirezseto@novacore.com / nopassword
    console = dr("novacore|mysql|Trebol2025")        # consola: tesoreria / Trebol2025
    KEY_DES, IV_DES = "133457799BBCDFF1", "F4DBAE5A65F00546"

    # 2) tabla oculta CAJON_PRIVADO (blob Xn, llave de consola) -> mensaje_des (DES) -> codigo
    import json
    xn = json.loads(nc1(grab(r'Xn=`([^`]+)`'), console).decode())
    row = next(r for r in xn["rows"] if r[0] == "mensaje_des")
    mensaje_des_hex = row[xn["columns"].index("contenido")]
    codigo = des_cbc(mensaje_des_hex, KEY_DES, IV_DES).decode()
    print("[+] codigo de custodia :", codigo)

    # 3) clave maestra de la boveda
    ee = dr(f"novacore|boveda|{mr(codigo)}")
    assert dr("comprobar|" + ee) == "d2b1d7d598c6c79e3ebe04eebaccb3c475f4471932eec46615793d7541bfe408"
    print("[+] ee valida contra qn: OK")

    # 4) artefactos
    msg = nc1(grab(r'message\s*:\s*\{[^}]*sealedContent:`([^`]+)`'), ee)
    sig = nc1(grab(r'signature\s*:\s*\{[^}]*sealedContent:`([^`]+)`'), ee).decode()
    print("\n=== MENSAJE ORIGINAL ===\n" + msg.decode())
    print("=== MENSAJE CIFRADO (firma b64) ===\n" + sig)

    md5 = lambda b: hashlib.md5(b if isinstance(b, bytes) else b.encode()).hexdigest()
    print("\n[flags md5] mensaje(con \\n):", md5(msg), "| sin \\n:", md5(msg.rstrip(b"\n")))
    print("[flags md5] firma b64:", md5(sig), "| bytes:", md5(base64.b64decode(sig)))

if __name__ == "__main__":
    main()

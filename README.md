# CTF Ciberseguridad 2026-2

Repositorio de trabajo del CTF: enunciados, archivos entregados, soluciones, scripts e informe.

- **Documentación técnica completa:** [`RETOS/DOCUMENTACION_COMPLETA.md`](RETOS/DOCUMENTACION_COMPLETA.md)
- **Informe:** [`RETOS/Informe_CTF.pdf`](RETOS/Informe_CTF.pdf) · [`RETOS/Informe_CTF.html`](RETOS/Informe_CTF.html)
- **Bitácora de agentes:** [`agentes-documentacion/`](agentes-documentacion/)
- **Reglas:** `Reglas de Juego CTF 2026-2.pdf`

Convención de banderas: `FLAG{ md5(respuesta) }`.

## Estado de los retos

| # | Reto | Categoría | Pts | Estado | Carpeta |
|---|------|-----------|-----|--------|---------|
| 2 | Entrega el equipo | Forense (FAT/carving) | 385 | ✅ Resuelto | [reto02](RETOS/reto02_entrega_el_equipo_USB) |
| 3 | Resolución de nombres | DNS | 400 | ⛔ Falta el `.pcap` | [reto03](RETOS/reto03_resolucion_de_nombres_DNS) |
| 4 | Transformaciones | Crypto (Base64/ROT13) | — | ✅ Resuelto | [reto04](RETOS/reto04_transformaciones_base64) |
| 5 | Demasiado fácil | Crypto (JWT) | — | ✅ Resuelto | [reto05](RETOS/reto05_jwt_demasiado_facil) |
| 6 | Mira bien (QR) | Misc | — | ✅ Resuelto | [reto06](RETOS/reto06_qr_url) |
| 7 | Mambrú ha vuelto | Crypto (RSA-OAEP) | 200 | ⏸ Bloqueado (URL inválida) | [reto07](RETOS/reto07_mambru_ha_vuelto) |
| 8 | Vigenere | Crypto | 300 | 🔄 Pendiente | [reto08](RETOS/reto08_vigenere) |
| 9 | El glorioso Informanchester | OSINT | 130 | 🔄 En proceso | [reto09](RETOS/reto09_osint_informanchester) |
| 10 | Encuentra las diferencias | Misc / estego | 130 | ✅ Resuelto | [reto10](RETOS/reto10_encuentra_las_diferencias) |
| 11 | Una melodía con mensaje | Misc (partitura) | 195 | ✅ Resuelto | [reto11](RETOS/reto11_melodia_con_mensaje) |
| 12 | Nueva sede de Antipinzas Group | OSINT | 200 | 🔄 Pendiente | [reto12](RETOS/reto12_osint_antipinzas) |
| 13 | A simple vista | Forense (espectrograma) | 200 | ✅ Resuelto | [reto13](RETOS/reto13_a_simple_vista_audio) |
| 14 | Final Copa Sudamericana | Crypto (SHA-256) | 500 | 🔄 En proceso | [reto14](RETOS/reto14_final_copa_sudamericana_hash) |
| 15 | Health Checker | Web (SSRF) | 600 | ✅ Resuelto | [reto15](RETOS/reto15_health_checker_ssrf) |
| 16 | Como te gusta | Web (Pickle) | 600 | ✅ Resuelto | [reto16](RETOS/reto16_como_te_gusta_pickle) |
| 17 | Mucho gusto | Web (SSTI Jinja2) | 600 | ✅ Resuelto | [reto17](RETOS/reto17_mucho_gusto_ssti) |
| 18 | Morat | Crypto (SHA-256) | 880 | 🔄 Pendiente | [reto18](RETOS/reto18_morat_hash) |
| 19 | NovaCore - Mensaje Original | Crypto (firma RSA) + Web | 970 | 🔄 Cadena resuelta, falta formato del flag | [reto19](RETOS/reto19_novacore_firma_rsa) |
| 20 | Gorillaz | Crypto (SHA-256) | 1500 | 🔄 Pendiente | [reto20](RETOS/reto20_gorillaz_hash) |
| 21 | Un Vigenere fácil | Crypto | 95 | ✅ Resuelto | [reto21](RETOS/reto21_un_vigenere_facil) |

Banderas aceptadas: ver la sección "Banderas finales" de `RETOS/DOCUMENTACION_COMPLETA.md`.

## Estructura

```
RETOS/                  una carpeta por reto (descripcion.txt + evidencias + solución)
RETOS/_scripts/         scripts propios (diff de PNG, espectrograma, lectura de partitura)
agentes-documentacion/  bitácora de las sesiones de trabajo con agentes IA
*.txt / *.enc / *.jpg…  archivos originales entregados por la plataforma (raíz)
```

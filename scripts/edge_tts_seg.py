"""Synthèse d'un segment avec les voix neuronales Microsoft Edge (gratuites, sans clé).

Usage : python3 scripts/edge_tts_seg.py <voice> <rate> <pitch> <out.mp3> <texte>
Écrit le MP3 et imprime sur stdout un JSON : [{"text", "start", "end"}] (secondes).
"""
import asyncio
import json
import os
import ssl
import sys

import certifi
import edge_tts
import edge_tts.communicate as _com

# Magasin de certificats système + certifi (+ SSL_CERT_FILE si défini) — vérification TLS conservée.
_ctx = ssl.create_default_context()
_ctx.load_verify_locations(certifi.where())
if os.environ.get("SSL_CERT_FILE") and os.path.exists(os.environ["SSL_CERT_FILE"]):
    _ctx.load_verify_locations(os.environ["SSL_CERT_FILE"])
_com._SSL_CTX = _ctx
PROXY = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy") or None


async def main() -> None:
    voice, rate, pitch, out, text = sys.argv[1:6]
    com = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary", proxy=PROXY)
    words = []
    with open(out, "wb") as f:
        async for chunk in com.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / 1e7
                words.append({"text": chunk["text"], "start": round(start, 3), "end": round(start + chunk["duration"] / 1e7, 3)})
    print(json.dumps(words, ensure_ascii=False))


asyncio.run(main())

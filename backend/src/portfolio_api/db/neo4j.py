"""Connexion Neo4j via le driver officiel."""

from __future__ import annotations

import socket
import struct
from neo4j import AsyncGraphDatabase, AsyncDriver

from portfolio_api.core.config import get_settings


def _resolve_via_dns(host: str) -> str:
    """Résout un nom de domaine en IPv4 via 8.8.8.8 (contourne getaddrinfo sur Vercel)."""
    # Si c'est déjà une IPv4, la retourner directement
    try:
        socket.inet_aton(host)
        return host
    except OSError:
        pass

    # Construction d'une requête DNS A standard (ID=0x1234, RD=1, 1 question)
    qname = b"".join(bytes([len(p)]) + p.encode("ascii") for p in host.split(".")) + b"\x00"
    packet = b"\x12\x34\x01\x00\x00\x01\x00\x00\x00\x00\x00\x00" + qname + b"\x00\x01\x00\x01"

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.settimeout(3.0)
    try:
        sock.sendto(packet, ("8.8.8.8", 53))
        data, _ = sock.recvfrom(512)
    finally:
        sock.close()

    # Parcours de la section réponse pour extraire le premier enregistrement A (type 1, len 4)
    idx = 12 + len(qname) + 4
    while idx + 12 <= len(data):
        if data[idx] & 0xC0 == 0xC0:
            idx += 2
        else:
            while idx < len(data) and data[idx] != 0:
                idx += data[idx] + 1
            idx += 1
        rtype, rclass, _ttl, rdlength = struct.unpack("!HHIH", data[idx : idx + 10])
        idx += 10
        if rtype == 1 and rclass == 1 and rdlength == 4:
            return socket.inet_ntoa(data[idx : idx + 4])
        idx += rdlength

    raise OSError(f"Impossible de résoudre {host} via 8.8.8.8")


def _sync_resolver(address):
    host, port = address
    ip = _resolve_via_dns(host)
    return [(ip, port)]


_driver: AsyncDriver | None = None


def get_neo4j_driver() -> AsyncDriver:
    """Retourne le driver Neo4j (singleton)."""
    global _driver
    if _driver is None:
        settings = get_settings()
        _driver = AsyncGraphDatabase.driver(
            settings.neo4j_uri,
            auth=(settings.neo4j_user, settings.neo4j_password),
            resolver=_sync_resolver,
        )
    return _driver


async def close_neo4j() -> None:
    global _driver
    if _driver is not None:
        await _driver.close()
        _driver = None
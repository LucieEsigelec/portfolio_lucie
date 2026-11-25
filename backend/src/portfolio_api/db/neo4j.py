"""Connexion Neo4j via le driver officiel."""

from __future__ import annotations

import json
import socket
import urllib.request
from neo4j import AsyncGraphDatabase, AsyncDriver

from portfolio_api.core.config import get_settings


def _resolve_via_doh(host: str) -> str:
    """Résout un nom de domaine en IPv4 via DNS-over-HTTPS (suivi automatique des CNAME)."""
    try:
        socket.inet_aton(host)
        return host
    except OSError:
        pass

    url = f"https://dns.google/resolve?name={host}&type=A"
    with urllib.request.urlopen(url, timeout=4.0) as resp:
        payload = json.loads(resp.read().decode("utf-8"))

    for ans in payload.get("Answer", []):
        if ans.get("type") == 1:  # Enregistrement A (IPv4)
            return ans["data"]

    raise OSError(f"Aucun enregistrement A trouvé pour {host} (status={payload.get('Status')})")


def _sync_resolver(address):
    host, port = address
    ip = _resolve_via_doh(host)
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
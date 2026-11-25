"""Connexion Neo4j via le driver officiel."""

from __future__ import annotations

from neo4j import AsyncGraphDatabase, AsyncDriver

from portfolio_api.core.config import get_settings

import socket
from neo4j import AsyncGraphDatabase

def _sync_resolver(address):
    host, port = address
    infos = socket.getaddrinfo(host, port, type=socket.SOCK_STREAM)
    return [(info[4][0], info[4][1]) for info in infos]

_driver: AsyncDriver | None = None


def get_neo4j_driver() -> AsyncDriver:
    """Retourne le driver Neo4j (singleton). À compléter : créer le driver avec AsyncGraphDatabase.driver(uri, auth=(user, password))."""
    global _driver
    if _driver is None:
        settings = get_settings()
        driver = AsyncGraphDatabase.driver(
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

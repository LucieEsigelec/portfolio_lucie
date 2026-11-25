"""Connexion Neo4j via le driver officiel."""

from __future__ import annotations

import logging
from urllib.parse import urlparse

from neo4j import AsyncGraphDatabase, AsyncDriver

from portfolio_api.core.config import get_settings

logger = logging.getLogger(__name__)

_driver: AsyncDriver | None = None


def _direct_uri(uri: str) -> str:
    """Convertit neo4j+s:// en bolt+s:// (connexion directe, sans table de routage)."""
    if uri.startswith("neo4j+s://"):
        return "bolt+s://" + uri[len("neo4j+s://"):]
    if uri.startswith("neo4j+ssc://"):
        return "bolt+ssc://" + uri[len("neo4j+ssc://"):]
    if uri.startswith("neo4j://"):
        return "bolt://" + uri[len("neo4j://"):]
    return uri


def get_neo4j_driver() -> AsyncDriver:
    """Retourne le driver Neo4j (singleton)."""
    global _driver

    if _driver is None:
        settings = get_settings()
        uri = _direct_uri(settings.neo4j_uri)

        parsed = urlparse(uri)
        logger.info("Neo4j: connexion à %s://%s", parsed.scheme, parsed.hostname)

        _driver = AsyncGraphDatabase.driver(
            uri,
            auth=(settings.neo4j_user, settings.neo4j_password),
            connection_timeout=10,
            max_connection_lifetime=300,
        )

    return _driver


async def close_neo4j() -> None:
    global _driver
    if _driver is not None:
        await _driver.close()
        _driver = None
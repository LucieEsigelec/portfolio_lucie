from fastapi import APIRouter, Depends, Query

from portfolio_api.db.mongo import get_mongo_db
from portfolio_api.db.neo4j import get_neo4j_driver
from portfolio_api.repositories.projet_repo import ProjetRepository
from portfolio_api.services.projet_service import ProjetService

router = APIRouter(tags=["Projets"])


def get_projet_service() -> ProjetService:
    """Construit le service avec ses accès à MongoDB et Neo4j."""
    repo = ProjetRepository(mongo_db=get_mongo_db(), neo4j_driver=get_neo4j_driver())
    return ProjetService(repo=repo)


@router.get("/projets")
async def read_projets(
    competence: str | None = Query(default=None, description="Filtrer par slug de compétence"),
    service: ProjetService = Depends(get_projet_service),
):
    """Retourne les projets, éventuellement filtrés par slug de compétence."""
    return await service.list_projets(competence)


@router.get("/projets/{slug}")
async def read_projet(slug: str, service: ProjetService = Depends(get_projet_service)):
    """Retourne le détail complet d'un projet identifié par son slug."""
    return await service.get_projet_detail(slug)


@router.get("/graph/projets/{slug}/similaires")
async def read_projets_similaires(
    slug: str,
    limit: int = Query(default=5, ge=1, le=100, description="Nombre maximum de projets similaires"),
    service: ProjetService = Depends(get_projet_service),
):
    """Retourne les projets similaires calculés dans le graphe Neo4j."""
    return await service.get_projets_similaires(slug, limit)

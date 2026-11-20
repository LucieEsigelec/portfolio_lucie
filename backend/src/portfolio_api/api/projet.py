from fastapi import APIRouter, Depends, Query, status

from portfolio_api.db.mongo import get_mongo_db
from portfolio_api.db.neo4j import get_neo4j_driver
from portfolio_api.repositories.projet_repo import ProjetRepository
from portfolio_api.models import (
    Projet,
    ProjetDetail,
    ProjetSimilaire,
    ProjetUpdate,
    StatCompetenceProjet,
)
from portfolio_api.services.projet_service import ProjetService

router = APIRouter(tags=["Projets"])


def get_projet_service() -> ProjetService:
    """Construit le service avec ses accès à MongoDB et Neo4j."""
    repo = ProjetRepository(mongo_db=get_mongo_db(), neo4j_driver=get_neo4j_driver())
    return ProjetService(repo=repo)


# ── Lecture & Agrégations ────────────────────────────────────────
@router.get("/projets", response_model=list[Projet])
async def read_projets(
    competence: str | None = Query(default=None, description="Filtrer par slug de compétence"),
    service: ProjetService = Depends(get_projet_service),
):
    """Retourne les projets, éventuellement filtrés par slug de compétence."""
    return await service.list_projets(competence)


@router.get("/projets/stats/competences", response_model=list[StatCompetenceProjet])
async def read_projets_stats_competences(
    service: ProjetService = Depends(get_projet_service),
):
    """Agrégation MongoDB : compte le nombre de projets par compétence."""
    return await service.get_stats_competences()


@router.get("/projets/{slug}", response_model=ProjetDetail)
async def read_projet(slug: str, service: ProjetService = Depends(get_projet_service)):
    """Retourne le détail complet d'un projet (MongoDB + Neo4j) identifié par son slug."""
    return await service.get_projet_detail(slug)


@router.get("/graph/projets/{slug}/similaires", response_model=list[ProjetSimilaire])
async def read_projets_similaires(
    slug: str,
    limit: int = Query(default=5, ge=1, le=100, description="Nombre maximum de projets similaires"),
    service: ProjetService = Depends(get_projet_service),
):
    """Retourne les projets similaires calculés dans le graphe Neo4j."""
    return await service.get_projets_similaires(slug, limit)


# ── Écriture CRUD synchronisée (MongoDB + Neo4j) ─────────────────
@router.post("/projets", response_model=Projet, status_code=status.HTTP_201_CREATED)
async def create_projet(
    projet: Projet,
    service: ProjetService = Depends(get_projet_service),
):
    """Crée un projet dans MongoDB et synchronise son nœud et ses relations dans Neo4j."""
    return await service.create_projet(projet.model_dump())


@router.patch("/projets/{slug}", response_model=Projet)
async def update_projet(
    slug: str,
    updates: ProjetUpdate,
    service: ProjetService = Depends(get_projet_service),
):
    """Met à jour partiellement un projet dans MongoDB et synchronise Neo4j."""
    return await service.update_projet(slug, updates.model_dump(exclude_unset=True))


@router.delete("/projets/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_projet(
    slug: str,
    service: ProjetService = Depends(get_projet_service),
):
    """Supprime un projet dans MongoDB et détache son nœud dans Neo4j."""
    await service.delete_projet(slug)
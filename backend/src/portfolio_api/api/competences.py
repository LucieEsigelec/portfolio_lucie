from fastapi import APIRouter, Depends, Query, status

from portfolio_api.db.mongo import get_mongo_db
from portfolio_api.db.neo4j import get_neo4j_driver
from portfolio_api.repositories.competences_repo import CompetenceRepository
from portfolio_api.models import (
    Competence,
    CompetenceDetail,
    CompetenceUpdate,
    StatCategorieCompetence,
)
from portfolio_api.services.competences_service import CompetenceService

router = APIRouter(prefix="/competences", tags=["Compétences"])


def get_competence_service() -> CompetenceService:
    """Construit le service avec ses accès à MongoDB et Neo4j."""
    repo = CompetenceRepository(mongo_db=get_mongo_db(), neo4j_driver=get_neo4j_driver())
    return CompetenceService(repo=repo)


# ── Lecture & Agrégations ────────────────────────────────────────
@router.get("", response_model=list[Competence])
async def read_competences(
    service: CompetenceService = Depends(get_competence_service),
):
    """Retourne toutes les compétences triées par ordre d'affichage."""
    return await service.list_competences()


@router.get("/stats/categories", response_model=list[StatCategorieCompetence])
async def read_competences_stats_categories(
    service: CompetenceService = Depends(get_competence_service),
):
    """Agrégation MongoDB : regroupe et compte les compétences par catégorie."""
    return await service.get_stats_categories()


@router.get("/stats/top")
async def read_top_competences(
    limit: int = Query(default=10, ge=1, le=50, description="Nombre de compétences à afficher"),
    service: CompetenceService = Depends(get_competence_service),
):
    """Requête Cypher Neo4j : retourne les compétences les plus utilisées dans tout le portfolio."""
    return await service.get_top_competences(limit=limit)


@router.get("/{slug}", response_model=CompetenceDetail)
async def read_competence(
    slug: str,
    service: CompetenceService = Depends(get_competence_service),
):
    """Retourne le détail d'une compétence enrichi avec ses usages (projets, expériences, formations)."""
    return await service.get_competence_detail(slug)


# ── Écriture CRUD synchronisée (MongoDB + Neo4j) ─────────────────
@router.post("", response_model=Competence, status_code=status.HTTP_201_CREATED)
async def create_competence(
    competence: Competence,
    service: CompetenceService = Depends(get_competence_service),
):
    """Crée une compétence dans MongoDB et synchronise son nœud dans Neo4j."""
    return await service.create_competence(competence.model_dump())


@router.patch("/{slug}", response_model=Competence)
async def update_competence(
    slug: str,
    updates: CompetenceUpdate,
    service: CompetenceService = Depends(get_competence_service),
):
    """Met à jour partiellement une compétence dans MongoDB et synchronise Neo4j."""
    return await service.update_competence(slug, updates.model_dump(exclude_unset=True))


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_competence(
    slug: str,
    service: CompetenceService = Depends(get_competence_service),
):
    """Supprime une compétence dans MongoDB et détache son nœud dans Neo4j."""
    await service.delete_competence(slug)
from fastapi import APIRouter, Depends
from portfolio_api.db.mongo import get_mongo_db
from portfolio_api.db.neo4j import get_neo4j_driver
from portfolio_api.models import Personne, PersonneDetail
from portfolio_api.repositories.personne_repo import PersonneRepository
from portfolio_api.services.personne_service import PersonneService

router = APIRouter(prefix="/personnes", tags=["Personnes"])


def get_personne_service() -> PersonneService:
    """Construit le service avec ses accès à MongoDB et Neo4j."""
    repo = PersonneRepository(mongo_db=get_mongo_db(), neo4j_driver=get_neo4j_driver())
    return PersonneService(repo=repo)


@router.get("", response_model=list[Personne])
async def read_personnes(service: PersonneService = Depends(get_personne_service)):
    """Retourne la liste de toutes les personnes enregistrées dans MongoDB."""
    return await service.list_personnes()


@router.get("/{slug}", response_model=PersonneDetail)
async def read_personne(slug: str, service: PersonneService = Depends(get_personne_service)):
    """Retourne le profil complet (MongoDB) enrichi des compétences déduites du graphe (Neo4j)."""
    return await service.get_personne_detail(slug)
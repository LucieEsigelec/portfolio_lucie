from fastapi import APIRouter, Depends
from portfolio_api.db.mongo import get_mongo_db
from portfolio_api.db.neo4j import get_neo4j_driver
from portfolio_api.models import Personne
from portfolio_api.repositories.personne_repo import PersonneRepository
from portfolio_api.services.personne_service import PersonneService

router = APIRouter(prefix="/personnes", tags=["Personnes"])


def get_personne_service() -> PersonneService:
    repo = PersonneRepository(mongo_db=get_mongo_db(), neo4j_driver=get_neo4j_driver())
    return PersonneService(repo=repo)


@router.get("/", response_model=list[Personne])
async def read_personnes(service: PersonneService = Depends(get_personne_service)):
    return await service.list_personnes()


@router.get("/{slug}")
async def read_personne(slug: str, service: PersonneService = Depends(get_personne_service)):
    return await service.get_personne_detail(slug)
from fastapi import APIRouter, Depends, HTTPException
from portfolio_api.db.mongo import get_mongo_db
from portfolio_api.db.neo4j import get_neo4j_driver
from portfolio_api.repositories.competences_repo import CompetenceRepository
from portfolio_api.services.competences_service import CompetenceService

router = APIRouter(prefix="/competences", tags=["Compétences"]) #regoupe les routes de l'API liées aux compétences sous le préfixe /competences et les étiquette avec le tag "Compétences" 


def get_competence_service() -> CompetenceService: #On déclare une fonction qui fabrique et retourne un objet de type
    repo = CompetenceRepository(mongo_db=get_mongo_db(), neo4j_driver=get_neo4j_driver()) #recupere la base de données MongoDB et le driver Neo4j pour créer un objet CompetenceRepository
    return CompetenceService(repo=repo) # retourne un objet CompetenceService qui utilise le CompetenceRepository pour accéder aux données des compétences et de leurs usages (projets et expériences qui les utilisent)


@router.get("/") #Répond aux requêtes GET sur /competences/
async def read_competences(service: CompetenceService = Depends(get_competence_service)): #on appelle get_competence_service pour obtenir un objet CompetenceService.
    return await service.list_competences() #recupere la liste de competences


@router.get("/{slug}") #Répond aux requêtes GET sur /competences/{slug} où {slug} est un paramètre de chemin représentant le slug d'une compétence.
async def read_competence(slug: str, service: CompetenceService = Depends(get_competence_service)):#on appelle get_competence_service pour obtenir un objet CompetenceService.
    competence = await service.get_competence_detail(slug) #recupere les détails de la compétence correspondant au slug donné
    if competence is None:
        raise HTTPException(status_code=404, detail="Compétence introuvable") 
    return competence
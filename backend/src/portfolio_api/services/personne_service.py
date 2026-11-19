from fastapi import HTTPException
from portfolio_api.models import Personne, Competence
from portfolio_api.repositories.personne_repo import PersonneRepository


class PersonneService:
    def __init__(self, repo: PersonneRepository):
        self.repo = repo

    async def list_personnes(self) -> list[Personne]:
        docs = await self.repo.get_all_mongo()
        # Chaque dictionnaire Mongo est validé et typé par Pydantic
        return [Personne(**doc) for doc in docs]

    async def get_personne_detail(self, slug: str) -> dict:
        doc = await self.repo.get_by_slug_mongo(slug)
        if not doc:
            raise HTTPException(status_code=404, detail=f"Personne '{slug}' introuvable")

        # 1. Validation du profil MongoDB avec ton modèle Pydantic
        personne = Personne(**doc)

        # 2. Enrichissement depuis Neo4j (compétences extraites de ses expériences/formations)
        raw_skills = await self.repo.get_skills_from_graph(slug)
        competences_graphe = [Competence(**s) for s in raw_skills]

        return {
            "profil": personne,
            "competences_graphe": competences_graphe,
        }
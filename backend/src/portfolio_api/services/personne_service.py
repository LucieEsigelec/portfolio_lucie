import asyncio
from fastapi import HTTPException
from portfolio_api.models import Competence, Personne
from portfolio_api.repositories.personne_repo import PersonneRepository


class PersonneService:
    def __init__(self, repo: PersonneRepository):
        self.repo = repo

    async def list_personnes(self) -> list[Personne]:
        docs = await self.repo.get_all_mongo()
        return [Personne(**doc) for doc in docs]

    async def get_personne_detail(self, slug: str) -> dict:
        # Exécution parallèle sur MongoDB et Neo4j
        doc, raw_skills = await asyncio.gather(
            self.repo.get_by_slug_mongo(slug),
            self.repo.get_skills_from_graph(slug),
        )

        if not doc:
            raise HTTPException(status_code=404, detail=f"Personne '{slug}' introuvable")

        personne = Personne(**doc)
        competences_graphe = [
            Competence(
                slug=s["slug"],
                nom=s["nom"],
                categorie=s.get("categorie") or "Autre",
            )
            for s in raw_skills
        ]

        return {
            "profil": personne,
            "competences_graphe": competences_graphe,
        }
from fastapi import HTTPException

from portfolio_api.repositories.projet_repo import ProjetRepository


class ProjetService:
    def __init__(self, repo: ProjetRepository):
        self.repo = repo

    async def list_projets(self, competence_slug: str | None = None) -> list[dict]:
        """Retourne les projets MongoDB, éventuellement filtrés par slug de compétence."""
        return await self.repo.get_all_mongo(competence_slug)

    async def get_projet_detail(self, slug: str) -> dict:
        """Retourne le détail complet d'un projet, ou une erreur 404 s'il n'existe pas."""
        projet = await self.repo.get_by_slug_mongo(slug)
        if projet is None:
            raise HTTPException(status_code=404, detail=f"Projet '{slug}' introuvable")
        return projet

    async def get_projets_similaires(self, slug: str, limit: int = 5) -> list[dict]:
        """Retourne les projets similaires trouvés dans Neo4j, ou une erreur 404."""
        # Vérifie d'abord dans MongoDB que le projet demandé existe.
        projet = await self.repo.get_by_slug_mongo(slug)
        if projet is None:
            raise HTTPException(status_code=404, detail=f"Projet '{slug}' introuvable")

        return await self.repo.get_similaires_graph(slug, limit)

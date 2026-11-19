import asyncio
from typing import Any
from fastapi import HTTPException

from portfolio_api.repositories.competences_repo import CompetenceRepository


class CompetenceService:
    def __init__(self, repo: CompetenceRepository):
        self.repo = repo

    # ── Lecture & Agrégations ────────────────────────────────────
    async def list_competences(self) -> list[dict]:
        """Retourne toutes les compétences triées par ordre d'affichage."""
        return await self.repo.get_all_mongo()

    async def get_competence_detail(self, slug: str) -> dict:
        """
        Assemble la fiche complète d'une compétence (MongoDB + usages Neo4j en parallèle),
        ou lève une erreur 404 si elle est introuvable.
        """
        competence, usages = await asyncio.gather(
            self.repo.get_by_slug_mongo(slug),
            self.repo.get_usages_graph(slug),
        )

        if competence is None:
            raise HTTPException(status_code=404, detail=f"Compétence '{slug}' introuvable")

        competence["usages"] = usages
        return competence

    async def get_stats_categories(self) -> list[dict]:
        """Retourne les compétences regroupées par catégorie (agrégation MQL MongoDB)."""
        return await self.repo.get_stats_par_categorie_mongo()

    async def get_top_competences(self, limit: int = 10) -> list[dict]:
        """Retourne les compétences les plus utilisées dans le graphe (requête Cypher)."""
        return await self.repo.get_top_competences_graph(limit=limit)

    # ── Écriture synchronisée (MongoDB + Neo4j) ──────────────────
    async def create_competence(self, competence_data: dict[str, Any]) -> dict[str, Any]:
        """
        Règle métier : empêche les doublons de slug (409) et synchronise
        la compétence dans MongoDB ET dans le graphe Neo4j.
        """
        slug = competence_data["slug"]
        existant = await self.repo.get_by_slug_mongo(slug)
        if existant is not None:
            raise HTTPException(
                status_code=409,
                detail=f"Une compétence avec le slug '{slug}' existe déjà.",
            )

        # 1. Insertion du document riche dans MongoDB
        created = await self.repo.create_mongo(competence_data)

        # 2. Création/mise à jour du nœud Competence dans Neo4j
        await self.repo.upsert_competence_graph(
            slug=slug,
            nom=competence_data["nom"],
            categorie=competence_data.get("categorie"),
        )
        return created

    async def update_competence(self, slug: str, updates: dict[str, Any]) -> dict[str, Any]:
        """Met à jour une compétence dans MongoDB et répercute sur le nœud Neo4j."""
        existant = await self.repo.get_by_slug_mongo(slug)
        if existant is None:
            raise HTTPException(status_code=404, detail=f"Compétence '{slug}' introuvable")

        clean_updates = {k: v for k, v in updates.items() if v is not None}
        if not clean_updates:
            return existant

        await self.repo.update_mongo(slug, clean_updates)

        competence_mise_a_jour = {**existant, **clean_updates}
        await self.repo.upsert_competence_graph(
            slug=slug,
            nom=competence_mise_a_jour["nom"],
            categorie=competence_mise_a_jour.get("categorie"),
        )
        return competence_mise_a_jour

    async def delete_competence(self, slug: str) -> None:
        """Supprime une compétence dans MongoDB et détache/supprime son nœud dans Neo4j."""
        deleted = await self.repo.delete_mongo(slug)
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Compétence '{slug}' introuvable")

        await self.repo.delete_competence_graph(slug)
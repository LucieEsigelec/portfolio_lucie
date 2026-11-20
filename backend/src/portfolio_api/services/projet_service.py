import asyncio
from typing import Any
from fastapi import HTTPException

from portfolio_api.repositories.projet_repo import ProjetRepository


class ProjetService:
    def __init__(self, repo: ProjetRepository):
        self.repo = repo

    # ── Lecture & Agrégations ────────────────────────────────────
    async def list_projets(self, competence_slug: str | None = None) -> list[dict]:
        """Retourne les projets MongoDB, éventuellement filtrés par slug de compétence."""
        return await self.repo.get_all_mongo(competence_slug)

    async def get_projet_detail(self, slug: str) -> dict:
        """
        Assemble la vue complète d'un projet (MongoDB + Neo4j en parallèle),
        ou lève une erreur 404 s'il n'existe pas.
        """
        projet, competences_graph, similaires = await asyncio.gather(
            self.repo.get_by_slug_mongo(slug),
            self.repo.get_competences_graph(slug),
            self.repo.get_similaires_graph(slug, limit=3),
        )

        if projet is None:
            raise HTTPException(status_code=404, detail=f"Projet '{slug}' introuvable")

        # Enrichissement polyglotte du document MongoDB avec les données du graphe Neo4j
        projet["competences_detaillees"] = competences_graph
        projet["projets_similaires"] = similaires
        return projet

    async def get_projets_similaires(self, slug: str, limit: int = 5) -> list[dict]:
        """Retourne les projets similaires trouvés dans Neo4j, ou une erreur 404."""
        projet = await self.repo.get_by_slug_mongo(slug)
        if projet is None:
            raise HTTPException(status_code=404, detail=f"Projet '{slug}' introuvable")

        return await self.repo.get_similaires_graph(slug, limit)

    async def get_stats_competences(self) -> list[dict]:
        """Retourne le classement des compétences les plus mobilisées sur les projets (agrégation MQL)."""
        return await self.repo.get_stats_par_competence_mongo()

    # ── Écriture synchronisée (MongoDB + Neo4j) ──────────────────
    async def create_projet(self, projet_data: dict[str, Any]) -> dict[str, Any]:
        """
        Règle métier : empêche les doublons de slug (409) et synchronise
        la création dans MongoDB ET dans le graphe Neo4j.
        """
        slug = projet_data["slug"]
        existant = await self.repo.get_by_slug_mongo(slug)
        if existant is not None:
            raise HTTPException(
                status_code=409,
                detail=f"Un projet avec le slug '{slug}' existe déjà.",
            )

        # 1. Stockage du document riche dans MongoDB
        created = await self.repo.create_mongo(projet_data)

        # 2. Création du nœud et de ses relations :UTILISE dans Neo4j
        annee = self._extraire_annee(projet_data.get("date_realisation"))
        await self.repo.upsert_projet_graph(
            slug=slug,
            titre=projet_data.get("titre", slug),
            annee=annee,
            skills_slugs=projet_data.get("skills_slugs", []),
        )
        return created

    async def update_projet(self, slug: str, updates: dict[str, Any]) -> dict[str, Any]:
        """Met à jour un projet dans MongoDB et répercute les changements sur Neo4j."""
        existant = await self.repo.get_by_slug_mongo(slug)
        if existant is None:
            raise HTTPException(status_code=404, detail=f"Projet '{slug}' introuvable")

        # Nettoyage des champs non fournis (None)
        clean_updates = {k: v for k, v in updates.items() if v is not None}
        if not clean_updates:
            return existant

        await self.repo.update_mongo(slug, clean_updates)

        # Fusion de l'ancien état et des modifications pour synchroniser Neo4j
        projet_mis_a_jour = {**existant, **clean_updates}
        annee = self._extraire_annee(projet_mis_a_jour.get("date_realisation"))
        await self.repo.upsert_projet_graph(
            slug=slug,
            titre=projet_mis_a_jour.get("titre", slug),
            annee=annee,
            skills_slugs=projet_mis_a_jour.get("skills_slugs", []),
        )
        return projet_mis_a_jour

    async def delete_projet(self, slug: str) -> None:
        """Supprime un projet dans MongoDB et détache/supprime son nœud dans Neo4j."""
        deleted = await self.repo.delete_mongo(slug)
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Projet '{slug}' introuvable")

        await self.repo.delete_projet_graph(slug)

    # ── Utilitaire interne métier ────────────────────────────────
    @staticmethod
    def _extraire_annee(date_val: Any) -> int:
        """Extrait proprement l'année (int) depuis '2026-05' ou 2026 pour le nœud Neo4j."""
        if isinstance(date_val, int):
            return date_val
        if isinstance(date_val, str) and len(date_val) >= 4 and date_val[:4].isdigit():
            return int(date_val[:4])
        return 2026
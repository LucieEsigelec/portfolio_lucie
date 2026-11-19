from neo4j import AsyncDriver
from pymongo.asynchronous.database import AsyncDatabase

from typing import Any
from neo4j import AsyncDriver
from pymongo.asynchronous.database import AsyncDatabase


class ProjetRepository:
    def __init__(self, mongo_db: AsyncDatabase, neo4j_driver: AsyncDriver):
        self.collection = mongo_db["projets"]  # Collection MongoDB avec les détails complets des projets
        self.neo4j = neo4j_driver  # Graphe Neo4j avec les relations entre projets et compétences

    # ── Requêtes MongoDB : Lecture & Agrégations ─────────────────
    async def get_all_mongo(self, competence_slug: str | None = None) -> list[dict]:
        """Retourne les projets, éventuellement filtrés par compétence, sans exposer l'identifiant MongoDB."""
        filtre = {"skills_slugs": competence_slug} if competence_slug is not None else {}
        cursor = self.collection.find(filtre, {"_id": 0}).sort("date_realisation", -1)
        return await cursor.to_list(length=None)

    async def get_by_slug_mongo(self, slug: str) -> dict | None:
        """Retourne le détail complet d'un projet (besoin R6), ou None s'il est introuvable."""
        return await self.collection.find_one({"slug": slug}, {"_id": 0})

    async def get_stats_par_competence_mongo(self) -> list[dict]:
        """Agrégation MQL : compte le nombre de projets associés à chaque compétence (skills_slugs)."""
        pipeline = [
            {"$unwind": "$skills_slugs"},
            {"$group": {"_id": "$skills_slugs", "nb_projets": {"$sum": 1}}},
            {"$project": {"_id": 0, "competence_slug": "$_id", "nb_projets": 1}},
            {"$sort": {"nb_projets": -1, "competence_slug": 1}},
        ]
        cursor = await self.collection.aggregate(pipeline)
        return await cursor.to_list(length=None)

    # ── Requêtes MongoDB : Écriture (CRUD) ───────────────────────
    async def create_mongo(self, projet_data: dict[str, Any]) -> dict[str, Any]:
        """Insère un nouveau projet dans MongoDB sans muter le dictionnaire d'entrée avec _id."""
        payload = projet_data.copy()
        await self.collection.insert_one(payload)
        return projet_data

    async def update_mongo(self, slug: str, updates: dict[str, Any]) -> bool:
        """Met à jour les champs modifiés d'un projet existant."""
        result = await self.collection.update_one({"slug": slug}, {"$set": updates})
        return result.matched_count > 0

    async def delete_mongo(self, slug: str) -> bool:
        """Supprime un projet de MongoDB par son slug."""
        result = await self.collection.delete_one({"slug": slug})
        return result.deleted_count > 0

    # ── Requêtes Neo4j : Lecture & Traversée de graphe ───────────
    async def get_similaires_graph(self, slug: str, limit: int = 5) -> list[dict]:
        """Retourne les projets reliés par SIMILAIRE, classés selon leur score commun."""
        query = """
        MATCH (projet:Projet {slug: $slug})-[r:SIMILAIRE]-(similaire:Projet)
        RETURN similaire.slug AS slug, similaire.titre AS titre,
               similaire.annee AS annee, r.score AS score
        ORDER BY score DESC, titre
        LIMIT $limit
        """
        async with self.neo4j.session() as session:
            result = await session.run(query, slug=slug, limit=limit)
            return [record.data() async for record in result]

    async def get_competences_graph(self, slug: str) -> list[dict]:
        """Retourne les nœuds Competence reliés à un projet donné."""
        query = """
        MATCH (projet:Projet {slug: $slug})-[:UTILISE]->(c:Competence)
        RETURN c.slug AS slug, c.nom AS nom, c.categorie AS categorie
        ORDER BY c.categorie, c.nom
        """
        async with self.neo4j.session() as session:
            result = await session.run(query, slug=slug)
            return [record.data() async for record in result]

    # ── Requêtes Neo4j : Écriture & Synchronisation du graphe ────
    async def upsert_projet_graph(
        self, slug: str, titre: str, annee: int, skills_slugs: list[str]
    ) -> None:
        """Crée ou met à jour le nœud Projet et ses relations UTILISE vers les compétences."""
        query = """
        MERGE (pr:Projet {slug: $slug})
        SET pr.titre = $titre, pr.annee = $annee
        WITH pr
        OPTIONAL MATCH (pr)-[old:UTILISE]->(:Competence)
        DELETE old
        WITH pr
        UNWIND $skills_slugs AS skill_slug
        MERGE (c:Competence {slug: skill_slug})
        MERGE (pr)-[:UTILISE]->(c)
        """
        async with self.neo4j.session() as session:
            await session.run(
                query, slug=slug, titre=titre, annee=annee, skills_slugs=skills_slugs
            )

    async def delete_projet_graph(self, slug: str) -> None:
        """Supprime le nœud Projet et toutes ses relations (UTILISE, SIMILAIRE...)."""
        query = """
        MATCH (pr:Projet {slug: $slug})
        DETACH DELETE pr
        """
        async with self.neo4j.session() as session:
            await session.run(query, slug=slug)
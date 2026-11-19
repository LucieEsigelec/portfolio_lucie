from neo4j import AsyncDriver
from pymongo.asynchronous.database import AsyncDatabase


class ProjetRepository:
    def __init__(self, mongo_db: AsyncDatabase, neo4j_driver: AsyncDriver):
        self.collection = mongo_db["projets"]  # Collection MongoDB avec les détails complets des projets
        self.neo4j = neo4j_driver  # Graphe Neo4j avec les relations entre projets et compétences

    # ── Requêtes MongoDB ─────────────────────────────────────────
    async def get_all_mongo(self, competence_slug: str | None = None) -> list[dict]:
        """Retourne les projets, éventuellement filtrés par compétence, sans exposer l'identifiant MongoDB."""
        filtre = {"skills_slugs": competence_slug} if competence_slug is not None else {}
        cursor = self.collection.find(filtre, {"_id": 0}).sort("date_realisation", -1)
        return await cursor.to_list(length=None)

    async def get_by_slug_mongo(self, slug: str) -> dict | None:
        """Retourne le détail complet d'un projet (besoin R6), ou None s'il est introuvable."""
        return await self.collection.find_one({"slug": slug}, {"_id": 0})

    # ── Requête Neo4j : projets similaires (besoin R4) ───────────
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
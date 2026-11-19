from pymongo.asynchronous.database import AsyncDatabase
from neo4j import AsyncDriver


class PersonneRepository:
    def __init__(self, mongo_db: AsyncDatabase, neo4j_driver: AsyncDriver):
        self.collection = mongo_db["personne"]
        self.neo4j = neo4j_driver

    # ── Requêtes MongoDB (Profil complet) ────────────────────────
    async def get_all_mongo(self) -> list[dict]:
        cursor = self.collection.find({}, {"_id": 0})
        return await cursor.to_list(length=100)

    async def get_by_slug_mongo(self, slug: str) -> dict | None:
        return await self.collection.find_one({"slug": slug}, {"_id": 0})

    # ── Requête Neo4j (Compétences réelles déduites du graphe) ───
    async def get_skills_from_graph(self, slug: str) -> list[dict]:
        """Récupère les compétences liées aux expériences/formations de la personne."""
        query = """
        MATCH (ctx)-[:UTILISE]->(c:Competence)
        WHERE (ctx:Experience OR ctx:Formation) AND ctx.personne = $slug
        RETURN DISTINCT c.slug AS slug, c.nom AS nom, c.categorie AS categorie
        ORDER BY c.categorie, c.nom
        """
        async with self.neo4j.session() as session:
            result = await session.run(query, slug=slug)
            return [record.data() async for record in result]
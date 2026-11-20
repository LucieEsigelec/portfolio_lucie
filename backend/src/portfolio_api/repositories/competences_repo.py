from typing import Any
from neo4j import AsyncDriver
from pymongo.asynchronous.database import AsyncDatabase


class CompetenceRepository:
    def __init__(self, mongo_db: AsyncDatabase, neo4j_driver: AsyncDriver):
        self.collection = mongo_db["competences"]  # Collection MongoDB avec les compétences
        self.neo4j = neo4j_driver  # Graphe Neo4j avec les relations entre compétences et projets/expériences

    # ── Requêtes MongoDB : Lecture & Agrégations ─────────────────
    async def get_all_mongo(self) -> list[dict]:
        """Retourne toutes les compétences triées par ordre d'affichage, sans _id."""
        cursor = self.collection.find({}, {"_id": 0}).sort("ordre_affichage", 1)
        return await cursor.to_list(length=None)

    async def get_by_slug_mongo(self, slug: str) -> dict | None:
        """Retourne la compétence correspondant au slug donné, ou None si introuvable."""
        return await self.collection.find_one({"slug": slug}, {"_id": 0})

    async def get_stats_par_categorie_mongo(self) -> list[dict]:
        """Agrégation MQL : regroupe les compétences par catégorie et compte leur effectif."""
        pipeline = [
            {
                "$group": {
                    "_id": "$categorie",
                    "total": {"$sum": 1},
                    "competences": {"$push": {"slug": "$slug", "nom": "$nom"}},
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "categorie": "$_id",
                    "total": 1,
                    "competences": 1,
                }
            },
            {"$sort": {"total": -1, "categorie": 1}},
        ]
        cursor = await self.collection.aggregate(pipeline)
        return await cursor.to_list(length=None)

    # ── Requêtes MongoDB : Écriture (CRUD) ───────────────────────
    async def create_mongo(self, competence_data: dict[str, Any]) -> dict[str, Any]:
        """Insère une nouvelle compétence dans MongoDB sans muter le dict original avec _id."""
        payload = competence_data.copy()
        await self.collection.insert_one(payload)
        return competence_data

    async def update_mongo(self, slug: str, updates: dict[str, Any]) -> bool:
        """Met à jour les champs modifiés d'une compétence existante."""
        result = await self.collection.update_one({"slug": slug}, {"$set": updates})
        return result.matched_count > 0

    async def delete_mongo(self, slug: str) -> bool:
        """Supprime une compétence de MongoDB par son slug."""
        result = await self.collection.delete_one({"slug": slug})
        return result.deleted_count > 0

    # ── Requêtes Neo4j : Lecture & Traversée de graphe ───────────
    async def get_usages_graph(self, slug: str) -> list[dict]:
        """Retourne les projets, expériences et formations qui utilisent cette compétence."""
        query = """
        MATCH (ctx)-[:UTILISE]->(c:Competence {slug: $slug})
        WHERE ctx:Projet OR ctx:Experience OR ctx:Formation
        RETURN DISTINCT labels(ctx)[0] AS type,
               coalesce(ctx.slug, ctx.id) AS ref,
               coalesce(ctx.titre, ctx.poste, ctx.diplome) AS titre
        """
        async with self.neo4j.session() as session:
            result = await session.run(query, slug=slug)
            return [record.data() async for record in result]

    async def get_top_competences_graph(self, limit: int = 10) -> list[dict]:
        """Requête Cypher paramétrée : classe les compétences les plus utilisées dans tout le graphe."""
        query = """
        MATCH (ctx)-[:UTILISE]->(c:Competence)
        WHERE ctx:Projet OR ctx:Experience OR ctx:Formation
        RETURN c.slug AS slug, c.nom AS nom, c.categorie AS categorie, count(DISTINCT ctx) AS nb_usages
        ORDER BY nb_usages DESC, nom ASC
        LIMIT $limit
        """
        async with self.neo4j.session() as session:
            result = await session.run(query, limit=limit)
            return [record.data() async for record in result]

    # ── Requêtes Neo4j : Écriture & Synchronisation du graphe ────
    async def upsert_competence_graph(
        self, slug: str, nom: str, categorie: str | None = None
    ) -> None:
        """Crée ou met à jour le nœud Competence dans Neo4j de manière idempotente."""
        query = """
        MERGE (c:Competence {slug: $slug})
        SET c.nom = $nom,
            c.categorie = coalesce($categorie, c.categorie)
        """
        async with self.neo4j.session() as session:
            await session.run(query, slug=slug, nom=nom, categorie=categorie)

    async def delete_competence_graph(self, slug: str) -> None:
        """Supprime le nœud Competence et toutes ses relations :UTILISE associées."""
        query = """
        MATCH (c:Competence {slug: $slug})
        DETACH DELETE c
        """
        async with self.neo4j.session() as session:
            await session.run(query, slug=slug)
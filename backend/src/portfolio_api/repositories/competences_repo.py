from pymongo.asynchronous.database import AsyncDatabase
from neo4j import AsyncDriver


class CompetenceRepository:
    def __init__(self, mongo_db: AsyncDatabase, neo4j_driver: AsyncDriver):
        self.collection = mongo_db["competences"] # collection mongodb avec les compétences
        self.neo4j = neo4j_driver #graph neo4j avec les relations entre compétences et projets/expériences

    # ── Requêtes MongoDB ─────────────────────────────────────────
    async def get_all_mongo(self) -> list[dict]: #retourne un dictionnaire contenant toutes les compétences triées par ordre d'affichage
        cursor = self.collection.find({}, {"_id": 0}).sort("ordre_affichage", 1) #récupère toutes les compétences ({}) en excluant le champ technique _id ("_id": 0)
        return await cursor.to_list(length=None) #retourne la liste complète des compétences triées par ordre d'affichage

    async def get_by_slug_mongo(self, slug: str) -> dict | None: #retourne un dictionnaire contenant la compétence correspondant au slug donné, ou None si aucune compétence n'est trouvée
        return await self.collection.find_one({"slug": slug}, {"_id": 0}) #recupere 1 compétence par son slug, en excluant le champ technique _id ("_id": 0)

    # ── Requête Neo4j (projets et expériences qui utilisent la compétence) ──
    async def get_usages_graph(self, slug: str) -> list[dict]: #retourne une liste de dictionnaires contenant les projets et expériences qui utilisent la compétence

        #trouve tous les nœuds ctx reliés à la compétence ciblée (slug: $slug) via une relation :UTILISE
        #WHERE ctx:Projet OR ctx:Experience OR ctx:Formation : filtre pour ne garder que ces trois types de nœuds.
        #RETURN : retourne les types, références et titres des nœuds trouvés.
        query = """
        MATCH (ctx)-[:UTILISE]->(c:Competence {slug: $slug}) 
        WHERE ctx:Projet OR ctx:Experience OR ctx:Formation
        RETURN DISTINCT labels(ctx)[0] AS type, coalesce(ctx.slug, ctx.id) AS ref,
               coalesce(ctx.titre, ctx.poste, ctx.diplome) AS titre
        """
        async with self.neo4j.session() as session: #ouvre une session asynchrone avec le driver Neo4j
            result = await session.run(query, slug=slug) #execute la requête avec le paramètre slug
            return [record.data() async for record in result] #retourne une liste de dictionnaires contenant les types, références et titres des nœuds trouvés.
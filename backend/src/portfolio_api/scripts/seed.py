"""Peuple MongoDB et Neo4j avec les VRAIES données de tous les membres (dossier data/).

Exigences (évaluées au Jalon 2) :
- 1 seule commande : `just seed`
- idempotent : relancer le seed ne crée pas de doublons
- reproductible sur une machine neuve après `just up`
"""

from __future__ import annotations

import asyncio
import json
from pathlib import Path

from collections import Counter
from portfolio_api.db.mongo import get_mongo_db
from portfolio_api.db.neo4j import get_neo4j_driver
from portfolio_api.models import Personne, Formation, Experience, Competence, Projet

DATA_DIR = Path(__file__).resolve().parents[4] / "data"


def load_member_files(kind: str) -> list[dict]:
    """Charge data/<kind>/*.json (hors fichiers commençant par '_', ex. _exemple.json)."""
    docs: list[dict] = []
    for path in sorted((DATA_DIR / kind).glob("*.json")):
        if path.name.startswith("_"): #pour ignorer les fichiers d'exemple
            continue
        content = json.loads(path.read_text(encoding="utf-8"))
        docs.extend(content if isinstance(content, list) else [content]) #applati le contenu en 1 liste unique
    return docs


def check_references(competences: list[dict], personne: list[dict], projets: list[dict]) -> None:
    """Liste toutes les incohérences avant d'écrire quoi que ce soit."""
    erreurs: list[str] = []
    #ensemble des slugs de compétences, personne et contextes (formations + expériences)
    skills = {c["slug"] for c in competences}
    personne_slugs = {c["slug"] for c in personne}
    contextes = [ctx for c in personne for ctx in c.get("formations", []) + c.get("experiences", [])]
    ctx_ids = {ctx["id"] for ctx in contextes}

#slugs en double dans chaque collection
    for nom, items in [("competences", competences), ("personne", personne), ("projets", projets)]:
        doublons = [s for s, n in Counter(i["slug"] for i in items).items() if n > 1]
        erreurs += [f"{nom} : slug en double « {s} »" for s in doublons]

#id de contexte en double : le MERGE fusionnerait deux expériences silencieusement
    doublons_ctx = [i for i, n in Counter(ctx["id"] for ctx in contextes).items() if n > 1]
    erreurs += [f"id de contexte en double « {i} »" for i in doublons_ctx]

#compétences inconnues dans les contextes
    for ctx in contextes:
        erreurs += [f"{ctx['id']} : compétence inconnue « {s} »"
                    for s in ctx.get("competences", []) if s not in skills]

#projets avec compétences, personne ou contexte introuvables
    for p in projets:
        erreurs += [f"{p['slug']} : compétence inconnue « {s} »"
                    for s in p.get("skills_slugs", []) if s not in skills]
        erreurs += [f"{p['slug']} : personne inconnue « {cs} »"
                    for cs in p.get("personne_slugs", []) if cs not in personne_slugs]
        if p.get("contexte_id") not in ctx_ids:
            erreurs.append(f"{p['slug']} : contexte_id « {p.get('contexte_id')} » introuvable")

    if erreurs:
        raise ValueError("Données incohérentes :\n  - " + "\n  - ".join(erreurs))


async def seed_mongo(competences: list[dict], personne: list[dict], projets: list[dict]) -> None:
    """Vide puis recharge chaque collection, et crée l'index unique sur le slug."""

    db = get_mongo_db()
    collections = {"competences": competences, "personne": personne, "projets": projets}

    for nom, docs in collections.items():
        #on vide la collection avant d'insérer les documents, pour éviter les doublons
        await db[nom].delete_many({})
        if docs:
            #copie des dictionnaires : Motor ajoute un _id à chaque document inséré,
            #et seed_neo4j réutilise ces mêmes données juste après
            await db[nom].insert_many([dict(d) for d in docs])
        #on crée un index unique sur le champ "slug" pour chaque collection
        await db[nom].create_index("slug", unique=True)
    print("[seed] MongoDB — OK")


async def seed_neo4j(competences: list[dict], personne: list[dict], projets: list[dict]) -> None:
    """Reconstruit le graphe tel que défini dans ARCHITECTURE.md §4.1."""
    driver = get_neo4j_driver()
    async with driver.session() as session:
        # Repart d'un graphe vide. DETACH supprime aussi les relations.
        await session.run("MATCH (n) DETACH DELETE n")

        for cypher in CONTRAINTES:
            await session.run(cypher)

        # noeuds compétences
        await session.run("""
            UNWIND $competences AS c
            MERGE (n:Competence {slug: c.slug})
            SET n.nom = c.nom, n.categorie = c.categorie""", competences=competences)

        #noeuds expériences et relations UTILISE
        await session.run("""
            UNWIND $personne AS c
            UNWIND c.experiences AS x
            MERGE (e:Experience {id: x.id})
            SET e.poste = x.poste, e.structure = x.structure, e.type = x.type,
                e.debut = x.debut, e.fin = x.fin, e.personne = c.slug
            WITH e, x
            UNWIND x.competences AS skill
            MATCH (s:Competence {slug: skill})
            MERGE (e)-[:UTILISE]->(s)""", personne=personne)

        #noeuds formations et relations UTILISE
        await session.run("""
            UNWIND $personne AS c
            UNWIND c.formations AS f
            MERGE (n:Formation {id: f.id})
            SET n.ecole = f.ecole, n.diplome = f.diplome, n.debut = f.debut,
                n.fin = f.fin, n.personne = c.slug
            WITH n, f
            UNWIND f.competences AS skill
            MATCH (s:Competence {slug: skill})
            MERGE (n)-[:UTILISE]->(s)""", personne=personne)

        # noeud projets
        # Séparé des relations : un projet sans compétence garde ainsi son nœud et sa relation DANS_CADRE_DE.
        await session.run("""
            UNWIND $projets AS j
            MERGE (p:Projet {slug: j.slug})
            SET p.titre = j.titre, p.annee = j.date_realisation""", projets=projets)

        # relations UTILISE entre projets et compétences
        await session.run("""
            UNWIND $projets AS j
            MATCH (p:Projet {slug: j.slug})
            UNWIND j.skills_slugs AS skill
            MATCH (s:Competence {slug: skill})
            MERGE (p)-[:UTILISE]->(s)""", projets=projets)

        # relations DANS_CADRE_DE : expériences
        await session.run("""
            UNWIND $projets AS j
            MATCH (p:Projet {slug: j.slug})
            MATCH (e:Experience {id: j.contexte_id})
            MERGE (e)-[:DANS_CADRE_DE]->(p)""", projets=projets)

        # relations DANS_CADRE_DE : formations
        await session.run("""
            UNWIND $projets AS j
            MATCH (p:Projet {slug: j.slug})
            MATCH (f:Formation {id: j.contexte_id})
            MERGE (f)-[:DANS_CADRE_DE]->(p)""", projets=projets)

        #relations SIMILAIRE entre projets (score = nombre de compétences en commun)
        await session.run("""
            MATCH (p1:Projet)-[:UTILISE]->(c:Competence)<-[:UTILISE]-(p2:Projet)
            WHERE p1.slug < p2.slug
            WITH p1, p2, count(c) AS score
            MERGE (p1)-[r:SIMILAIRE]->(p2)
            SET r.score = score""")
    print("[seed] Neo4j — OK")


# Contraintes de base de données
CONTRAINTES = [
    "CREATE CONSTRAINT competence_slug IF NOT EXISTS FOR (n:Competence) REQUIRE n.slug IS UNIQUE",
    "CREATE CONSTRAINT projet_slug IF NOT EXISTS FOR (n:Projet) REQUIRE n.slug IS UNIQUE",
    "CREATE CONSTRAINT experience_id IF NOT EXISTS FOR (n:Experience) REQUIRE n.id IS UNIQUE",
    "CREATE CONSTRAINT formation_id IF NOT EXISTS FOR (n:Formation) REQUIRE n.id IS UNIQUE",
]
def check_references(competences: list[dict], personne: list[dict], projets: list[dict]) -> None:
    """Liste toutes les incohérences avant d'écrire quoi que ce soit."""
    erreurs: list[str] = []
    #ensemble des slugs de compétences, personne et contextes (formations + expériences)
    skills = {c["slug"] for c in competences}
    personne_slugs = {c["slug"] for c in personne}
    contextes = [ctx for c in personne for ctx in c.get("formations", []) + c.get("experiences", [])]
    ctx_ids = {ctx["id"] for ctx in contextes}

#slugs en double dans chaque collection
    for nom, items in [("competences", competences), ("personne", personne), ("projets", projets)]:
        doublons = [s for s, n in Counter(i["slug"] for i in items).items() if n > 1]
        erreurs += [f"{nom} : slug en double « {s} »" for s in doublons]

#id de contexte en double : le MERGE fusionnerait deux expériences silencieusement
    doublons_ctx = [i for i, n in Counter(ctx["id"] for ctx in contextes).items() if n > 1]
    erreurs += [f"id de contexte en double « {i} »" for i in doublons_ctx]

#compétences inconnues dans les contextes
    for ctx in contextes:
        erreurs += [f"{ctx['id']} : compétence inconnue « {s} »"
                    for s in ctx.get("competences", []) if s not in skills]

#projets avec compétences, personne ou contexte introuvables
    for p in projets:
        erreurs += [f"{p['slug']} : compétence inconnue « {s} »"
                    for s in p.get("skills_slugs", []) if s not in skills]
        erreurs += [f"{p['slug']} : personne inconnue « {cs} »"
                    for cs in p.get("personne_slugs", []) if cs not in personne_slugs]
        if p.get("contexte_id") not in ctx_ids:
            erreurs.append(f"{p['slug']} : contexte_id « {p.get('contexte_id')} » introuvable")

    if erreurs:
        raise ValueError("Données incohérentes :\n  - " + "\n  - ".join(erreurs))


async def seed_mongo(competences: list[dict], personne: list[dict], projets: list[dict]) -> None:
    """Vide puis recharge chaque collection, et crée l'index unique sur le slug."""

    db = get_mongo_db()
    collections = {"competences": competences, "personne": personne, "projets": projets}

    for nom, docs in collections.items():
        #on vide la collection avant d'insérer les documents, pour éviter les doublons
        await db[nom].delete_many({})
        if docs:
            #copie des dictionnaires : Motor ajoute un _id à chaque document inséré,
            #et seed_neo4j réutilise ces mêmes données juste après
            await db[nom].insert_many([dict(d) for d in docs])
        #on crée un index unique sur le champ "slug" pour chaque collection
        await db[nom].create_index("slug", unique=True)
    print("[seed] MongoDB — OK")


async def seed_neo4j(competences: list[dict], personne: list[dict], projets: list[dict]) -> None:
    """Reconstruit le graphe tel que défini dans ARCHITECTURE.md §4.1."""
    driver = get_neo4j_driver()
    async with driver.session() as session:
        # Repart d'un graphe vide. DETACH supprime aussi les relations.
        await session.run("MATCH (n) DETACH DELETE n")

        for cypher in CONTRAINTES:
            await session.run(cypher)

        # noeuds compétences
        await session.run("""
            UNWIND $competences AS c
            MERGE (n:Competence {slug: c.slug})
            SET n.nom = c.nom, n.categorie = c.categorie""", competences=competences)

        #noeuds expériences et relations UTILISE
        await session.run("""
            UNWIND $personne AS c
            UNWIND c.experiences AS x
            MERGE (e:Experience {id: x.id})
            SET e.poste = x.poste, e.structure = x.structure, e.type = x.type,
                e.debut = x.debut, e.fin = x.fin, e.personne = c.slug
            WITH e, x
            UNWIND x.competences AS skill
            MATCH (s:Competence {slug: skill})
            MERGE (e)-[:UTILISE]->(s)""", personne=personne)

        #noeuds formations et relations UTILISE
        await session.run("""
            UNWIND $personne AS c
            UNWIND c.formations AS f
            MERGE (n:Formation {id: f.id})
            SET n.ecole = f.ecole, n.diplome = f.diplome, n.debut = f.debut,
                n.fin = f.fin, n.personne = c.slug
            WITH n, f
            UNWIND f.competences AS skill
            MATCH (s:Competence {slug: skill})
            MERGE (n)-[:UTILISE]->(s)""", personne=personne)

        # noeud projets
        # Séparé des relations : un projet sans compétence garde ainsi son nœud et sa relation DANS_CADRE_DE.
        await session.run("""
            UNWIND $projets AS j
            MERGE (p:Projet {slug: j.slug})
            SET p.titre = j.titre, p.annee = j.date_realisation""", projets=projets)

        # relations UTILISE entre projets et compétences
        await session.run("""
            UNWIND $projets AS j
            MATCH (p:Projet {slug: j.slug})
            UNWIND j.skills_slugs AS skill
            MATCH (s:Competence {slug: skill})
            MERGE (p)-[:UTILISE]->(s)""", projets=projets)

        # relations DANS_CADRE_DE : expériences
        await session.run("""
            UNWIND $projets AS j
            MATCH (p:Projet {slug: j.slug})
            MATCH (e:Experience {id: j.contexte_id})
            MERGE (e)-[:DANS_CADRE_DE]->(p)""", projets=projets)

        # relations DANS_CADRE_DE : formations
        await session.run("""
            UNWIND $projets AS j
            MATCH (p:Projet {slug: j.slug})
            MATCH (f:Formation {id: j.contexte_id})
            MERGE (f)-[:DANS_CADRE_DE]->(p)""", projets=projets)

        #relations SIMILAIRE entre projets (score = nombre de compétences en commun)
        await session.run("""
            MATCH (p1:Projet)-[:UTILISE]->(c:Competence)<-[:UTILISE]-(p2:Projet)
            WHERE p1.slug < p2.slug
            WITH p1, p2, count(c) AS score
            MERGE (p1)-[r:SIMILAIRE]->(p2)
            SET r.score = score""")
    print("[seed] Neo4j — OK")


# Contraintes de base de données
CONTRAINTES = [
    "CREATE CONSTRAINT competence_slug IF NOT EXISTS FOR (n:Competence) REQUIRE n.slug IS UNIQUE",
    "CREATE CONSTRAINT projet_slug IF NOT EXISTS FOR (n:Projet) REQUIRE n.slug IS UNIQUE",
    "CREATE CONSTRAINT experience_id IF NOT EXISTS FOR (n:Experience) REQUIRE n.id IS UNIQUE",
    "CREATE CONSTRAINT formation_id IF NOT EXISTS FOR (n:Formation) REQUIRE n.id IS UNIQUE",
]


async def main() -> None:
    competences = load_member_files("competences")
    personne = load_member_files("personne")
    competences = load_member_files("competences")
    personne = load_member_files("personne")
    projets = load_member_files("projets")
    print(f"[seed] {len(competences)} compétence(s), {len(personne)} personne(s), "
          f"{len(projets)} projet(s) trouvés dans {DATA_DIR}")

    # Validation unitaire de chaque fichier JSON via Pydantic
    competences = [Competence(**c).model_dump() for c in competences]
    personne = [Personne(**p).model_dump() for p in personne]
    projets = [Projet(**j).model_dump() for j in projets]

    # Puis validation des liens entre les collections
    check_references(competences, personne, projets)
    
    await seed_mongo(competences, personne, projets)
    await seed_neo4j(competences, personne, projets)
    print("[seed] OK")


if __name__ == "__main__":
    asyncio.run(main())
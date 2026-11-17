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
from pymongo import AsyncMongoClient

from portfolio_api.db.mongo import get_mongo_db, close_mongo

from portfolio_api.models import Personne, Formation, Experience, Competence

DATA_DIR = Path(__file__).resolve().parents[4] / "data"


def load_member_files(kind: str) -> list[dict]:
    """Charge data/<kind>/*.json (hors fichiers commençant par '_', ex. _exemple.json)."""
    docs: list[dict] = []
    for path in sorted((DATA_DIR / kind).glob("*.json")):
        if path.name.startswith("_"):
            continue
        content = json.loads(path.read_text(encoding="utf-8"))
        docs.extend(content if isinstance(content, list) else [content])
    return docs


async def seed_mongo(candidats: list[dict], projets: list[dict]) -> None:
    # TODO (équipe) : vider puis insérer selon VOTRE modèle (ARCHITECTURE.md §3), créer les index
    
    db = get_mongo_db()

    # 1. Validation Pydantic avant insertion
    candidats_valides = [Personne(**c).model_dump() for c in candidats]
    # projets_valides = [Projet(**p).model_dump() for p in projets]
    projets_valides = projets

    # 2. Nettoyage des collections (idempotence)
    await db.candidats.delete_many({})
    await db.projets.delete_many({})

    # 3. Insertion en base
    if candidats_valides:
        res_c = await db.candidats.insert_many(candidats_valides)
        print(f"✅ {len(res_c.inserted_ids)} candidat(s) inséré(s).")

    if projets_valides:
        res_p = await db.projets.insert_many(projets_valides)
        print(f"✅ {len(res_p.inserted_ids)} projet(s) inséré(s).")

    # 4. Création des index
    await db.candidats.create_index("slug", unique=True)
    await db.projets.create_index("slug", unique=True)
    print("✅ Index créés.")
    
    
   


async def seed_neo4j(candidats: list[dict], projets: list[dict]) -> None:
    # TODO (équipe) : contraintes + MERGE des nœuds et relations (ARCHITECTURE.md §4)
    raise NotImplementedError


async def main() -> None:
    candidats = load_member_files("candidats")
    projets = load_member_files("projets")
    print(f"[seed] {len(candidats)} candidat(s), {len(projets)} projet(s) trouvés dans {DATA_DIR}")
    await seed_mongo(candidats, projets)
    # await seed_neo4j(candidats, projets)
    print("[seed] OK")


if __name__ == "__main__":
    asyncio.run(main())

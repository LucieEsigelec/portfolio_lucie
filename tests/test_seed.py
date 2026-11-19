# tests/test_seed_integration.py
import pytest
from portfolio_api.db.mongo import get_mongo_db
from portfolio_api.db.neo4j import get_neo4j_driver

pytestmark = pytest.mark.integration

#teste si les données de personne ont été insérées correctement dans MongoDB apres l execution du script seed.py
async def test_mongo_contient_les_personne():
    db = get_mongo_db()
    assert await db["personne"].count_documents({}) == 1  # adaptez au nombre de JSON


#teste si les relations UTILISE ont été créées dans Neo4j après l execution du script seed.py
async def test_neo4j_relations_creees():
    driver = get_neo4j_driver()
    async with driver.session() as s:
        n = (await (await s.run(
            "MATCH (:Experience)-[r:UTILISE]->(:Competence) RETURN count(r) AS n"
        )).data())[0]["n"]
    assert n > 0

#teste l idempotence du script seed.py
async def test_idempotence(): 
    from portfolio_api.scripts.seed import main  # adaptez l'import
    await main()
    await main()
    db = get_mongo_db()
    assert await db["personne"].count_documents({}) == 1
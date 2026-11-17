import asyncio
from pymongo import AsyncMongoClient
from neo4j import AsyncGraphDatabase
from portfolio_api.core.config import get_settings


async def main():
    settings = get_settings()

    # 1. Test MongoDB Atlas
    mongo_client = AsyncMongoClient(settings.mongo_url)
    await mongo_client[settings.mongo_db].command("ping")
    print(f"✅ MongoDB Atlas connecté (base : {settings.mongo_db})")
    await mongo_client.close()

    # 2. Test Neo4j
    neo4j_driver = AsyncGraphDatabase.driver(
        settings.neo4j_uri, auth=(settings.neo4j_user, settings.neo4j_password)
    )
    await neo4j_driver.verify_connectivity()
    print(f"✅ Neo4j connecté ({settings.neo4j_uri})")
    await neo4j_driver.close()


if __name__ == "__main__":
    asyncio.run(main())
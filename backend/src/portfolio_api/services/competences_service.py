from portfolio_api.repositories.competences_repo import CompetenceRepository


class CompetenceService:
    def __init__(self, repo: CompetenceRepository):
        self.repo = repo

    async def list_competences(self) -> list[dict]:
        return await self.repo.get_all_mongo() #recupere le liste triée des compétences depuis repository competences : retourne une liste de dictionnaires contenant les compétences triées par ordre d'affichage.

    async def get_competence_detail(self, slug: str) -> dict | None: #retourne un dictionnaire d'une compétence et ses usages (projets et expériences qui l'utilisent) correspondant au slug donné, ou None si aucune compétence n'est trouvée
        competence = await self.repo.get_by_slug_mongo(slug) #recupere la compétence correspondant au slug donné depuis repository competences : retourne un dictionnaire contenant la compétence correspondant au slug donné, ou None si aucune compétence n'est trouvée
        if competence is None:
            return None
        competence["usages"] = await self.repo.get_usages_graph(slug) #enrichissement : recupere les projets et expériences qui utilisent la compétence depuis repository competences : retourne une liste de dictionnaires contenant les projets et expériences qui utilisent la compétence
        return competence
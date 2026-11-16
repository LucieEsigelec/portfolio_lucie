# 🧠 ARCHITECTURE - Équipe `TODO-nom-equipe`

> **Jalon 1** : ce document est votre **spécification**. Il doit être **complet** : toute l'équipe va coder dessus.
> Toutes les sections sont obligatoires. Remplacez **tous** les `TODO` (la CI « Livrables » les compte).
> En soutenance (5 à 6 min), vous présenterez surtout la **section 1** (schéma) et le contrat `API_ROUTES.md`.

## 1. Schéma d'architecture

Montrez **qui stocke quoi** et **quels flux** : frontends → API → MongoDB / Neo4j.

**Recommandé : [Excalidraw](https://excalidraw.com)** (à plusieurs via *Live collaboration*). Exportez en PNG ou SVG avec **« Embed scene »** coché,
enregistrez dans `docs/architecture.excalidraw.png`, puis remplacez le schéma Mermaid ci-dessous par :

`![Architecture](docs/architecture.excalidraw.png)`

L'image reste modifiable : rouvrez-la dans Excalidraw (ou dans VS Code avec l'extension *Excalidraw*).

```mermaid
flowchart LR
    F["Frontends (1 par membre)"] -->|HTTP JSON| API["FastAPI - backend d'équipe"]
    API -->|"candidats, projets, compétences"| M[("MongoDB")]
    API -->|"graphe de compétences, similarités projets"| N[("Neo4j")]
    %% TODO : complétez / corrigez ce schéma selon VOS choix
```

TODO : en 3 à 5 lignes, le rôle de chaque base dans votre portfolio.
Voici un texte prêt à être copié-collé pour remplir votre **TODO** dans votre rapport :

> **MongoDB :** Elle stocke l'ensemble des données riches, textuelles et administratives du portfolio (profil personnel, formations, expériences et fiches projets au format Markdown). Grâce à une stratégie combinant embedding et referencing par *slug*, elle garantit un accès direct et rapide en lecture pour restituer les contenus éditoriaux et les métadonnées.
> **Neo4j :** Elle gère le graphe de connaissances centré sur les relations structurelles entre les projets et les compétences (*skills*). Elle prend en charge la logique métier avancée, telle que la recommandation de projets similaires par traversée de graphe et l'analyse de la centralité des technologies.

## 2. Les requêtes à servir

| # | Besoin (vu par un recruteur) | Route API | Base(s) interrogée(s) |
|---|---|---|---|
| R1 | Profil + timeline (expériences, formations) d'un candidat | `GET /api/candidats/{slug}` | MongoDB |
| R2 | Projets d'un candidat, filtrables par compétence | `GET /api/candidats/{slug}/projets` | MongoDB |
| R3 | Statistiques d'un candidat par compétence | `GET /api/candidats/{slug}/stats` | MongoDB |
| R4 | Projets similaires à un projet | `GET /api/graph/projets/{slug}/similaires` | Neo4j |
| R5 | Graphe de compétences d'un candidat | `GET /api/graph/competences/{slug}` | Neo4j |
| TODO | Vos requêtes supplémentaires | TODO | TODO |

## 3. Modèle MongoDB

### 3.1 Collection `candidats` - pattern TODO (*Embedding* ? *Referencing* ?)

```json
TODO : un document d'exemple complet

{
        ObjectId _id PK
        string prenom
        string nom
        string titre
        string bio
        object contact "email, github, linkedin..."
        array formations "école, diplôme, années..."
        array experiences "entreprise, poste, missions..."
    }
```


**Justification** (cardinalité bornée ou non, lecture en une requête, fréquence de mise à jour) : TODO

### 3.2 Collection `projets` - pattern TODO

```json
TODO : un document d'exemple complet

{
        ObjectId _id PK
        string slug UK "Clé pivot unique"
        string titre
        string resume
        string contenu_md "Format Markdown complet"
        object liens "github, demo"
        object metriques "performances, stats"
        array skills_slugs "['python', 'mongodb', ...]"
        string date_realisation

}
   
```

### 3.3 Collection `compétences` - pattern 

```json

{
        ObjectId _id PK
        string slug UK "Clé pivot unique"
        string nom
        string categorie "Langage, BDD, DevOps..."
        string niveau_maitrise
        string icone_url
        int ordre_affichage
    }
 
```


**Justification** : TODO

### 3.4 Index

| Collection | Index | Requête servie (R#) |
|---|---|---|
| TODO | TODO | TODO |

### 3.5 Pipeline d'agrégation clé (R3)

```javascript
TODO : db.projets.aggregate([ ... ])
```

## 4. Modèle Neo4j

### 4.1 Schéma du graphe

```mermaid
graph TD
    %% Nœuds
    Projets["Projets"] -->|"(utilise)"| Compétences["Compétences"]
    Expériences["Expériences"] -->|"(utilise)"| Compétences
    Formations["Formations"] -->|"(utilise)"| Compétences
    Formations -->|"(dans le cadre de)"| Projets
    Expériences -->|"(dans le cadre de)"| Projets
    Projets -->|"(similaire)"| Projets
```

| Label | Propriétés | Clé unique |
|---|---|---|
| Projets | slug, titre, annee | slug |
| Expériences | slug, poste, entreprise | slug ou id |
| Formations | slug, diplome, ecole | slug ou id |
| Compétences | nom, categorie | id |

| Relation | De → Vers | Propriétés | Pourquoi ce sens |
|---|---|---|---|
| UTILISE | Projet → Skill | / | lier les réalisations et le parcours aux technologies maîtrisées pour l'analyse de compétences |
| UTILISE | Formation → Skill | / | lier les réalisations et le parcours aux technologies maîtrisées pour l'analyse de compétences |
| UTILISE | Experience → Skill | / | lier les réalisations et le parcours aux technologies maîtrisées pour l'analyse de compétences |
| DANS LE CADRE DE | Expérience → Projet | / | rattacher un projet à son cadre d'origine |
| DANS LE CADRE DE | Formation → Projet | / | rattacher un projet à son cadre d'origine |
| SIMILAIRE | Projet → Projet | score de similarité | Relie deux projets proches par leurs compétences communes |

### 4.2 Les 3 requêtes Cypher clés

```cypher
// R4 - projets similaires
TODO

// R5 - graphe de compétences d'un candidat
TODO

// Compétences communes aux membres de l'équipe (ou requête de votre choix)
TODO
```

### 4.3 Contraintes

```cypher
TODO : CREATE CONSTRAINT ... IF NOT EXISTS
```

## 5. Cohérence entre les bases (slugs pivots)

| Entité | Slug | Dans MongoDB | Dans Neo4j |
|---|---|---|---|
| Candidat | `candidat_slug` (ex. `alice-martin`) | TODO | TODO |
| Projet | `projet_slug` (ex. `smartcity-explorer`) | TODO | TODO |
| Compétence | `skill_slug` (ex. `mongodb`) | TODO | TODO |

**Suppression d'un projet** : que faites-vous dans chaque base ? TODO

## 6. Répartition du travail

| Membre (pseudo GitHub) | Backend (couches / routes) | Frontend |
|---|---|---|
| TODO | TODO | `frontends/frontend-TODO/` |

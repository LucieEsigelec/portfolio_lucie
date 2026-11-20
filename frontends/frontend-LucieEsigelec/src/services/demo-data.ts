// Demonstration data, used automatically when the FastAPI server cannot be reached.
// Profile, experiences and education come from Lucie's CV; projects are illustrative.
import type {
  Competence,
  PersonneDetail,
  Projet,
  ProjetDetail,
  ProjetSimilaire,
  StatCategorieCompetence,
  TopCompetence,
} from "./types";

export const demoCompetences: Competence[] = [
  { slug: "python", nom: "Python", categorie: "Langages", niveau: "Avancé" },
  { slug: "sql", nom: "SQL", categorie: "Bases de données", niveau: "Avancé" },
  { slug: "java", nom: "Java", categorie: "Langages", niveau: "Intermédiaire" },
  { slug: "c", nom: "C", categorie: "Langages", niveau: "Intermédiaire" },
  { slug: "pyspark", nom: "PySpark", categorie: "Data / IA", niveau: "Intermédiaire", mots_cles: ["spark"] },
  { slug: "etl", nom: "Pipelines ETL", categorie: "Data / IA", niveau: "Intermédiaire" },
  { slug: "power-bi", nom: "Power BI", categorie: "Data / IA", niveau: "Avancé" },
  { slug: "looker", nom: "Looker", categorie: "Data / IA", niveau: "Intermédiaire" },
  { slug: "spotfire", nom: "Spotfire", categorie: "Data / IA", niveau: "Intermédiaire" },
  { slug: "postgresql", nom: "PostgreSQL", categorie: "Bases de données", niveau: "Avancé", mots_cles: ["supabase"] },
  { slug: "supabase", nom: "Supabase", categorie: "Bases de données", niveau: "Avancé" },
  { slug: "neo4j", nom: "Neo4j", categorie: "Bases de données", niveau: "Intermédiaire" },
  { slug: "mongodb", nom: "MongoDB", categorie: "Bases de données", niveau: "Intermédiaire" },
  { slug: "react", nom: "React", categorie: "Web / Dev", niveau: "Intermédiaire" },
  { slug: "react-native", nom: "React Native", categorie: "Web / Dev", niveau: "Avancé" },
  { slug: "html-css", nom: "HTML/CSS", categorie: "Web / Dev", niveau: "Avancé" },
  { slug: "fastapi", nom: "FastAPI", categorie: "Web / Dev", niveau: "Intermédiaire" },
  { slug: "power-apps", nom: "Power Apps", categorie: "Outils & Low-code", niveau: "Expert" },
  { slug: "power-automate", nom: "Power Automate", categorie: "Outils & Low-code", niveau: "Avancé" },
  { slug: "docker", nom: "Docker", categorie: "DevOps", niveau: "Intermédiaire" },
  { slug: "git", nom: "Git", categorie: "DevOps", niveau: "Avancé" },
  { slug: "linux", nom: "Linux / Bash", categorie: "DevOps", niveau: "Intermédiaire" },
];

export const demoPersonne: PersonneDetail = {
  profil: {
    slug: "lucie-reichardt",
    prenom: "Lucie",
    nom: "Reichardt",
    titre: "Data & Développement logiciel",
    bio: "Spécialisée en data et développement logiciel, je conçois des outils internes et des interfaces qui simplifient les flux opérationnels. Curieuse, réactive et rigoureuse, j'aime relever de nouveaux défis techniques.",
    contacts: {
      email: "lucie.reichardt@hotmail.com",
      github: "https://github.com/LucieEsigelec?tab=repositories",
      linkedin: "https://www.linkedin.com/in/lucie-reichardt-648420286/",
    },
    formations: [
      {
        id: "form-esigelec-ing-2024",
        ecole: "ESIGELEC Rouen",
        diplome: "Cycle ingénieur — Informatique, dominante Big Data pour la transformation du numérique",
        debut: "2024-09",
        fin: "2027-08",
        competences: ["python", "sql", "pyspark", "java", "neo4j", "mongodb", "linux"],
      },
      {
        id: "form-esigelec-prepa-2022",
        ecole: "ESIGELEC Rouen",
        diplome: "Cycle préparatoire intégré — Maths, mécanique, électricité, thermodynamique",
        debut: "2022-09",
        fin: "2024-06",
        competences: ["python", "c"],
      },
    ],
    experiences: [
      {
        id: "exp-utfpr-2026",
        poste: "Stage en laboratoire de recherche",
        structure: "UTFPR — Curitiba, Brésil",
        type: "Stage",
        debut: "2026-05",
        fin: "2026-07",
        missions: [
          "Développement d'une application mobile e-santé en React Native : suivi en temps réel de la rééducation du ligament croisé antérieur",
          "Architecture et modélisation complète de la base de données (Supabase / PostgreSQL)",
          "Rédaction d'un article scientifique soumis au Congresso Brasileiro de Engenharia Biomédica (CBEB)",
          "Ateliers de tests utilisateurs auprès de futurs kinésithérapeutes pour valider l'ergonomie",
        ],
        competences: ["react-native", "supabase", "postgresql", "sql"],
      },
      {
        id: "exp-renault-2024",
        poste: "Apprentie ingénieure data",
        structure: "Renault — Cléon",
        type: "Alternance",
        debut: "2024-09",
        fin: "2027-08",
        missions: [
          "Conception et déploiement d'outils internes sous Power Apps : automatisation de workflows interdépartementaux (+100 utilisateurs)",
          "Dashboards Looker et Spotfire pour le monitoring des performances moteur",
          "Cadrage des besoins, formation et accompagnement des profils non techniques",
          "Présentation d'insights data aux directions métier pour l'aide à la décision",
        ],
        competences: ["power-apps", "power-automate", "looker", "spotfire", "sql", "python"],
      },
      {
        id: "exp-sopano-2024",
        poste: "Stage systèmes d'information",
        structure: "SOPANO",
        type: "Stage",
        debut: "2024-06",
        fin: "2024-07",
        missions: [
          "Analyse des performances globales et modélisation de données sous Power BI",
          "Tableaux de bord décisionnels pour le suivi en temps réel des métriques industrielles",
          "Identification de leviers d'amélioration via la restitution d'insights data",
        ],
        competences: ["power-bi", "sql"],
      },
    ],
    competences: demoCompetences.map((c) => c.slug),
  },
  competences_graphe: demoCompetences,
};

const md = (s: string) => s.trim();

export const demoProjets: Projet[] = [
  {
    slug: "appli-esante-lca",
    titre: "Application e-santé de rééducation du LCA",
    date_realisation: "2026",
    contexte_id: "exp-utfpr-2026",
    personne_slugs: ["lucie-reichardt"],
    skills_slugs: ["react-native", "supabase", "postgresql", "sql"],
    description: md(`
## Contexte
Stage en laboratoire de recherche à l'**UTFPR (Curitiba, Brésil)** : accompagner les patients en rééducation après une rupture du ligament croisé antérieur.

## Réalisation
- Application mobile **React Native** de suivi en temps réel des protocoles de rééducation
- Modèle relationnel complet sous **Supabase / PostgreSQL**
- Ateliers de tests utilisateurs avec de futurs kinésithérapeutes pour valider l'UX

> Travail valorisé par un article soumis au *Congresso Brasileiro de Engenharia Biomédica* (CBEB).
`),
  },
  {
    slug: "outils-internes-power-apps",
    titre: "Outils internes Power Apps chez Renault",
    date_realisation: "2025",
    contexte_id: "exp-renault-2024",
    personne_slugs: ["lucie-reichardt"],
    skills_slugs: ["power-apps", "power-automate", "sql"],
    description: md(`
## Objectif
Réduire la saisie manuelle et fluidifier les échanges entre départements de l'usine de **Cléon**.

- Applications **Power Apps** déployées auprès de plus de **100 utilisateurs**
- Automatisation des workflows interdépartementaux avec **Power Automate**
- Recueil des besoins et formation des équipes non techniques
`),
  },
  {
    slug: "monitoring-performances-moteur",
    titre: "Monitoring des performances moteur",
    date_realisation: "2025",
    contexte_id: "exp-renault-2024",
    personne_slugs: ["lucie-reichardt"],
    skills_slugs: ["looker", "spotfire", "sql", "python"],
    description: md(`
## Le besoin
Donner aux équipes métier une vision claire des performances moteur.

- Dashboards **Looker** et **Spotfire** branchés sur les données de production
- Préparation et contrôle des données en **SQL** et **Python**
- Restitution des insights aux directions métier
`),
  },
  {
    slug: "portfolio-polyglotte",
    titre: "Portfolio polyglotte MongoDB & Neo4j",
    date_realisation: "2026",
    contexte_id: "form-esigelec-ing-2024",
    personne_slugs: ["lucie-reichardt"],
    skills_slugs: ["python", "fastapi", "mongodb", "neo4j", "react", "docker"],
    description: md(`
## Objectif
Construire un portfolio d'équipe où **MongoDB** stocke les documents (profils, projets) et **Neo4j** modélise les relations entre compétences, projets et personnes.

## Architecture
- API **FastAPI** avec synchronisation automatique des nœuds Neo4j
- Agrégations MongoDB pour les statistiques par catégorie
- Requêtes Cypher pour le *top* des compétences et les projets similaires

\`\`\`cypher
MATCH (p:Projet)-[:UTILISE]->(c:Competence)<-[:UTILISE]-(autre:Projet)
RETURN autre.slug, count(c) AS score ORDER BY score DESC
\`\`\`
`),
  },
  {
    slug: "pipeline-spark-etl",
    titre: "Pipeline ETL distribué avec Spark",
    date_realisation: "2025",
    contexte_id: "form-esigelec-ing-2024",
    personne_slugs: ["lucie-reichardt"],
    skills_slugs: ["pyspark", "etl", "python", "postgresql", "linux"],
    description: md(`
## Projet de cours — Big Data
Ingestion, nettoyage et agrégation d'un jeu de données volumineux.

- Traitements distribués avec **PySpark**
- Chargement des agrégats dans PostgreSQL
- Scripts d'orchestration Bash sous Linux
`),
  },
  {
    slug: "dashboards-industriels-power-bi",
    titre: "Tableaux de bord industriels Power BI",
    date_realisation: "2024",
    contexte_id: "exp-sopano-2024",
    personne_slugs: ["lucie-reichardt"],
    skills_slugs: ["power-bi", "sql"],
    description: md(`
## Stage chez SOPANO
- Modélisation des données de production sous **Power BI**
- Suivi en temps réel des métriques opérationnelles et industrielles
- Identification, en équipe, de leviers d'amélioration
`),
  },
];

/** Shared-skill similarity (Jaccard), used for demo "projets similaires". */
export function demoSimilaires(slug: string, limit = 3): ProjetSimilaire[] {
  const base = demoProjets.find((p) => p.slug === slug);
  if (!base) return [];
  const a = new Set(base.skills_slugs ?? []);
  return demoProjets
    .filter((p) => p.slug !== slug)
    .map((p) => {
      const b = new Set(p.skills_slugs ?? []);
      const inter = [...a].filter((s) => b.has(s)).length;
      const union = new Set([...a, ...b]).size || 1;
      return { slug: p.slug, titre: p.titre, annee: Number(p.date_realisation) || null, score: inter / union };
    })
    .filter((p) => p.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit);
}

export function demoProjetDetail(slug: string): ProjetDetail | null {
  const p = demoProjets.find((x) => x.slug === slug);
  if (!p) return null;
  return {
    ...p,
    competences_detaillees: (p.skills_slugs ?? []).map((s) => {
      const c = demoCompetences.find((x) => x.slug === s);
      return { slug: s, nom: c?.nom ?? s, categorie: c?.categorie ?? null };
    }),
    projets_similaires: demoSimilaires(slug),
  };
}

export function demoStatsCategories(): StatCategorieCompetence[] {
  const map = new Map<string, string[]>();
  for (const c of demoCompetences) map.set(c.categorie, [...(map.get(c.categorie) ?? []), c.slug]);
  return [...map.entries()]
    .map(([categorie, competences]) => ({ categorie, total: competences.length, competences }))
    .sort((a, b) => b.total - a.total);
}

export function demoTopCompetences(limit = 8): TopCompetence[] {
  const counts = new Map<string, number>();
  const add = (slugs: string[] | undefined) => slugs?.forEach((s) => counts.set(s, (counts.get(s) ?? 0) + 1));
  demoProjets.forEach((p) => add(p.skills_slugs));
  demoPersonne.profil.experiences?.forEach((e) => add(e.competences));
  demoPersonne.profil.formations?.forEach((f) => add(f.competences));
  return [...counts.entries()]
    .map(([slug, usages]) => ({ slug, nom: demoCompetences.find((c) => c.slug === slug)?.nom ?? slug, usages }))
    .sort((a, b) => b.usages - a.usages || a.nom.localeCompare(b.nom))
    .slice(0, limit);
}

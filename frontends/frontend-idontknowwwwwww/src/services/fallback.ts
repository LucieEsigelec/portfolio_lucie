/**
 * Minimal offline dataset, used ONLY when VITE_API_URL is missing or the API is
 * unreachable. It is never merged with real API data and never treated as the
 * primary source: as soon as the API answers, its data replaces this entirely.
 *
 * Keep it minimal: profile identity, a few projects, skills and simplified relations.
 */
import type {
  Competence,
  CompetenceDetail,
  CompetenceUsage,
  Personne,
  PersonneDetail,
  Projet,
  ProjetDetail,
  ProjetSimilaire,
  StatCategorieCompetence,
  StatCompetenceProjet,
  TopCompetence,
} from "@/types/api";
import { PROFILE_SLUG } from "./constants";

/* Profile snapshot taken from the real GET /api/personnes/akim-lamtamri response. */
const competences: Competence[] = [
  { slug: "lookml", nom: "LookML", categorie: "BI & visualisation", niveau: null, mots_cles: [] },
  { slug: "looker", nom: "Looker", categorie: "BI & visualisation", niveau: null, mots_cles: [] },
  { slug: "mongodb", nom: "MongoDB", categorie: "Base de données", niveau: null, mots_cles: [] },
  { slug: "neo4j", nom: "Neo4j", categorie: "Base de données", niveau: null, mots_cles: [] },
  { slug: "sql", nom: "SQL", categorie: "Base de données", niveau: null, mots_cles: [] },
  { slug: "data-analysis", nom: "Analyse de données", categorie: "Data engineering", niveau: null, mots_cles: [] },
  { slug: "pipeline-design", nom: "Conception de pipelines", categorie: "Data engineering", niveau: null, mots_cles: [] },
  { slug: "data-modeling", nom: "Modélisation de données", categorie: "Data engineering", niveau: null, mots_cles: [] },
  { slug: "git", nom: "Git", categorie: "DevOps & outils", niveau: null, mots_cles: [] },
  { slug: "html-css", nom: "HTML/CSS", categorie: "Langage", niveau: null, mots_cles: [] },
  { slug: "java", nom: "Java", categorie: "Langage", niveau: null, mots_cles: [] },
  { slug: "php", nom: "PHP", categorie: "Langage", niveau: null, mots_cles: [] },
  { slug: "python", nom: "Python", categorie: "Langage", niveau: null, mots_cles: [] },
  { slug: "gestion-de-projet", nom: "Gestion de projet", categorie: "Transversale", niveau: null, mots_cles: [] },
  { slug: "travail-en-equipe", nom: "Travail en équipe", categorie: "Transversale", niveau: null, mots_cles: [] },
];

const profil: Personne = {
  slug: PROFILE_SLUG,
  prenom: "Akim",
  nom: "Lamtamri",
  titre: "Apprenti Data Engineer",
  bio: "Élève-ingénieur généraliste spécialisé en ingénierie des données (Big Data pour la transformation du numérique), concevant des tableaux de bord et des pipelines de données pour accompagner la prise de décision.",
  contacts: { email: null, github: null, linkedin: null },
  formations: [
    {
      id: "akim-lamtamri-esigelec-2027",
      ecole: "ESIGELEC",
      diplome:
        "Diplôme d'ingénieur généraliste par apprentissage, dominante Big Data pour la transformation du numérique",
      debut: "2022",
      fin: "2027",
      competences: ["python", "java", "php", "html-css", "sql", "mongodb", "neo4j", "git"],
    },
    {
      id: "akim-lamtamri-bac-2023",
      ecole: "Lycée",
      diplome:
        "Baccalauréat général — Spécialités Mathématiques et Physique-Chimie (Mention Bien)",
      debut: "2020",
      fin: "2023",
      competences: [],
    },
  ],
  experiences: [
    {
      id: "akim-lamtamri-renault-2024",
      poste: "Apprenti Data Engineer (Équipe transversale Data & Analytics)",
      structure: "Groupe Renault",
      type: "emploi",
      debut: "2024",
      fin: null,
      missions: [
        "Conception et maintenance de tableaux de bord Looker et de modèles de données pour améliorer la visibilité sur la production et la logistique.",
        "Rétro-ingénierie des structures de données industrielles et des tableaux de bord pour garantir la fiabilité des KPI et du reporting.",
        "Collaboration avec des équipes internationales pour livrer des solutions data adaptées aux enjeux manufacturing et supply chain.",
        "Contribution à la démocratisation de l'IA et promotion d'une culture data-driven au sein de l'organisation.",
        "Accompagnement de projets transverses avec les départements production, qualité et IT.",
      ],
      competences: [
        "sql",
        "looker",
        "lookml",
        "python",
        "data-modeling",
        "data-analysis",
        "pipeline-design",
        "travail-en-equipe",
      ],
    },
    {
      id: "akim-lamtamri-safran-2023",
      poste: "Stagiaire découverte",
      structure: "Safran Aerosystems",
      type: "stage",
      debut: "2023",
      fin: "2023",
      missions: [
        "Découverte du fonctionnement de l'entreprise à travers différents services : ingénierie, contrôle qualité, service client et production.",
        "Participation au suivi de gestion de projet et à la compréhension des processus industriels.",
      ],
      competences: ["gestion-de-projet", "travail-en-equipe"],
    },
  ],
  competences: [],
};

/* Only the two projects this portfolio is part of, linked to real skills of the profile. */
const projets: Projet[] = [
  {
    slug: "portfolio-polyglotte-api",
    titre: "Portfolio Polyglotte — API",
    description:
      "API d'équipe qui combine MongoDB pour les documents et Neo4j pour les relations entre personnes, projets et compétences.",
    date_realisation: "2026",
    contexte_id: "akim-lamtamri-esigelec-2027",
    personne_slugs: [PROFILE_SLUG],
    skills_slugs: ["python", "mongodb", "neo4j", "git"],
  },
  {
    slug: "frontend-idontknowwwwwww",
    titre: "frontend-idontknowwwwwww",
    description: "Frontend individuel en lecture seule qui consomme l'API Portfolio Polyglotte.",
    date_realisation: "2026",
    contexte_id: "akim-lamtamri-esigelec-2027",
    personne_slugs: [PROFILE_SLUG],
    skills_slugs: ["html-css", "neo4j", "git"],
  },
];

function competenceBySlug(slug: string): Competence | undefined {
  return competences.find((c) => c.slug === slug);
}

function sharedSkills(a: Projet, b: Projet): number {
  const skillsA = new Set(a.skills_slugs ?? []);
  return (b.skills_slugs ?? []).filter((s) => skillsA.has(s)).length;
}

export function fallbackPersonnes(): Personne[] {
  return [profil];
}

export function fallbackPersonneDetail(slug: string): PersonneDetail | null {
  if (slug !== PROFILE_SLUG) return null;
  return { profil, competences_graphe: competences };
}

export function fallbackProjets(competence?: string): Projet[] {
  if (!competence) return projets;
  return projets.filter((p) => (p.skills_slugs ?? []).includes(competence));
}

export function fallbackSimilaires(slug: string, limit: number): ProjetSimilaire[] | null {
  const projet = projets.find((p) => p.slug === slug);
  if (!projet) return null;
  return projets
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      slug: p.slug,
      titre: p.titre,
      annee: Number.parseInt(p.date_realisation, 10) || null,
      score: sharedSkills(projet, p),
    }))
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function fallbackProjet(slug: string): ProjetDetail | null {
  const projet = projets.find((p) => p.slug === slug);
  if (!projet) return null;
  return {
    ...projet,
    competences_detaillees: (projet.skills_slugs ?? []).map((s) => {
      const c = competenceBySlug(s);
      return { slug: s, nom: c?.nom ?? s, categorie: c?.categorie ?? null };
    }),
    projets_similaires: fallbackSimilaires(slug, 3) ?? [],
  };
}

export function fallbackProjetsStatsCompetences(): StatCompetenceProjet[] {
  return competences
    .map((c) => ({ competence_slug: c.slug, nb_projets: fallbackProjets(c.slug).length }))
    .filter((s) => s.nb_projets > 0)
    .sort((a, b) => b.nb_projets - a.nb_projets);
}

export function fallbackCompetences(): Competence[] {
  return competences;
}

/** Simplified relations: projects, experiences and formations that list the skill. */
function usagesOf(slug: string): CompetenceUsage[] {
  return [
    ...fallbackProjets(slug).map((p) => ({ type: "Projet", ref: p.slug, titre: p.titre })),
    ...(profil.experiences ?? [])
      .filter((e) => (e.competences ?? []).includes(slug))
      .map((e) => ({ type: "Experience", ref: e.id, titre: `${e.poste} — ${e.structure}` })),
    ...(profil.formations ?? [])
      .filter((f) => (f.competences ?? []).includes(slug))
      .map((f) => ({ type: "Formation", ref: f.id, titre: `${f.diplome} — ${f.ecole}` })),
  ];
}

export function fallbackCompetence(slug: string): CompetenceDetail | null {
  const c = competenceBySlug(slug);
  if (!c) return null;
  return { ...c, usages: usagesOf(slug) };
}

export function fallbackStatsCategories(): StatCategorieCompetence[] {
  const groups = new Map<string, Competence[]>();
  for (const c of competences) groups.set(c.categorie, [...(groups.get(c.categorie) ?? []), c]);
  return [...groups.entries()].map(([categorie, list]) => ({
    categorie,
    total: list.length,
    competences: list.map((c) => ({ slug: c.slug, nom: c.nom, categorie: c.categorie })),
  }));
}

export function fallbackTopCompetences(limit: number): TopCompetence[] {
  return competences
    .map((c) => ({
      slug: c.slug,
      nom: c.nom,
      categorie: c.categorie,
      total: usagesOf(c.slug).length,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

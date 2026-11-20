// Types mirroring the FastAPI "Portfolio Polyglotte API" OpenAPI schemas.

export type Niveau = "Débutant" | "Intermédiaire" | "Avancé" | "Expert";

export interface Competence {
  slug: string;
  nom: string;
  categorie: string;
  niveau?: Niveau | null;
  mots_cles?: string[];
}

export interface CompetenceUsage {
  type: string;
  ref: string;
  titre: string;
}

export interface CompetenceDetail extends Competence {
  usages?: CompetenceUsage[];
}

export interface CompetenceLight {
  slug: string;
  nom: string;
  categorie?: string | null;
}

export interface Contact {
  email?: string | null;
  github?: string | null;
  linkedin?: string | null;
}

export interface Experience {
  id: string;
  poste: string;
  structure: string;
  type: string;
  debut: string;
  fin?: string | null;
  missions?: string[];
  competences?: string[];
}

export interface Formation {
  id: string;
  ecole: string;
  diplome: string;
  debut: string;
  fin?: string | null;
  competences?: string[];
}

export interface Personne {
  slug: string;
  prenom: string;
  nom: string;
  titre: string;
  bio: string;
  contacts?: Contact;
  formations?: Formation[];
  experiences?: Experience[];
  competences?: string[];
}

export interface PersonneDetail {
  profil: Personne;
  competences_graphe?: Competence[];
}

export interface Projet {
  slug: string;
  titre: string;
  description?: string | null;
  date_realisation: string;
  contexte_id: string;
  personne_slugs?: string[];
  skills_slugs?: string[];
}

export interface ProjetSimilaire {
  slug: string;
  titre: string;
  annee?: number | null;
  score: number;
}

export interface ProjetDetail extends Projet {
  competences_detaillees?: CompetenceLight[];
  projets_similaires?: ProjetSimilaire[];
}

export interface StatCategorieCompetence {
  categorie: string;
  total: number;
  competences?: string[];
}

export interface StatCompetenceProjet {
  competence_slug: string;
  nb_projets: number;
}

/** Normalised shape for /api/competences/stats/top (its OpenAPI schema is untyped). */
export interface TopCompetence {
  slug: string;
  nom: string;
  usages: number;
}

export type DataSource = "api" | "demo";

export interface Sourced<T> {
  data: T;
  source: DataSource;
}

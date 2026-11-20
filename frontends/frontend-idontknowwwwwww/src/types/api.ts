/**
 * Types mirroring the Portfolio Polyglotte OpenAPI contract (v0.1.0).
 * Optional fields reflect fields that are not marked `required` in the contract.
 */

export type Niveau = "Débutant" | "Intermédiaire" | "Avancé" | "Expert";

export interface HealthResponse {
  status?: string;
}

export interface Contact {
  email?: string | null;
  github?: string | null;
  linkedin?: string | null;
}

export interface Formation {
  id: string;
  ecole: string;
  diplome: string;
  debut: string;
  fin?: string | null;
  competences?: string[];
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

export interface Competence {
  slug: string;
  nom: string;
  categorie: string;
  niveau?: Niveau | null;
  mots_cles?: string[];
}

/** Usage types documented by the API: "Projet", "Formation", "Experience". */
export type CompetenceUsageType = "Projet" | "Formation" | "Experience";

export interface CompetenceUsage {
  /** Kept as string: the contract does not enumerate the values. */
  type: CompetenceUsageType | (string & {});
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
  competences?: CompetenceLight[];
}

export interface StatCompetenceProjet {
  competence_slug: string;
  nb_projets: number;
}

/**
 * GET /api/competences/stats/top has an untyped schema in the contract.
 * The client normalises whatever shape it returns into this structure.
 */
export interface TopCompetence {
  slug: string;
  nom: string;
  categorie: string | null;
  total: number;
}

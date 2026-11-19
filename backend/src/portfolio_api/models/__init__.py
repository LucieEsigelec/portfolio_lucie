"""Modèles Pydantic — doivent refléter EXACTEMENT les payloads de API_ROUTES.md.

TODO (équipe) : définir CandidatOut, ExperienceOut, FormationOut, ProjetOut, StatsOut, GraphOut…
"""

from __future__ import annotations
from typing import Literal, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "ok"


# ── Contact ──────────────────────────────────────────────────────
class Contact(BaseModel):
    email: Optional[str] = Field(None, examples=["bruce.wayne@wayne-ent.com"])
    github: Optional[str] = Field(None, examples=["https://github.com/bwayne"])
    linkedin: Optional[str] = Field(None, examples=["https://linkedin.com/in/bruce-wayne"])


# ── Competence (Collection séparée dans Mongo + Nœud Neo4j) ───────
class Competence(BaseModel):
    slug: str = Field(..., examples=["python"])
    nom: str = Field(..., examples=["Python"])
    categorie: str = Field(..., examples=["Langages", "Data / IA", "DevOps", "Bases de données"])
    niveau: Optional[Literal["Débutant", "Intermédiaire", "Avancé", "Expert"]] = None
    mots_cles: list[str] = Field(default_factory=list)


# ── Formation (Imbriqué dans Personne + Nœud Neo4j) ──────────────
class Formation(BaseModel):
    id: str = Field(..., examples=["form-esigelec-2024"])
    ecole: str = Field(..., examples=["ESIGELEC Rouen"])
    diplome: str = Field(..., examples=["Diplôme d'Ingénieur - Big Data & IA"])
    debut: str = Field(..., examples=["2024-09"])
    fin: Optional[str] = Field(None, examples=["2027-04"])
    competences: list[str] = Field(default_factory=list, examples=[["python", "sql"]])


# ── Experience (Imbriqué dans Personne + Nœud Neo4j) ─────────────
class Experience(BaseModel):
    id: str = Field(..., examples=["exp-wayne-2026"])
    poste: str = Field(..., examples=["Data Engineer"])
    structure: str = Field(..., examples=["Wayne Enterprises"])
    type: str = Field(..., examples=["Stage", "CDI", "Alternance"])
    debut: str = Field(..., examples=["2026-04"])
    fin: Optional[str] = Field(None, examples=["2026-09"])
    missions: list[str] = Field(default_factory=list)
    competences: list[str] = Field(default_factory=list, examples=[["python", "mongodb"]])


# ── Personne (Collection Mongo + Propriété dans Neo4j) ───────────
class Personne(BaseModel):
    slug: str = Field(..., examples=["bruce-wayne"])
    prenom: str = Field(..., examples=["Bruce"])
    nom: str = Field(..., examples=["Wayne"])
    titre: str = Field(..., examples=["Ingénieur Big Data & IA"])
    bio: str = Field(..., examples=["Motivé, recherche..."])
    contacts: Contact = Field(default_factory=Contact)
    formations: list[Formation] = Field(default_factory=list)
    experiences: list[Experience] = Field(default_factory=list)
    competences: list[str] = Field(default_factory=list, examples=[["python", "docker"]])


# ── Projet (Collection Mongo + Nœud Neo4j) ───────────────────────
class Projet(BaseModel):
    slug: str = Field(..., examples=["rouen-portfolio"])
    titre: str = Field(..., examples=["Portfolio Hybride MongoDB & Neo4j"])
    description: Optional[str] = None
    date_realisation: str = Field(..., examples=["2026"])
    contexte_id: str = Field(..., examples=["form-esigelec-2024"])
    personne_slugs: list[str] = Field(default_factory=list, examples=[["bruce-wayne"]])
    skills_slugs: list[str] = Field(default_factory=list, examples=[["python", "neo4j"]])
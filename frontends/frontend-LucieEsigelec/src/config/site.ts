// Site-level settings that the API does not provide.
import cv from "@/assets/cv-lucie-reichardt.pdf.asset.json";

/** Public URL of the CV PDF. When null, the "Télécharger CV" button asks for it by e-mail instead. */
export const CV_URL: string | null = cv.url;

/** Slug of the portfolio owner in /api/personnes. Falls back to the first person named Lucie. */
export const OWNER_SLUG = "lucie-reichardt";

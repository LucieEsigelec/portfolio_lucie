import { Download, Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CV_URL } from "@/config/site";
import { usePersonne } from "@/services/queries";

/** Direct action buttons — no contact form. */
export function ContactActions({ compact = false }: { compact?: boolean }) {
  const { data } = usePersonne();
  const c = data?.data.profil.contacts ?? {};
  const email = c.email ?? "";
  const cvHref = CV_URL ?? `mailto:${email}?subject=${encodeURIComponent("Demande de CV — Portfolio")}`;
  const size = compact ? "sm" : "default";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button asChild variant="accent" size={size}>
        <a href={cvHref} {...(CV_URL ? { download: true } : {})}>
          <Download /> Télécharger CV
        </a>
      </Button>
      {c.github && (
        <Button asChild variant="paper" size={size}>
          <a href={c.github} target="_blank" rel="noreferrer">
            <Github /> GitHub
          </a>
        </Button>
      )}
      {c.linkedin && (
        <Button asChild variant="paper" size={size}>
          <a href={c.linkedin} target="_blank" rel="noreferrer">
            <Linkedin /> LinkedIn
          </a>
        </Button>
      )}
      {email && (
        <Button asChild variant="paper" size={size}>
          <a href={`mailto:${email}`}>
            <Mail /> Email
          </a>
        </Button>
      )}
    </div>
  );
}

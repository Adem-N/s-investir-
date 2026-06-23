/**
 * URL de base publique du site, résolue automatiquement selon l'environnement.
 * Sert notamment de `metadataBase` (→ URLs absolues des images Open Graph).
 *
 * Priorité :
 *   1. NEXT_PUBLIC_SITE_URL      — override explicite (domaine custom, etc.)
 *   2. VERCEL_PROJECT_PRODUCTION_URL — domaine de prod stable (Vercel)
 *   3. VERCEL_URL                — URL du déploiement courant (preview)
 *   4. http://localhost:3000     — développement local
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

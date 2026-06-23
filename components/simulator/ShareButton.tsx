"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

/**
 * Partage le lien de la simulation courante (URL encodée → reproduit le
 * scénario + déclenche l'image OG dynamique). Web Share API sur mobile,
 * copie presse-papiers sinon.
 */
export function ShareButton({ query }: { query: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}${window.location.pathname}?${query}`;
    const data = {
      title: "Ma simulation crypto — S'investir",
      text: "Regarde ce qu'aurait rapporté cet investissement crypto :",
      url,
    };
    // Mobile : feuille de partage native.
    if (typeof navigator.share === "function" && /Mobi|Android/i.test(navigator.userAgent)) {
      try {
        await navigator.share(data);
        return;
      } catch {
        /* partage annulé → on retombe sur la copie */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copiez le lien de votre simulation :", url);
    }
  }

  return (
    <Button variant="outline" onClick={share} className="w-full" aria-live="polite">
      {copied ? (
        "Lien copié ✓"
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Partager ma simulation
        </>
      )}
    </Button>
  );
}

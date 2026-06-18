"use client";

import { useEffect } from "react";

/**
 * Publie la hauteur du widget vers la page hôte (postMessage) pour permettre
 * un redimensionnement automatique de l'iframe. Voir le snippet du README.
 */
export function EmbedAutoResize() {
  useEffect(() => {
    const post = () => {
      const height = document.documentElement.scrollHeight;
      window.parent?.postMessage(
        { type: "sinvestir-simulator:height", height },
        "*"
      );
    };
    post();
    const ro = new ResizeObserver(post);
    ro.observe(document.body);
    window.addEventListener("load", post);
    return () => {
      ro.disconnect();
      window.removeEventListener("load", post);
    };
  }, []);

  return null;
}

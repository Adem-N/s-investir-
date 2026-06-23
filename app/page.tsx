import type { Metadata } from "next";
import { SimulatorScreen } from "@/components/simulator/SimulatorScreen";
import { decodeScenario } from "@/lib/share";

type SearchParams = Record<string, string | string[] | undefined>;

function toURLSearchParams(sp: SearchParams): URLSearchParams {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") p.set(k, v);
  }
  return p;
}

// Métadonnées dynamiques : si l'URL porte une simulation, l'image OG est
// générée à la volée avec la plus-value (carte partageable à fort CTR).
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const params = toURLSearchParams(sp);
  if (!decodeScenario(params)) return {};
  const ogUrl = `/api/og?${params.toString()}`;
  return {
    openGraph: { images: [{ url: ogUrl, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", images: [ogUrl] },
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const initial = decodeScenario(toURLSearchParams(sp)) ?? undefined;
  return <SimulatorScreen initial={initial} />;
}

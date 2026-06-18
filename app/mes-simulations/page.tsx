import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SavedList } from "@/components/simulator/SavedList";

export const metadata: Metadata = {
  title: "Mes simulations | S'investir",
};

export default function MesSimulationsPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-10 pt-10 sm:px-6">
        <h1 className="mb-1 text-2xl font-bold sm:text-3xl">Mes simulations</h1>
        <p className="mb-7 text-sm text-muted">
          Retrouvez et comparez vos simulations sauvegardées.
        </p>
        <SavedList />
      </main>
      <Footer />
    </div>
  );
}

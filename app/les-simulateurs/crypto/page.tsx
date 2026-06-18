import type { Metadata } from "next";
import { SimulatorScreen } from "@/components/simulator/SimulatorScreen";

// Route qui suit la convention de la suite (simulateurs.sinvestir.fr/les-simulateurs/…)
export const metadata: Metadata = {
  title: "Simulateur crypto | Les simulateurs S'investir",
};

export default function CryptoSimulatorPage() {
  return <SimulatorScreen />;
}

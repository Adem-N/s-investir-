import Link from "next/link";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-white"
    >
      {children}
    </Link>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-surface/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Accueil">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <NavLink href="/">Les simulateurs</NavLink>
          <NavLink href="https://simulateurs.sinvestir.fr/les-comparateurs">
            Les comparateurs
          </NavLink>
          <NavLink href="/mes-simulations">Mes simulations</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/mes-simulations" className="lg:hidden">
            <Button variant="ghost" size="sm">
              Mes simulations
            </Button>
          </Link>
          <a
            href="https://simulateurs.sinvestir.fr/formation-offerte"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="gold" size="sm">
              Formation offerte
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}

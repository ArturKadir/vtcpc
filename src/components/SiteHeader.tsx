import { Link } from "@tanstack/react-router";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/lib/cart";

const links = [
  { to: "/kompiuteriai", label: "Kompiuteriai" },
  { to: "/konfiguratorius", label: "Konfigūratorius" },
  { to: "/salygos", label: "Pirkimo sąlygos" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <img
            src="/logo.png"
            alt="VTCPC logotipas"
            className="h-8 w-8 rounded-full"
          />
          <span className="text-lg font-bold tracking-tight">VTCPC</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="transition-colors hover:text-foreground [&.active]:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            to="/krepselis"
            aria-label="Krepšelis"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          <button
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Uždaryti meniu" : "Atidaryti meniu"}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-secondary md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-4 py-3 md:hidden">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-2 py-3 text-base font-medium transition-colors hover:bg-secondary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

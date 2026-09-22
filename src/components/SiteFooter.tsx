import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-lg font-bold">VTCPC</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Surenkame kompiuterius Lietuvoje. Kiekvienas kompiuteris patikrinamas prieš išsiuntimą.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Informacija</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>
              <Link to="/salygos" className="hover:text-foreground">
                Pirkimo sąlygos
              </Link>
            </li>
            <li>
              <Link to="/salygos" hash="garantija" className="hover:text-foreground">
                Garantija 2 metai
              </Link>
            </li>
            <li>
              <Link to="/salygos" hash="grazinimas" className="hover:text-foreground">
                Grąžinimas per 14 dienų
              </Link>
            </li>
            <li>
              <Link to="/salygos" hash="pristatymas" className="hover:text-foreground">
                Pristatymas
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Kontaktai</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>
              <a href="mailto:vtc.tarmasevic@gmail.com" className="hover:text-foreground">
                vtc.tarmasevic@gmail.com
              </a>
            </li>
            <li>Vilnius, Lietuva</li>
            <li>Kainos nurodytos su PVM</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} VTCPC, MB · Vilnius, Lietuva
      </div>
    </footer>
  );
}

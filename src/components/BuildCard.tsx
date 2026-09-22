import { Link } from "@tanstack/react-router";
import { Cpu, HardDrive, MemoryStick, MonitorPlay } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatEur, useCart } from "@/lib/cart";
import type { Build } from "@/lib/shop.functions";

export function AvailabilityBadge({ availability }: { availability: string }) {
  const inStock = availability === "in_stock";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        inStock ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${inStock ? "bg-primary" : "bg-muted-foreground"}`} />
      {inStock ? "Yra sandėlyje" : "Pagal užsakymą"}
    </span>
  );
}

export function BuildCard({ build }: { build: Build }) {
  const { add } = useCart();

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
      <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-card-foreground">{build.name}</h3>
          <p className="text-xs text-muted-foreground">{build.tagline}</p>
        </div>
        <AvailabilityBadge availability={build.availability} />
      </div>

      <ul className="flex-1 space-y-2 px-5 py-4 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <Cpu className="h-4 w-4 shrink-0 text-primary" /> {build.cpu}
        </li>
        <li className="flex items-center gap-2">
          <MonitorPlay className="h-4 w-4 shrink-0 text-primary" /> {build.gpu}
        </li>
        <li className="flex items-center gap-2">
          <MemoryStick className="h-4 w-4 shrink-0 text-primary" /> {build.ram}
        </li>
        <li className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 shrink-0 text-primary" /> {build.storage}
        </li>
      </ul>

      <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
        <p className="text-xl font-bold">{formatEur(Number(build.price_eur))}</p>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/kompiuteriai/$slug" params={{ slug: build.slug }}>
              Plačiau
            </Link>
          </Button>
          <Button
            size="sm"
            onClick={() =>
              add({
                id: build.id,
                label: build.name,
                detail: `${build.cpu} · ${build.gpu}`,
                price_eur: Number(build.price_eur),
                kind: "cart",
              })
            }
          >
            Į krepšelį
          </Button>
        </div>
      </div>
    </article>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight, PackageCheck, ShieldCheck, Truck, Wrench } from "lucide-react";

import { BuildCard } from "@/components/BuildCard";
import { CaseReveal } from "@/components/CaseReveal";
import { Button } from "@/components/ui/button";
import { listBuilds } from "@/lib/shop.functions";

const buildsQuery = queryOptions({ queryKey: ["builds"], queryFn: () => listBuilds() });

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(buildsQuery),
  head: () => ({
    meta: [
      { title: "VTCPC — surinkti kompiuteriai Lietuvoje" },
      {
        name: "description",
        content:
          "VTCPC surenka žaidimų ir darbo kompiuterius Lietuvoje. Pasirinkite paruoštą sąranką arba susikonfigūruokite savo. Kainos su PVM, 2 metų garantija.",
      },
      { property: "og:title", content: "VTCPC — surinkti kompiuteriai Lietuvoje" },
      {
        property: "og:description",
        content: "Paruoštos sąrankos ir konfigūratorius. Pristatymas visoje Lietuvoje.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const benefits = [
  { icon: Wrench, title: "Surenkame patys", text: "Kiekvieną kompiuterį surenkame ir testuojame ranka Lietuvoje." },
  { icon: ShieldCheck, title: "2 metų garantija", text: "Gedimo atveju sutvarkome arba pakeičiame komponentą." },
  { icon: Truck, title: "Pristatymas", text: "Pristatome visoje Lietuvoje, 1–3 darbo dienos po surinkimo." },
  { icon: PackageCheck, title: "Grąžinimas 14 d.", text: "Persigalvojote? Grąžinkite per 14 dienų." },
];

function Home() {
  const { data: builds } = useSuspenseQuery(buildsQuery);
  const featured = builds.slice(0, 3);

  return (
    <div>
      <section className="bg-ink px-4 py-14 text-ink-foreground">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">VTCPC</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Kompiuteris, surinktas būtent jums
            </h1>
            <p className="mt-4 max-w-xl text-base text-ink-foreground/75">
              Pasirinkite paruoštą sąranką iš sąrašo arba susirinkite savo kompiuterį detalė po
              detalės. Kaina matoma iš karto, užsakymą patvirtiname telefonu.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/kompiuteriai">
                  Žiūrėti kompiuterius <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-ink-foreground/25 bg-transparent text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground"
              >
                <Link to="/konfiguratorius">Susirinkti savo</Link>
              </Button>
            </div>
          </div>
          <div className="pb-10">
            <CaseReveal />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="rounded-2xl border border-border bg-card p-5">
              <benefit.icon className="h-5 w-5 text-primary" />
              <p className="mt-3 font-semibold">{benefit.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{benefit.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Populiariausios sąrankos</h2>
            <p className="mt-1 text-sm text-muted-foreground">Kainos su PVM.</p>
          </div>
          <Link to="/kompiuteriai" className="text-sm font-medium text-primary hover:underline">
            Visi kompiuteriai
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((build) => (
            <BuildCard key={build.id} build={build} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-6xl px-4">
        <div className="rounded-3xl bg-accent p-8 text-accent-foreground sm:p-12">
          <h2 className="text-2xl font-bold">Nerandate tinkamo?</h2>
          <p className="mt-2 max-w-xl text-sm">
            Konfigūratoriuje pasirinkite korpusą, procesorių, vaizdo plokštę ir kitas detales – kaina
            skaičiuojama iš karto.
          </p>
          <Button asChild className="mt-6">
            <Link to="/konfiguratorius">Atidaryti konfigūratorių</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { AvailabilityBadge } from "@/components/BuildCard";
import { Button } from "@/components/ui/button";
import { formatEur, useCart } from "@/lib/cart";
import { getBuild } from "@/lib/shop.functions";

const buildQuery = (slug: string) =>
  queryOptions({ queryKey: ["build", slug], queryFn: () => getBuild({ data: { slug } }) });

export const Route = createFileRoute("/kompiuteriai/$slug")({
  loader: async ({ context, params }) => {
    const build = await context.queryClient.ensureQueryData(buildQuery(params.slug));
    if (!build) throw notFound();
    return build;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Kompiuteris"} — VTCPC` },
      {
        name: "description",
        content:
          loaderData?.description ?? "VTCPC surinktas kompiuteris su 2 metų garantija.",
      },
      { property: "og:title", content: `${loaderData?.name ?? "Kompiuteris"} — VTCPC` },
      { property: "og:description", content: loaderData?.tagline ?? "VTCPC kompiuteris" },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="text-lg font-semibold">Nepavyko įkelti kompiuterio</p>
      <Button asChild className="mt-6">
        <Link to="/kompiuteriai">Grįžti į sąrašą</Link>
      </Button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="text-lg font-semibold">Tokio kompiuterio nėra</p>
      <Button asChild className="mt-6">
        <Link to="/kompiuteriai">Grįžti į sąrašą</Link>
      </Button>
    </div>
  ),
  component: BuildPage,
});

function BuildPage() {
  const { slug } = Route.useParams();
  const { data: build } = useSuspenseQuery(buildQuery(slug));
  const { add } = useCart();

  if (!build) return null;

  const specs = [
    ["Procesorius", build.cpu],
    ["Vaizdo plokštė", build.gpu],
    ["Operatyvioji atmintis", build.ram],
    ["Diskas", build.storage],
    ["Maitinimo blokas", build.psu],
    ["Korpusas", build.pc_case],
  ].filter(([, value]) => value);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link to="/kompiuteriai" className="text-sm text-primary hover:underline">
        ← Visi kompiuteriai
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold">{build.name}</h1>
        <AvailabilityBadge availability={build.availability} />
      </div>
      <p className="mt-2 text-muted-foreground">{build.tagline}</p>

      <div className="mt-8 grid gap-8 md:grid-cols-[2fr_1fr]">
        <div>
          <p className="text-sm leading-relaxed text-foreground">{build.description}</p>
          <dl className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
            {specs.map(([label, value]) => (
              <div key={label} className="flex flex-wrap justify-between gap-2 px-5 py-3 text-sm">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-5 md:sticky md:top-24">
          <p className="text-3xl font-bold">{formatEur(Number(build.price_eur))}</p>
          <p className="mt-1 text-xs text-muted-foreground">Kaina su PVM</p>
          <Button
            className="mt-5 w-full"
            size="lg"
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
          <p className="mt-4 text-xs text-muted-foreground">
            Užsakymą patvirtiname telefonu. Garantija 2 metai, grąžinimas per 14 dienų.
          </p>
        </aside>
      </div>
    </div>
  );
}

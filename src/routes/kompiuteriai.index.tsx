import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { BuildCard } from "@/components/BuildCard";
import { Button } from "@/components/ui/button";
import { listBuilds } from "@/lib/shop.functions";

const buildsQuery = queryOptions({ queryKey: ["builds"], queryFn: () => listBuilds() });

export const Route = createFileRoute("/kompiuteriai/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(buildsQuery),
  head: () => ({
    meta: [
      { title: "Kompiuteriai — VTCPC" },
      {
        name: "description",
        content:
          "Visos VTCPC kompiuterių sąrankos: nuo biuro iki 4K žaidimų. Rūšiuokite pagal kainą, matykite, kas yra sandėlyje.",
      },
      { property: "og:title", content: "Kompiuteriai — VTCPC" },
      { property: "og:description", content: "VTCPC surinktų kompiuterių sąrašas su kainomis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Catalog,
});

type Sort = "price-asc" | "price-desc" | "default";

function Catalog() {
  const { data: builds } = useSuspenseQuery(buildsQuery);
  const [sort, setSort] = useState<Sort>("default");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const visible = useMemo(() => {
    let list = [...builds];
    if (onlyInStock) list = list.filter((build) => build.availability === "in_stock");
    if (maxPrice) list = list.filter((build) => Number(build.price_eur) <= maxPrice);
    if (sort === "price-asc") list.sort((a, b) => Number(a.price_eur) - Number(b.price_eur));
    if (sort === "price-desc") list.sort((a, b) => Number(b.price_eur) - Number(a.price_eur));
    return list;
  }, [builds, sort, onlyInStock, maxPrice]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Kompiuteriai</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Visos kainos su PVM. „Pagal užsakymą“ – surenkame per 3–5 darbo dienas.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as Sort)}
          aria-label="Rūšiuoti"
          className="h-10 rounded-lg border border-input bg-card px-3 text-sm"
        >
          <option value="default">Rūšiuoti: siūloma</option>
          <option value="price-asc">Kaina: nuo pigiausio</option>
          <option value="price-desc">Kaina: nuo brangiausio</option>
        </select>

        <select
          value={maxPrice ?? ""}
          onChange={(event) => setMaxPrice(event.target.value ? Number(event.target.value) : null)}
          aria-label="Biudžetas"
          className="h-10 rounded-lg border border-input bg-card px-3 text-sm"
        >
          <option value="">Bet kokia kaina</option>
          <option value="800">iki 800 €</option>
          <option value="1500">iki 1500 €</option>
          <option value="2500">iki 2500 €</option>
        </select>

        <Button
          type="button"
          variant={onlyInStock ? "default" : "outline"}
          onClick={() => setOnlyInStock((value) => !value)}
        >
          Tik sandėlyje
        </Button>
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Pagal šiuos filtrus kompiuterių nėra. Pabandykite pakeisti biudžetą.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((build) => (
            <BuildCard key={build.id} build={build} />
          ))}
        </div>
      )}
    </div>
  );
}

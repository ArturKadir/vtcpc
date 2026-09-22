import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { formatEur, useCart } from "@/lib/cart";
import { listParts, type Part } from "@/lib/shop.functions";

const partsQuery = queryOptions({ queryKey: ["parts"], queryFn: () => listParts() });

const CATEGORIES: { key: string; label: string }[] = [
  { key: "case", label: "Korpusas" },
  { key: "cpu", label: "Procesorius" },
  { key: "gpu", label: "Vaizdo plokštė" },
  { key: "ram", label: "Operatyvioji atmintis" },
  { key: "storage", label: "Diskas" },
  { key: "psu", label: "Maitinimo blokas" },
  { key: "cooling", label: "Aušinimas" },
  { key: "os", label: "Operacinė sistema" },
];

export const Route = createFileRoute("/konfiguratorius")({
  loader: ({ context }) => context.queryClient.ensureQueryData(partsQuery),
  head: () => ({
    meta: [
      { title: "Konfigūratorius — VTCPC" },
      {
        name: "description",
        content:
          "Susirinkite savo kompiuterį: pasirinkite korpusą, procesorių, vaizdo plokštę ir kitas detales – kaina skaičiuojama iš karto.",
      },
      { property: "og:title", content: "Konfigūratorius — VTCPC" },
      { property: "og:description", content: "Susirinkite kompiuterį detalė po detalės." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Configurator,
});

function Configurator() {
  const { data: parts } = useSuspenseQuery(partsQuery);
  const { add } = useCart();
  const navigate = useNavigate();

  const byCategory = useMemo(() => {
    const map = new Map<string, Part[]>();
    for (const part of parts) {
      map.set(part.category, [...(map.get(part.category) ?? []), part]);
    }
    return map;
  }, [parts]);

  const [selection, setSelection] = useState<Record<string, string>>({});

  const selected = CATEGORIES.map((category) => {
    const options = byCategory.get(category.key) ?? [];
    const chosenId = selection[category.key];
    const part = options.find((option) => option.id === chosenId) ?? null;
    return { category, options, part };
  });

  const total = selected.reduce((sum, row) => sum + Number(row.part?.price_eur ?? 0), 0);
  const missing = selected.filter(
    (row) => row.options.length > 0 && !row.part && ["case", "cpu", "ram", "storage", "psu"].includes(row.category.key),
  );

  function addToCart() {
    const chosen = selected.filter((row) => row.part);
    if (chosen.length === 0) return;
    add({
      id: `config-${Date.now()}`,
      label: "Kompiuteris pagal užsakymą",
      detail: chosen.map((row) => `${row.category.label}: ${row.part!.name}`).join("; "),
      price_eur: total,
      kind: "config",
    });
    navigate({ to: "/krepselis" });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Konfigūratorius</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pasirinkite detales – kaina keičiasi iš karto. Detalės, kurių šiuo metu nėra sandėlyje,
        pažymėtos; jas užsakome papildomai.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          {selected.map(({ category, options, part }) => (
            <section key={category.key} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">{category.label}</h2>
                {part && <span className="text-sm font-medium">{formatEur(Number(part.price_eur))}</span>}
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {options.map((option) => {
                  const active = part?.id === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setSelection((prev) => ({
                          ...prev,
                          [category.key]: active ? "" : option.id,
                        }))
                      }
                      className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                        active
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-secondary"
                      }`}
                    >
                      <span className="block font-medium">{option.name}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {formatEur(Number(option.price_eur))}
                        {option.in_stock ? "" : " · pagal užsakymą"}
                      </span>
                    </button>
                  );
                })}
                {options.length === 0 && (
                  <p className="text-sm text-muted-foreground">Šios kategorijos detalių dar nėra.</p>
                )}
              </div>
            </section>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24">
          <h2 className="font-semibold">Jūsų konfigūracija</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {selected.map(({ category, part }) => (
              <li key={category.key} className="flex justify-between gap-3">
                <span className="text-muted-foreground">{category.label}</span>
                <span className="text-right font-medium">{part ? part.name : "—"}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Iš viso su PVM</span>
            <span className="text-2xl font-bold">{formatEur(total)}</span>
          </div>
          {missing.length > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              Dar nepasirinkta: {missing.map((row) => row.category.label.toLowerCase()).join(", ")}.
            </p>
          )}
          <Button className="mt-5 w-full" size="lg" disabled={missing.length > 0} onClick={addToCart}>
            Į krepšelį
          </Button>
        </aside>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatEur, useCart } from "@/lib/cart";
import { createOrder } from "@/lib/shop.functions";

export const Route = createFileRoute("/krepselis")({
  head: () => ({
    meta: [
      { title: "Krepšelis — VTCPC" },
      {
        name: "description",
        content: "Pateikite užsakymo užklausą VTCPC – susisieksime telefonu ir patvirtinsime kainą.",
      },
      { property: "og:title", content: "Krepšelis — VTCPC" },
      { property: "og:description", content: "Užsakymo užklausa be išankstinio mokėjimo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, remove, setQuantity, total, clear } = useCart();
  const submitOrder = useServerFn(createOrder);
  const [form, setForm] = useState({ customer_name: "", phone: "", email: "", note: "" });
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (items.length === 0) return;
    setState("sending");
    setError(null);
    try {
      await submitOrder({
        data: {
          customer_name: form.customer_name,
          phone: form.phone,
          email: form.email,
          note: form.note,
          kind: items.some((item) => item.kind === "config") ? "config" : "cart",
          items: items.map((item) => ({
            label: item.label,
            detail: item.detail ?? "",
            quantity: item.quantity,
            price_eur: item.price_eur,
          })),
        },
      });
      clear();
      setState("done");
    } catch {
      setState("idle");
      setError("Nepavyko išsiųsti užklausos. Pabandykite dar kartą arba parašykite el. paštu.");
    }
  }

  if (state === "done") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Ačiū! Užklausa gauta.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Susisieksime telefonu, patvirtinsime konfigūraciją, kainą ir pristatymo laiką.
        </p>
        <Button asChild className="mt-8">
          <Link to="/kompiuteriai">Grįžti į parduotuvę</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Krepšelis</h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">Krepšelis tuščias.</p>
          <Button asChild className="mt-6">
            <Link to="/kompiuteriai">Žiūrėti kompiuterius</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <div className="min-w-[12rem] flex-1">
                  <p className="font-semibold">{item.label}</p>
                  {item.detail && (
                    <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                  )}
                </div>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={item.quantity}
                  aria-label="Kiekis"
                  onChange={(event) => setQuantity(item.id, Number(event.target.value))}
                  className="h-10 w-16 rounded-lg border border-input bg-background px-2 text-sm"
                />
                <p className="w-24 text-right font-semibold">
                  {formatEur(item.price_eur * item.quantity)}
                </p>
                <button
                  onClick={() => remove(item.id)}
                  aria-label="Pašalinti"
                  className="text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="h-fit space-y-3 rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Iš viso su PVM</span>
              <span className="text-2xl font-bold">{formatEur(total)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Mokėti dabar nereikia – tai užsakymo užklausa. Susisieksime telefonu.
            </p>
            <Input
              required
              placeholder="Vardas"
              value={form.customer_name}
              onChange={(event) => setForm({ ...form, customer_name: event.target.value })}
            />
            <Input
              required
              placeholder="Telefonas"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
            />
            <Input
              type="email"
              placeholder="El. paštas (nebūtina)"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
            <Textarea
              placeholder="Komentaras (nebūtina)"
              value={form.note}
              onChange={(event) => setForm({ ...form, note: event.target.value })}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={state === "sending"}>
              {state === "sending" ? "Siunčiama…" : "Pateikti užklausą"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

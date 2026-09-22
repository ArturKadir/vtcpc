import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/salygos")({
  head: () => ({
    meta: [
      { title: "Pirkimo sąlygos — VTCPC" },
      {
        name: "description",
        content:
          "VTCPC pirkimo sąlygos: kainos su PVM, 2 metų garantija, grąžinimas per 14 dienų, pristatymas Lietuvoje.",
      },
      { property: "og:title", content: "Pirkimo sąlygos — VTCPC" },
      { property: "og:description", content: "Garantija, grąžinimas, pristatymas ir rekvizitai." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Pirkimo sąlygos</h1>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Kainos</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Visos svetainėje nurodytos kainos yra eurais ir su PVM. Galutinę kainą patvirtiname
          susisiekę telefonu prieš pradedant surinkimą.
        </p>
      </section>

      <section id="garantija" className="mt-8 scroll-mt-24">
        <h2 className="text-xl font-semibold">Garantija</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Visiems kompiuteriams taikoma 2 metų garantija. Garantinio gedimo atveju komponentą
          pakeičiame arba suremontuojame. Garantija netaikoma mechaniniams pažeidimams ir
          savarankiškai atliktiems pakeitimams.
        </p>
      </section>

      <section id="grazinimas" className="mt-8 scroll-mt-24">
        <h2 className="text-xl font-semibold">Grąžinimas</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Pirkėjas turi teisę atsisakyti nuotoliniu būdu sudarytos sutarties per 14 dienų nuo prekės
          gavimo. Individualiai pagal pirkėjo pageidavimus surinktoms konfigūracijoms ši teisė gali
          būti netaikoma pagal LR teisės aktus – apie tai informuojame prieš patvirtinant užsakymą.
        </p>
      </section>

      <section id="pristatymas" className="mt-8 scroll-mt-24">
        <h2 className="text-xl font-semibold">Pristatymas</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Pristatome visoje Lietuvoje. Sandėlyje esančius kompiuterius išsiunčiame per 1–3 darbo
          dienas, surenkamus pagal užsakymą – per 3–5 darbo dienas. Pristatymo kainą ir laiką
          patvirtiname telefonu.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Rekvizitai</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          VTCPC, MB · Vilnius, Lietuva · el. paštas vtc.tarmasevic@gmail.com
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Įmonės kodą, PVM kodą ir banko sąskaitą įrašysime, kai gausime tikslius duomenis.
        </p>
      </section>
    </div>
  );
}

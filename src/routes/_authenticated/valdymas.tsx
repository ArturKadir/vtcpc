import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { formatEur } from "@/lib/cart";
import type { Build, Part } from "@/lib/shop.functions";

export const Route = createFileRoute("/_authenticated/valdymas")({
  head: () => ({
    meta: [
      { title: "Prekių valdymas — VTCPC" },
      { name: "description", content: "VTCPC savininko sritis: kompiuteriai, detalės, užsakymai." },
      { property: "og:title", content: "Prekių valdymas — VTCPC" },
      { property: "og:description", content: "Kompiuterių ir detalių valdymas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

type Tab = "builds" | "parts" | "orders";

const EMPTY_BUILD = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  price_eur: 0,
  availability: "made_to_order",
  cpu: "",
  gpu: "",
  ram: "",
  storage: "",
  psu: "",
  pc_case: "",
  sort_order: 99,
  is_published: true,
};

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("builds");

  const roleQuery = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .maybeSingle();
      return Boolean(data);
    },
  });

  const claim = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("claim_admin");
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["is-admin"] }),
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (roleQuery.isLoading) {
    return <p className="mx-auto max-w-4xl px-4 py-20 text-sm text-muted-foreground">Kraunama…</p>;
  }

  if (!roleQuery.data) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-xl font-bold">Ši paskyra dar neturi savininko teisių</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Jei tai pirmoji VTCPC paskyra, paspauskite mygtuką – ji taps savininko paskyra.
        </p>
        <Button className="mt-6" onClick={() => claim.mutate()} disabled={claim.isPending}>
          Tapti savininku
        </Button>
        {claim.data === false && (
          <p className="mt-3 text-xs text-destructive">
            Savininkas jau priskirtas. Prisijunkite savininko paskyra.
          </p>
        )}
        <button onClick={signOut} className="mt-6 block w-full text-sm text-primary hover:underline">
          Atsijungti
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Prekių valdymas</h1>
        <Button variant="outline" onClick={signOut}>
          Atsijungti
        </Button>
      </div>

      <div className="mt-6 flex gap-2">
        {(
          [
            ["builds", "Kompiuteriai"],
            ["parts", "Detalės"],
            ["orders", "Užsakymai"],
          ] as const
        ).map(([key, label]) => (
          <Button key={key} variant={tab === key ? "default" : "outline"} onClick={() => setTab(key)}>
            {label}
          </Button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "builds" && <BuildsTab />}
        {tab === "parts" && <PartsTab />}
        {tab === "orders" && <OrdersTab />}
      </div>
    </div>
  );
}

function BuildsTab() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState({ ...EMPTY_BUILD });
  const [open, setOpen] = useState(false);

  const buildsQuery = useQuery({
    queryKey: ["admin-builds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("builds")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Build[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const slug =
        draft.slug.trim() ||
        draft.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") + "-" + Math.floor(Math.random() * 1000);
      const { error } = await supabase.from("builds").insert({ ...draft, slug });
      if (error) throw error;
    },
    onSuccess: () => {
      setDraft({ ...EMPTY_BUILD });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-builds"] });
      queryClient.invalidateQueries({ queryKey: ["builds"] });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Build> }) => {
      const { error } = await supabase.from("builds").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-builds"] });
      queryClient.invalidateQueries({ queryKey: ["builds"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("builds").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-builds"] });
      queryClient.invalidateQueries({ queryKey: ["builds"] });
    },
  });

  return (
    <div>
      <Button onClick={() => setOpen((value) => !value)}>
        <Plus className="mr-1 h-4 w-4" /> Pridėti kompiuterį
      </Button>

      {open && (
        <div className="mt-4 grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
          <Input
            placeholder="Pavadinimas"
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          />
          <Input
            placeholder="Trumpas aprašymas (pvz. Žaidimams 1080p)"
            value={draft.tagline}
            onChange={(event) => setDraft({ ...draft, tagline: event.target.value })}
          />
          <Input
            type="number"
            placeholder="Kaina, €"
            value={draft.price_eur}
            onChange={(event) => setDraft({ ...draft, price_eur: Number(event.target.value) })}
          />
          <select
            value={draft.availability}
            onChange={(event) => setDraft({ ...draft, availability: event.target.value })}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="made_to_order">Pagal užsakymą</option>
            <option value="in_stock">Yra sandėlyje</option>
          </select>
          <Input
            placeholder="Procesorius"
            value={draft.cpu}
            onChange={(event) => setDraft({ ...draft, cpu: event.target.value })}
          />
          <Input
            placeholder="Vaizdo plokštė"
            value={draft.gpu}
            onChange={(event) => setDraft({ ...draft, gpu: event.target.value })}
          />
          <Input
            placeholder="Atmintis"
            value={draft.ram}
            onChange={(event) => setDraft({ ...draft, ram: event.target.value })}
          />
          <Input
            placeholder="Diskas"
            value={draft.storage}
            onChange={(event) => setDraft({ ...draft, storage: event.target.value })}
          />
          <Input
            placeholder="Maitinimo blokas"
            value={draft.psu}
            onChange={(event) => setDraft({ ...draft, psu: event.target.value })}
          />
          <Input
            placeholder="Korpusas"
            value={draft.pc_case}
            onChange={(event) => setDraft({ ...draft, pc_case: event.target.value })}
          />
          <Textarea
            className="sm:col-span-2"
            placeholder="Aprašymas"
            value={draft.description}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
          />
          <Button
            className="sm:col-span-2"
            disabled={!draft.name || save.isPending}
            onClick={() => save.mutate()}
          >
            Išsaugoti
          </Button>
          {save.isError && (
            <p className="text-xs text-destructive sm:col-span-2">Nepavyko išsaugoti.</p>
          )}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {buildsQuery.data?.map((build) => (
          <div
            key={build.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <div className="min-w-[12rem] flex-1">
              <p className="font-semibold">{build.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatEur(Number(build.price_eur))} ·{" "}
                {build.availability === "in_stock" ? "sandėlyje" : "pagal užsakymą"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                update.mutate({ id: build.id, patch: { is_published: !build.is_published } })
              }
            >
              {build.is_published ? "Paslėpti" : "Rodyti"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                update.mutate({
                  id: build.id,
                  patch: {
                    availability: build.availability === "in_stock" ? "made_to_order" : "in_stock",
                  },
                })
              }
            >
              Keisti prieinamumą
            </Button>
            <button
              onClick={() => remove.mutate(build.id)}
              aria-label="Pašalinti"
              className="text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PartsTab() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState({ category: "cpu", name: "", price_eur: 0, in_stock: true });

  const partsQuery = useQuery({
    queryKey: ["admin-parts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parts")
        .select("*")
        .order("category", { ascending: true })
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Part[];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-parts"] });
    queryClient.invalidateQueries({ queryKey: ["parts"] });
  };

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("parts").insert(draft);
      if (error) throw error;
    },
    onSuccess: () => {
      setDraft({ category: draft.category, name: "", price_eur: 0, in_stock: true });
      invalidate();
    },
  });

  const toggle = useMutation({
    mutationFn: async (part: Part) => {
      const { error } = await supabase
        .from("parts")
        .update({ in_stock: !part.in_stock })
        .eq("id", part.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("parts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return (
    <div>
      <div className="grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-4">
        <select
          value={draft.category}
          onChange={(event) => setDraft({ ...draft, category: event.target.value })}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="case">Korpusas</option>
          <option value="cpu">Procesorius</option>
          <option value="gpu">Vaizdo plokštė</option>
          <option value="ram">Atmintis</option>
          <option value="storage">Diskas</option>
          <option value="psu">Maitinimas</option>
          <option value="cooling">Aušinimas</option>
          <option value="os">Operacinė sistema</option>
        </select>
        <Input
          placeholder="Detalės pavadinimas"
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        />
        <Input
          type="number"
          placeholder="Kaina, €"
          value={draft.price_eur}
          onChange={(event) => setDraft({ ...draft, price_eur: Number(event.target.value) })}
        />
        <Button disabled={!draft.name || add.isPending} onClick={() => add.mutate()}>
          Pridėti detalę
        </Button>
      </div>

      <div className="mt-6 space-y-2">
        {partsQuery.data?.map((part) => (
          <div
            key={part.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm"
          >
            <span className="min-w-[10rem] flex-1">
              <span className="text-xs uppercase text-muted-foreground">{part.category}</span>{" "}
              {part.name}
            </span>
            <span className="font-medium">{formatEur(Number(part.price_eur))}</span>
            <Button variant="outline" size="sm" onClick={() => toggle.mutate(part)}>
              {part.in_stock ? "Yra" : "Nėra"}
            </Button>
            <button
              onClick={() => remove.mutate(part.id)}
              aria-label="Pašalinti"
              className="text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

type OrderItem = { label: string; detail?: string; quantity: number; price_eur: number };

function OrdersTab() {
  const ordersQuery = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (!ordersQuery.data?.length) {
    return <p className="text-sm text-muted-foreground">Užsakymų kol kas nėra.</p>;
  }

  return (
    <div className="space-y-3">
      {ordersQuery.data.map((order) => (
        <div key={order.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">
              {order.customer_name} · {order.phone}
            </p>
            <p className="text-sm font-semibold">{formatEur(Number(order.total_eur))}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(order.created_at).toLocaleString("lt-LT")}
            {order.email ? ` · ${order.email}` : ""}
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {((order.items ?? []) as unknown as OrderItem[]).map((item, index) => (
              <li key={index} className="text-muted-foreground">
                {item.quantity} × {item.label}
                {item.detail ? ` — ${item.detail}` : ""}
              </li>
            ))}
          </ul>
          {order.note && <p className="mt-3 text-sm">Komentaras: {order.note}</p>}
        </div>
      ))}
    </div>
  );
}

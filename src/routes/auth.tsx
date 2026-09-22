import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Prisijungimas — VTCPC" },
      { name: "description", content: "VTCPC savininko prisijungimas prie prekių valdymo." },
      { property: "og:title", content: "Prisijungimas — VTCPC" },
      { property: "og:description", content: "Prekių valdymo prisijungimas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/valdymas" },
      });
      setLoading(false);
      setMessage(
        error ? error.message : "Paskyra sukurta. Patvirtinkite el. paštą ir prisijunkite.",
      );
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    navigate({ to: "/valdymas" });
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="text-2xl font-bold">Savininko prisijungimas</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Čia jungiasi tik VTCPC savininkas, kad galėtų pridėti ar pašalinti kompiuterius.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <Input
          type="email"
          required
          placeholder="El. paštas"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          type="password"
          required
          minLength={6}
          placeholder="Slaptažodis"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {message && <p className="text-xs text-muted-foreground">{message}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {mode === "signin" ? "Prisijungti" : "Sukurti paskyrą"}
        </Button>
      </form>

      <button
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-4 text-sm text-primary hover:underline"
      >
        {mode === "signin" ? "Neturite paskyros? Sukurti" : "Jau turite paskyrą? Prisijungti"}
      </button>
    </div>
  );
}

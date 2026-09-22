import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "@/integrations/supabase/types";

export type Build = Database["public"]["Tables"]["builds"]["Row"];
export type Part = Database["public"]["Tables"]["parts"]["Row"];

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const listBuilds = createServerFn({ method: "GET" }).handler(async (): Promise<Build[]> => {
  const { data, error } = await publicClient()
    .from("builds")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getBuild = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<Build | null> => {
    const result = await publicClient()
      .from("builds")
      .select("*")
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (result.error) throw new Error(result.error.message);
    return result.data;
  });

export const listParts = createServerFn({ method: "GET" }).handler(async (): Promise<Part[]> => {
  const { data, error } = await publicClient()
    .from("parts")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

const OrderSchema = z.object({
  customer_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(40),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
  kind: z.enum(["cart", "config"]),
  items: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(200),
        detail: z.string().trim().max(400).optional(),
        quantity: z.number().int().min(1).max(20),
        price_eur: z.number().min(0).max(100000),
      }),
    )
    .min(1)
    .max(40),
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => OrderSchema.parse(input))
  .handler(async ({ data }) => {
    const total = data.items.reduce((sum, item) => sum + item.price_eur * item.quantity, 0);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("orders").insert({
      customer_name: data.customer_name,
      phone: data.phone,
      email: data.email || null,
      note: data.note || null,
      kind: data.kind,
      items: data.items,
      total_eur: total,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

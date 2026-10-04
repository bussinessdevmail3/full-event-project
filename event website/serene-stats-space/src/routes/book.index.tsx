import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { localField, useI18n } from "@/lib/i18n";
import { LangSwitch } from "@/components/Shell";

export const Route = createFileRoute("/book/")({
  head: () => ({
    meta: [
      { title: "EventPlace — הזמנת אולמות וזמרים" },
      { name: "description", content: "Browse approved wedding halls and artists and request a booking." },
      { property: "og:title", content: "EventPlace — הזמנת אולמות וזמרים" },
      { property: "og:description", content: "Browse approved wedding halls and artists and request a booking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BookList,
});

type S = { id: string; business_name_he: string; business_name_ar: string | null; description_he: string | null; description_ar: string | null; starting_price: number | null; supplier_types: { code: string } | null; cities: { name_he: string; name_ar: string } | null };

function BookList() {
  const { lang } = useI18n();
  const [items, setItems] = useState<S[] | null>(null);
  const [filter, setFilter] = useState<"all" | "venue" | "artist">("all");
  useEffect(() => {
    supabase.from("supplier_profiles").select("id,business_name_he,business_name_ar,description_he,description_ar,starting_price,supplier_types(code),cities(name_he,name_ar)").eq("verification_status", "approved")
      .then(({ data }) => setItems((data as S[]) ?? []));
  }, []);
  const L = lang === "he"
    ? { title: "מצא אולם או זמר", all: "הכל", venue: "אולמות", artist: "זמרים", empty: "אין ספקים זמינים עדיין", login: "כניסה" }
    : { title: "ابحث عن قاعة أو مطرب", all: "الكل", venue: "قاعات", artist: "مطربون", empty: "لا يوجد مزوّدون بعد", login: "دخول" };
  const list = (items ?? []).filter((s) => filter === "all" || (filter === "venue" ? s.supplier_types?.code === "venue" : s.supplier_types?.code !== "venue"));
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="text-xl font-bold text-primary">EventPlace</div>
        <div className="flex items-center gap-3"><LangSwitch /><Link to="/supplier" className="text-sm underline">{lang === "he" ? "הצטרף כספק" : "انضم كمزوّد"}</Link><Link to="/login" className="text-sm underline">{L.login}</Link></div>
      </header>
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="mb-4 text-2xl font-bold">{L.title}</h1>
        <div className="mb-6 flex gap-2">
          {(["all", "venue", "artist"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full border px-4 py-1 text-sm ${filter === f ? "bg-primary text-primary-foreground" : ""}`}>{L[f]}</button>
          ))}
        </div>
        {items === null ? null : list.length === 0 ? <p className="text-muted-foreground">{L.empty}</p> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <Link key={s.id} to="/book/$id" params={{ id: s.id }} className="rounded-lg border bg-card p-4 hover:shadow">
                <div className="font-semibold">{localField(s, "business_name", lang)}</div>
                <div className="text-xs text-muted-foreground">{s.cities ? (lang === "he" ? s.cities.name_he : s.cities.name_ar) : ""}</div>
                <p className="mt-2 line-clamp-3 text-sm">{localField(s, "description", lang)}</p>
                {s.starting_price != null && <div className="mt-2 text-sm font-semibold text-primary">₪{s.starting_price}+</div>}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

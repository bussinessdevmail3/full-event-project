import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { localField, useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/book/$id")({
  head: () => ({
    meta: [
      { title: "EventPlace — בקשת הזמנה" },
      { name: "description", content: "Pick a date and package and send a booking request." },
      { property: "og:title", content: "EventPlace — בקשת הזמנה" },
      { property: "og:description", content: "Pick a date and package and send a booking request." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BookOne,
});

type Pkg = { id: string; name_he: string; name_ar: string | null; price: number };

function BookOne() {
  const { id } = Route.useParams();
  const { lang } = useI18n();
  const { session } = useAuth();
  const [sup, setSup] = useState<{ business_name_he: string; business_name_ar: string | null; description_he: string | null; description_ar: string | null; phone: string | null; city_id: string | null } | null>(null);
  const [pkgs, setPkgs] = useState<Pkg[]>([]);
  const [types, setTypes] = useState<{ id: string; name_he: string; name_ar: string }[]>([]);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [form, setForm] = useState({ date: "", pkg: "", type: "", guests: "", notes: "" });
  const [busy, setBusy] = useState(false);

  const load = () => {
    supabase.from("supplier_profiles").select("business_name_he,business_name_ar,description_he,description_ar,phone,city_id").eq("id", id).maybeSingle().then(({ data }) => setSup(data));
    supabase.from("supplier_packages").select("id,name_he,name_ar,price").eq("supplier_id", id).order("price").then(({ data }) => setPkgs(data ?? []));
    supabase.from("event_types").select("id,name_he,name_ar").then(({ data }) => setTypes(data ?? []));
    supabase.rpc("taken_dates", { _sid: id }).then(({ data }) => setBlocked(((data as unknown as string[]) ?? []).map(String)));
  };
  useEffect(load, [id]);

  const L = lang === "he"
    ? { back: "חזרה", pkg: "חבילה", type: "סוג אירוע", date: "תאריך", guests: "אורחים", notes: "הערות", send: "שלח בקשה", taken: "התאריך תפוס", login: "התחבר כדי להזמין", ok: "הבקשה נשלחה! הספק יאשר בקרוב", busy: "תאריכים תפוסים", none: "ללא" }
    : { back: "رجوع", pkg: "باقة", type: "نوع المناسبة", date: "التاريخ", guests: "الضيوف", notes: "ملاحظات", send: "أرسل الطلب", taken: "التاريخ محجوز", login: "سجّل الدخول للحجز", ok: "تم إرسال الطلب! سيؤكد المزوّد قريبًا", busy: "تواريخ محجوزة", none: "بدون" };

  const taken = form.date && blocked.includes(form.date);
  const today = new Date().toISOString().slice(0, 10);

  const submit = async () => {
    if (!session || !sup || !form.date || taken) return undefined;
    setBusy(true);
    const p = pkgs.find((x) => x.id === form.pkg);
    const supName = localField(sup, "business_name", lang);
    // the customer's own event (same as the mobile app), then the request to the supplier
    const { data: ev } = await supabase.from("events").insert({
      user_id: session.user.id, event_name: supName, event_type_id: form.type || null,
      event_date: form.date, city_id: sup.city_id || null, expected_guests: form.guests ? Number(form.guests) : 0,
      total_budget: p?.price ?? 0, notes: form.notes || null,
    }).select("id").single();
    const msg = [p ? `${L.pkg}: ${localField(p, "name", lang)}` : "", form.notes].filter(Boolean).join(" — ");
    const { error } = await supabase.from("booking_requests").insert({
      customer_id: session.user.id, supplier_id: id, event_id: ev?.id ?? null, event_date: form.date,
      city_id: sup.city_id || null, guest_count: form.guests ? Number(form.guests) : null,
      budget: p?.price ?? null, message: msg || null,
    });
    setBusy(false);
    if (error) return toast.error(error.message.includes("unavailable") ? L.taken : error.message);
    toast.success(L.ok);
    setForm({ date: "", pkg: "", type: "", guests: "", notes: "" });
    load();
    return undefined;
  };

  if (!sup) return <div className="p-10 text-center text-muted-foreground">…</div>;
  return (
    <div className="mx-auto max-w-2xl p-6">
      <Link to="/book" className="text-sm underline">{L.back}</Link>
      <h1 className="mt-3 text-2xl font-bold">{localField(sup, "business_name", lang)}</h1>
      <p className="mt-2 text-muted-foreground">{localField(sup, "description", lang)}</p>
      {sup.phone && <p className="mt-1 text-sm">{sup.phone}</p>}

      <div className="mt-6 grid gap-3 rounded-lg border bg-card p-5">
        <label className="text-sm">{L.date}
          <Input type="date" min={today} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </label>
        {taken && <p className="text-sm text-destructive">{L.taken}</p>}
        <label className="text-sm">{L.pkg}
          <select className="mt-1 w-full rounded-md border bg-background p-2" value={form.pkg} onChange={(e) => setForm({ ...form, pkg: e.target.value })}>
            <option value="">{L.none}</option>
            {pkgs.map((p) => <option key={p.id} value={p.id}>{localField(p, "name", lang)} — ₪{p.price}</option>)}
          </select>
        </label>
        <label className="text-sm">{L.type}
          <select className="mt-1 w-full rounded-md border bg-background p-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="">{L.none}</option>
            {types.map((t) => <option key={t.id} value={t.id}>{lang === "he" ? t.name_he : t.name_ar}</option>)}
          </select>
        </label>
        <label className="text-sm">{L.guests}
          <Input type="number" min={1} value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} />
        </label>
        <label className="text-sm">{L.notes}
          <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </label>
        {session ? (
          <Button disabled={busy || !form.date || !!taken} onClick={submit}>{L.send}</Button>
        ) : (
          <Link to="/login" className="text-center text-sm underline">{L.login}</Link>
        )}
        {blocked.length > 0 && <p className="text-xs text-muted-foreground">{L.busy}: {blocked.sort().join(", ")}</p>}
      </div>
    </div>
  );
}

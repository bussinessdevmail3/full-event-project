import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { localName, useI18n, type TKey } from "@/lib/i18n";
import { PageTitle } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin/lists")({ component: Lists });

type Table = "cities" | "regions" | "amenities" | "genres" | "event_types";
const tables: { table: Table; label: TKey }[] = [
  { table: "cities", label: "cities" },
  { table: "regions", label: "regions" },
  { table: "amenities", label: "amenities" },
  { table: "genres", label: "genres" },
  { table: "event_types", label: "eventTypes" },
];
const hasCode = (t: Table) => t === "amenities" || t === "genres" || t === "event_types";

function Lists() {
  const { t } = useI18n();
  return (
    <>
      <PageTitle>{t("lists")}</PageTitle>
      <Tabs defaultValue="cities" dir="rtl">
        <TabsList>{tables.map((x) => <TabsTrigger key={x.table} value={x.table}>{t(x.label)}</TabsTrigger>)}</TabsList>
        {tables.map((x) => <TabsContent key={x.table} value={x.table}><LookupEditor table={x.table} /></TabsContent>)}
      </Tabs>
    </>
  );
}

function LookupEditor({ table }: { table: Table }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [he, setHe] = useState("");
  const [ar, setAr] = useState("");
  const [code, setCode] = useState("");
  const [regionId, setRegionId] = useState("");
  const { data } = useQuery({
    queryKey: ["lookup", table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("id, name_he, name_ar").order("name_he");
      if (error) throw error;
      return data;
    },
  });
  const { data: regions } = useQuery({
    queryKey: ["lookup", "regions"],
    enabled: table === "cities",
    queryFn: async () => (await supabase.from("regions").select("id, name_he, name_ar").order("name_he")).data ?? [],
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["lookup", table] });
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const base = { name_he: he, name_ar: ar };
    const { error } =
      table === "cities" ? await supabase.from("cities").insert({ ...base, region_id: regionId })
      : table === "regions" ? await supabase.from("regions").insert(base)
      : await supabase.from(table).insert({ ...base, code: code || `c${Date.now()}` });
    if (error) { toast.error(error.message); return; }
    setHe(""); setAr(""); setCode(""); refresh();
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    refresh();
  };
  return (
    <div className="mt-4 space-y-4">
      <form onSubmit={add} className="flex flex-wrap gap-2">
        {table === "cities" && (
          <select className="h-9 rounded-md border bg-background px-3 text-sm" value={regionId} onChange={(e) => setRegionId(e.target.value)} required>
            <option value="">{t("region")}</option>
            {regions?.map((r) => <option key={r.id} value={r.id}>{localName(r, lang)}</option>)}
          </select>
        )}
        <Input className="max-w-xs" placeholder={t("nameHe")} value={he} onChange={(e) => setHe(e.target.value)} required />
        <Input className="max-w-xs" placeholder={t("nameAr")} value={ar} onChange={(e) => setAr(e.target.value)} required />
        {hasCode(table) && <Input className="w-32" dir="ltr" placeholder="code" value={code} onChange={(e) => setCode(e.target.value)} />}
        <Button>{t("add")}</Button>
      </form>
      <div className="rounded-xl border bg-card">
        {data?.length === 0 && <div className="p-6 text-center text-muted-foreground">{t("empty")}</div>}
        {data?.map((r) => (
          <div key={r.id} className="flex items-center justify-between border-b p-3 last:border-0">
            <span>{r.name_he} · {r.name_ar}</span>
            <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>{t("delete")}</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

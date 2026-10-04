import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMySupplier } from "@/hooks/useMySupplier";
import { localField, useI18n } from "@/lib/i18n";
import { PageTitle } from "@/components/Shell";
import { NeedSupplier } from "@/components/NeedSupplier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/supplier/packages")({ component: Packages });

function Packages() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const { data: sp } = useMySupplier();
  const [f, setF] = useState({ name_he: "", name_ar: "", description_he: "", price: "", duration_hours: "" });
  const { data } = useQuery({
    queryKey: ["packages", sp?.id],
    enabled: !!sp,
    queryFn: async () => (await supabase.from("supplier_packages").select("*").eq("supplier_id", sp!.id).order("created_at")).data ?? [],
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["packages", sp?.id] });
  if (!sp) return <><PageTitle>{t("packages")}</PageTitle><NeedSupplier /></>;

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("supplier_packages").insert({
      supplier_id: sp.id, name_he: f.name_he, name_ar: f.name_ar || null, description_he: f.description_he || null,
      price: Number(f.price) || 0, duration_hours: f.duration_hours ? Number(f.duration_hours) : null,
    });
    if (error) { toast.error(error.message); return; }
    setF({ name_he: "", name_ar: "", description_he: "", price: "", duration_hours: "" }); refresh();
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("supplier_packages").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    refresh();
  };
  return (
    <>
      <PageTitle>{t("packages")}</PageTitle>
      <form onSubmit={add} className="mb-6 flex flex-wrap gap-2">
        <Input className="max-w-48" placeholder={t("nameHe")} value={f.name_he} onChange={(e) => setF({ ...f, name_he: e.target.value })} required />
        <Input className="max-w-48" placeholder={t("nameAr")} value={f.name_ar} onChange={(e) => setF({ ...f, name_ar: e.target.value })} />
        <Input className="max-w-sm" placeholder={t("description")} value={f.description_he} onChange={(e) => setF({ ...f, description_he: e.target.value })} />
        <Input className="w-28" type="number" min="0" placeholder={`${t("price")} ₪`} value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
        <Input className="w-24" type="number" min="0" placeholder="שעות / ساعات" value={f.duration_hours} onChange={(e) => setF({ ...f, duration_hours: e.target.value })} />
        <Button>{t("add")}</Button>
      </form>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.length === 0 && <div className="text-muted-foreground">{t("empty")}</div>}
        {data?.map((p) => (
          <div key={p.id} className="space-y-2 rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{localField(p, "name", lang)}</h3>
              <span className="text-lg font-bold text-primary">₪{p.price}</span>
            </div>
            <p className="text-sm text-muted-foreground">{localField(p, "description", lang)}</p>
            <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
              <span>{p.duration_hours ? `${p.duration_hours}h` : ""}</span>
              <Button size="sm" variant="ghost" onClick={() => remove(p.id)}>{t("delete")}</Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

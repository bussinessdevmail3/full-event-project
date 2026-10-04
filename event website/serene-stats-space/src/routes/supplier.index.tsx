import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMySupplier } from "@/hooks/useMySupplier";
import { localName, useI18n } from "@/lib/i18n";
import { PageTitle, StatusBadge } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/supplier/")({ component: Profile });

const empty = { business_name_he: "", business_name_ar: "", description_he: "", description_ar: "", phone: "", email: "", city_id: "", address: "", supplier_type_id: "" };

function Profile() {
  const { t, lang } = useI18n();
  const { session, refreshRoles } = useAuth();
  const qc = useQueryClient();
  const { data: sp, isLoading } = useMySupplier();
  const { data: cities } = useQuery({
    queryKey: ["lookup", "cities"],
    queryFn: async () => (await supabase.from("cities").select("id, name_he, name_ar").order("name_he")).data ?? [],
  });
  const { data: types } = useQuery({
    queryKey: ["lookup", "supplier_types"],
    queryFn: async () => (await supabase.from("supplier_types").select("id, code, name_he, name_ar").eq("is_active", true).order("sort_order")).data ?? [],
  });
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (sp) setForm({
      business_name_he: sp.business_name_he, business_name_ar: sp.business_name_ar ?? "",
      description_he: sp.description_he ?? "", description_ar: sp.description_ar ?? "",
      phone: sp.phone ?? "", email: sp.email ?? "", city_id: sp.city_id ?? "", address: sp.address ?? "",
      supplier_type_id: sp.supplier_type_id,
    });
    else if (types?.length) setForm((f) => (f.supplier_type_id ? f : { ...f, supplier_type_id: types[0]!.id }));
  }, [sp, types]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      business_name_ar: form.business_name_ar || null, description_he: form.description_he || null,
      description_ar: form.description_ar || null, city_id: form.city_id || null, address: form.address || null,
    };
    if (sp) {
      const { supplier_type_id: _ignored, ...upd } = payload;
      const { error } = await supabase.from("supplier_profiles").update(upd).eq("id", sp.id);
      if (error) { toast.error(error.message); return; }
    } else {
      const { data: created, error } = await supabase.from("supplier_profiles").insert({ ...payload, user_id: session!.user.id }).select("id").single();
      if (error) { toast.error(error.message); return; }
      // matching detail row so the mobile app finds the hall / singer
      const code = types?.find((x) => x.id === form.supplier_type_id)?.code;
      if (code === "venue") await supabase.from("venues").insert({ supplier_id: created.id });
      else await supabase.from("artists").insert({ supplier_id: created.id });
    }
    toast.success(t("saved"));
    await refreshRoles();
    qc.invalidateQueries({ queryKey: ["my-supplier"] });
  };

  if (isLoading) return <div>{t("loading")}</div>;
  const sel = "h-9 w-full rounded-md border bg-background px-3 text-sm";

  return (
    <>
      <PageTitle>{sp ? t("profile") : t("createSupplier")}</PageTitle>
      {!sp && <p className="mb-4 text-muted-foreground">{t("createSupplierHint")}</p>}
      {sp && <div className="mb-4 flex items-center gap-2 text-sm">{t("status")}: <StatusBadge status={sp.verification_status} /></div>}
      <form onSubmit={save} className="max-w-xl space-y-4 rounded-xl border bg-card p-6">
        <div className="space-y-1">
          <Label>{t("type")}</Label>
          <select className={sel} value={form.supplier_type_id} onChange={set("supplier_type_id")} disabled={!!sp} required>
            {types?.map((x) => <option key={x.id} value={x.id}>{localName(x, lang)}</option>)}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1"><Label>{t("businessName")} (עב)</Label><Input value={form.business_name_he} onChange={set("business_name_he")} required /></div>
          <div className="space-y-1"><Label>{t("businessName")} (عر)</Label><Input value={form.business_name_ar} onChange={set("business_name_ar")} /></div>
        </div>
        <div className="space-y-1"><Label>{t("description")} (עב)</Label><Textarea rows={3} value={form.description_he} onChange={set("description_he")} /></div>
        <div className="space-y-1"><Label>{t("description")} (عر)</Label><Textarea rows={3} value={form.description_ar} onChange={set("description_ar")} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>{t("phone")}</Label><Input dir="ltr" value={form.phone} onChange={set("phone")} /></div>
          <div className="space-y-1"><Label>{t("email")}</Label><Input dir="ltr" type="email" value={form.email} onChange={set("email")} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>{t("city")}</Label>
            <select className={sel} value={form.city_id} onChange={set("city_id")}>
              <option value="">—</option>
              {cities?.map((c) => <option key={c.id} value={c.id}>{localName(c, lang)}</option>)}
            </select>
          </div>
          <div className="space-y-1"><Label>כתובת / العنوان</Label><Input value={form.address} onChange={set("address")} /></div>
        </div>
        <Button>{sp ? t("save") : t("createSupplier")}</Button>
      </form>
    </>
  );
}

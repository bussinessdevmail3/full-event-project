import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { localField, localName, useI18n } from "@/lib/i18n";
import { PageTitle, StatusBadge } from "@/components/Shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/suppliers")({ component: Suppliers });

type Status = "approved" | "rejected" | "suspended";

function Suppliers() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supplier_profiles")
        .select("*, cities(name_he, name_ar), supplier_types(code, name_he, name_ar)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const setStatus = async (id: string, status: Status) => {
    const { error } = await supabase.from("supplier_profiles").update({ verification_status: status, is_verified: status === "approved" }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(t("saved"));
    qc.invalidateQueries({ queryKey: ["admin-suppliers"] });
  };
  return (
    <>
      <PageTitle>{t("suppliers")}</PageTitle>
      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-start">
            <tr>{["name", "type", "city", "phone", "status", "actions"].map((h) => <th key={h} className="p-3 text-start">{t(h as never)}</th>)}</tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-6 text-center">{t("loading")}</td></tr>}
            {data?.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">{t("empty")}</td></tr>}
            {data?.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3 font-medium">{localField(s, "business_name", lang)}</td>
                <td className="p-3">{localName(s.supplier_types, lang)}</td>
                <td className="p-3">{localName(s.cities, lang)}</td>
                <td className="p-3" dir="ltr">{s.phone ?? "—"}</td>
                <td className="p-3"><StatusBadge status={s.verification_status} /></td>
                <td className="flex gap-2 p-3">
                  {s.verification_status !== "approved" && <Button size="sm" onClick={() => setStatus(s.id, "approved")}>{t("approve")}</Button>}
                  {s.verification_status === "pending" && <Button size="sm" variant="outline" onClick={() => setStatus(s.id, "rejected")}>{t("reject")}</Button>}
                  {s.verification_status === "approved" && <Button size="sm" variant="outline" onClick={() => setStatus(s.id, "suspended")}>{t("suspend")}</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { localField, localName, useI18n } from "@/lib/i18n";
import { StatusBadge } from "@/components/Shell";
import { Button } from "@/components/ui/button";

type Status = "confirmed" | "rejected" | "completed" | "cancelled";

/** Booking requests (booking_requests table). Pass supplierId to scope to one supplier; RLS limits rows anyway. */
export function BookingsTable({ supplierId }: { supplierId?: string }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const key = ["booking_requests", supplierId ?? "all"];
  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      let q = supabase
        .from("booking_requests")
        .select("*, supplier_profiles(business_name_he, business_name_ar), events(event_name, event_types(name_he, name_ar))")
        .order("event_date", { ascending: true });
      if (supplierId) q = q.eq("supplier_id", supplierId);
      const { data, error } = await q;
      if (error) throw error;
      const ids = [...new Set((data ?? []).map((b) => b.customer_id))];
      const { data: people } = ids.length
        ? await supabase.from("profiles").select("id, full_name, email, phone").in("id", ids)
        : { data: [] };
      const byId = new Map((people ?? []).map((p) => [p.id, p]));
      return (data ?? []).map((b) => ({ ...b, customer: byId.get(b.customer_id) }));
    },
  });
  const setStatus = async (id: string, status: Status) => {
    const { error } = await supabase.from("booking_requests").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(t("saved"));
    qc.invalidateQueries({ queryKey: key });
  };
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-3 text-start">{t("date")}</th>
            {!supplierId && <th className="p-3 text-start">{t("suppliers")}</th>}
            <th className="p-3 text-start">{t("customer")}</th>
            <th className="p-3 text-start">{t("type")}</th>
            <th className="p-3 text-start">{t("guests")}</th>
            <th className="p-3 text-start">{t("price")}</th>
            <th className="p-3 text-start">{t("message")}</th>
            <th className="p-3 text-start">{t("status")}</th>
            <th className="p-3 text-start">{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && <tr><td colSpan={9} className="p-6 text-center">{t("loading")}</td></tr>}
          {data?.length === 0 && <tr><td colSpan={9} className="p-6 text-center text-muted-foreground">{t("empty")}</td></tr>}
          {data?.map((b) => (
            <tr key={b.id} className="border-t">
              <td className="p-3" dir="ltr">{b.event_date}</td>
              {!supplierId && <td className="p-3">{localField(b.supplier_profiles, "business_name", lang)}</td>}
              <td className="p-3">
                <div>{b.customer?.full_name || b.customer?.email || "—"}</div>
                {b.customer?.phone && <div className="text-xs text-muted-foreground" dir="ltr">{b.customer.phone}</div>}
              </td>
              <td className="p-3">{b.events?.event_types ? localName(b.events.event_types, lang) : b.events?.event_name ?? "—"}</td>
              <td className="p-3">{b.guest_count ?? "—"}</td>
              <td className="p-3">{b.budget != null ? `₪${b.budget}` : "—"}</td>
              <td className="max-w-48 truncate p-3" title={b.message ?? ""}>{b.message ?? "—"}</td>
              <td className="p-3"><StatusBadge status={b.status} /></td>
              <td className="flex gap-2 p-3">
                {["requested","supplier_reviewing","offer_sent","customer_accepted","payment_pending"].includes(b.status) && (
                  <>
                    <Button size="sm" onClick={() => setStatus(b.id, "confirmed")}>{t("confirm")}</Button>
                    <Button size="sm" variant="outline" onClick={() => setStatus(b.id, "rejected")}>{t("reject")}</Button>
                  </>
                )}
                {b.status === "confirmed" && <Button size="sm" variant="outline" onClick={() => setStatus(b.id, "completed")}>{t("complete")}</Button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

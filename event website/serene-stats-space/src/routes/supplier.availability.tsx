import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useMySupplier } from "@/hooks/useMySupplier";
import { useI18n } from "@/lib/i18n";
import { PageTitle } from "@/components/Shell";
import { NeedSupplier } from "@/components/NeedSupplier";
import { Calendar } from "@/components/ui/calendar";

export const Route = createFileRoute("/supplier/availability")({ component: Availability });

function Availability() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const { data: sp } = useMySupplier();
  const { data } = useQuery({
    queryKey: ["availability", sp?.id],
    enabled: !!sp,
    queryFn: async () => (await supabase.from("availability").select("id, date, status").eq("supplier_id", sp!.id)).data ?? [],
  });
  const { data: requested } = useQuery({
    queryKey: ["booking_requests", "dates", sp?.id],
    enabled: !!sp,
    queryFn: async () => (await supabase.from("booking_requests").select("event_date").eq("supplier_id", sp!.id).in("status", ["requested","supplier_reviewing","offer_sent","customer_accepted","payment_pending"])).data ?? [],
  });
  if (!sp) return <><PageTitle>{t("availability")}</PageTitle><NeedSupplier /></>;

  const day = (d: string) => new Date(d + "T00:00:00");
  const blocked = (data ?? []).filter((d) => d.status === "blocked").map((d) => day(d.date));
  const booked = (data ?? []).filter((d) => d.status === "booked").map((d) => day(d.date));
  const held = (requested ?? []).map((r) => day(r.event_date));

  const toggle = async (d: Date | undefined) => {
    if (!d) return;
    const iso = format(d, "yyyy-MM-dd");
    const existing = data?.find((x) => x.date === iso);
    if (existing?.status === "booked") { toast.error(t("booked")); return; }
    const { error } = existing
      ? existing.status === "blocked"
        ? await supabase.from("availability").delete().eq("id", existing.id)
        : await supabase.from("availability").update({ status: "blocked" }).eq("id", existing.id)
      : await supabase.from("availability").insert({ supplier_id: sp.id, date: iso, status: "blocked" });
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["availability", sp.id] });
  };
  return (
    <>
      <PageTitle>{t("availability")}</PageTitle>
      <p className="mb-2 text-sm text-muted-foreground">{t("blockedDates")}</p>
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        <span className="flex items-center gap-1"><i className="inline-block h-3 w-3 rounded bg-muted-foreground" />{t("blocked")}</span>
        <span className="flex items-center gap-1"><i className="inline-block h-3 w-3 rounded bg-primary" />{t("booked")}</span>
        <span className="flex items-center gap-1"><i className="inline-block h-3 w-3 rounded bg-accent" />{t("requested")}</span>
      </div>
      <div className="inline-block rounded-xl border bg-card p-4">
        <Calendar
          mode="single"
          numberOfMonths={2}
          onSelect={toggle}
          modifiers={{ blocked, booked, held }}
          modifiersClassNames={{
            blocked: "!bg-muted-foreground !text-background rounded-md",
            booked: "!bg-primary !text-primary-foreground rounded-md",
            held: "!bg-accent !text-accent-foreground rounded-md",
          }}
        />
      </div>
    </>
  );
}

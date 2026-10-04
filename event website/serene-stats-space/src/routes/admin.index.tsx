import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, type TKey } from "@/lib/i18n";
import { PageTitle } from "@/components/Shell";

export const Route = createFileRoute("/admin/")({ component: Overview });

function Overview() {
  const { t } = useI18n();
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const count = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;
      return {
        totalSuppliers: await count(supabase.from("supplier_profiles").select("*", { count: "exact", head: true })),
        pendingApproval: await count(supabase.from("supplier_profiles").select("*", { count: "exact", head: true }).eq("verification_status", "pending")),
        totalBookings: await count(supabase.from("booking_requests").select("*", { count: "exact", head: true })),
        customers: await count(supabase.from("profiles").select("*", { count: "exact", head: true })),
      };
    },
  });
  return (
    <>
      <PageTitle>{t("overview")}</PageTitle>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(["totalSuppliers", "pendingApproval", "totalBookings", "customers"] as TKey[]).map((k) => (
          <div key={k} className="rounded-xl border bg-card p-5">
            <div className="text-sm text-muted-foreground">{t(k)}</div>
            <div className="mt-2 text-3xl font-bold text-primary">{data ? (data as Record<string, number>)[k] : "…"}</div>
          </div>
        ))}
      </div>
    </>
  );
}

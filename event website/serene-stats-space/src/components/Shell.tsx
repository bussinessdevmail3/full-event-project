import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useI18n, type TKey } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function LangSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex gap-1 rounded-md border border-sidebar-border p-1 text-xs">
      {(["he", "ar"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`rounded px-2 py-1 ${lang === l ? "bg-sidebar-primary text-sidebar-primary-foreground" : ""}`}
        >
          {l === "he" ? "עברית" : "العربية"}
        </button>
      ))}
    </div>
  );
}

export function Shell({
  role,
  title,
  nav,
  children,
}: {
  role: "admin" | "supplier";
  title: TKey;
  nav: { to: string; label: TKey }[];
  children: ReactNode;
}) {
  const { session, roles, loading } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const allowed = role === "supplier" ? !!session : roles.includes("admin");

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  if (loading || !session) return <div className="p-10 text-center text-muted-foreground">{t("loading")}</div>;
  if (!allowed) return <div className="p-10 text-center">{t("noRole")}</div>;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-60 shrink-0 flex-col gap-6 bg-sidebar p-5 text-sidebar-foreground">
        <div>
          <div className="text-xl font-bold text-sidebar-primary">{t("appName")}</div>
          <div className="text-xs opacity-70">{t(title)}</div>
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              className="rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent"
              activeProps={{ className: "bg-sidebar-accent font-semibold text-sidebar-primary" }}
            >
              {t(n.label)}
            </Link>
          ))}
          {role === "admin" && roles.includes("supplier") && (
            <Link to="/supplier" className="rounded-md px-3 py-2 text-sm opacity-70 hover:bg-sidebar-accent">{t("supplierArea")}</Link>
          )}
          {role === "supplier" && roles.includes("admin") && (
            <Link to="/admin" className="rounded-md px-3 py-2 text-sm opacity-70 hover:bg-sidebar-accent">{t("adminArea")}</Link>
          )}
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          <LangSwitch />
          <div className="truncate text-xs opacity-70">{session.user.email}</div>
          <Button variant="secondary" size="sm" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/login" }); }}>
            {t("signOut")}
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-auto p-8">{children}</main>
    </div>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="mb-6 text-2xl font-bold text-primary">{children}</h1>;
}

const statusTone: Record<string, string> = {
  pending: "bg-accent/30 text-accent-foreground",
  requested: "bg-accent/30 text-accent-foreground",
  quoted: "bg-accent/30 text-accent-foreground",
  supplier_reviewing: "bg-accent/30 text-accent-foreground",
  offer_sent: "bg-accent/30 text-accent-foreground",
  customer_accepted: "bg-accent/30 text-accent-foreground",
  payment_pending: "bg-accent/30 text-accent-foreground",
  approved: "bg-primary/10 text-primary",
  confirmed: "bg-primary/10 text-primary",
  completed: "bg-secondary text-secondary-foreground",
  rejected: "bg-destructive/10 text-destructive",
  cancelled: "bg-destructive/10 text-destructive",
  suspended: "bg-muted text-muted-foreground",
};
export function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusTone[status] ?? ""}`}>{t(status as TKey)}</span>;
}

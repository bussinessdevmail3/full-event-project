import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EventPlace — לוח בקרה" },
      { name: "description", content: "EventPlace dashboard for venues, artists and admins." },
      { property: "og:title", content: "EventPlace — לוח בקרה" },
      { property: "og:description", content: "EventPlace dashboard for venues, artists and admins." },
    ],
  }),
  component: Home,
});

function Home() {
  const { session, roles, loading } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/book" });
    else if (roles.includes("admin")) navigate({ to: "/admin" });
    else if (roles.includes("supplier")) navigate({ to: "/supplier" });
    else navigate({ to: "/book" });
  }, [loading, session, roles, navigate]);
  return <div className="p-10 text-center text-muted-foreground">{t("loading")}</div>;
}

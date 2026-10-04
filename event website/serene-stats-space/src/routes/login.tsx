import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "התחברות — EventPlace" },
      { name: "description", content: "Sign in to the EventPlace supplier and admin dashboard." },
      { property: "og:title", content: "התחברות — EventPlace" },
      { property: "og:description", content: "Sign in to the EventPlace supplier and admin dashboard." },
    ],
  }),
  component: Login,
});

function Login() {
  const { t, lang, setLang } = useI18n();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (session) navigate({ to: "/" }); }, [session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    if (mode === "up") toast.success(t("checkEmail"));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sidebar p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-xl bg-card p-8 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">{t("appName")}</h1>
            <p className="text-sm text-muted-foreground">{t("tagline")}</p>
          </div>
          <button type="button" className="text-xs underline" onClick={() => setLang(lang === "he" ? "ar" : "he")}>
            {lang === "he" ? "العربية" : "עברית"}
          </button>
        </div>
        {mode === "up" && (
          <div className="space-y-1"><Label>{t("fullName")}</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
        )}
        <div className="space-y-1"><Label>{t("email")}</Label><Input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="space-y-1"><Label>{t("password")}</Label><Input type="password" dir="ltr" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        <Button className="w-full" disabled={busy}>{mode === "in" ? t("signIn") : t("signUp")}</Button>
        <button type="button" className="w-full text-sm text-muted-foreground underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? t("noAccount") : t("haveAccount")}
        </button>
      </form>
    </div>
  );
}

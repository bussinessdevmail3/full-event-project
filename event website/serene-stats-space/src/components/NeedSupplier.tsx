import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function NeedSupplier() {
  const { t } = useI18n();
  return (
    <div className="rounded-xl border bg-card p-8 text-center">
      <p className="mb-4 text-muted-foreground">{t("createSupplierHint")}</p>
      <Button asChild><Link to="/supplier">{t("createSupplier")}</Link></Button>
    </div>
  );
}

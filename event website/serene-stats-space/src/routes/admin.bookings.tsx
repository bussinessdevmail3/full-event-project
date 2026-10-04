import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { PageTitle } from "@/components/Shell";
import { BookingsTable } from "@/components/BookingsTable";

export const Route = createFileRoute("/admin/bookings")({ component: Page });

function Page() {
  const { t } = useI18n();
  return (<><PageTitle>{t("bookings")}</PageTitle><BookingsTable /></>);
}

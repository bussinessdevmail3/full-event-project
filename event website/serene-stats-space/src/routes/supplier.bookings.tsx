import { createFileRoute } from "@tanstack/react-router";
import { useMySupplier } from "@/hooks/useMySupplier";
import { useI18n } from "@/lib/i18n";
import { PageTitle } from "@/components/Shell";
import { NeedSupplier } from "@/components/NeedSupplier";
import { BookingsTable } from "@/components/BookingsTable";

export const Route = createFileRoute("/supplier/bookings")({ component: Page });

function Page() {
  const { t } = useI18n();
  const { data: sp } = useMySupplier();
  return (<><PageTitle>{t("bookings")}</PageTitle>{sp ? <BookingsTable supplierId={sp.id} /> : <NeedSupplier />}</>);
}

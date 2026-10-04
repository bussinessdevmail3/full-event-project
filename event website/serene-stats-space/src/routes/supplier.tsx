import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";

export const Route = createFileRoute("/supplier")({
  head: () => ({ meta: [{ title: "אזור ספק — EventPlace" }, { name: "description", content: "EventPlace supplier area." }] }),
  component: () => (
    <Shell
      role="supplier"
      title="supplierArea"
      nav={[
        { to: "/supplier", label: "profile" },
        { to: "/supplier/packages", label: "packages" },
        { to: "/supplier/availability", label: "availability" },
        { to: "/supplier/bookings", label: "bookings" },
      ]}
    >
      <Outlet />
    </Shell>
  ),
});

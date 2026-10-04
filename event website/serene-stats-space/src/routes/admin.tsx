import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "ניהול — EventPlace" }, { name: "description", content: "EventPlace admin area." }] }),
  component: () => (
    <Shell
      role="admin"
      title="adminArea"
      nav={[
        { to: "/admin", label: "overview" },
        { to: "/admin/suppliers", label: "suppliers" },
        { to: "/admin/bookings", label: "bookings" },
        { to: "/admin/lists", label: "lists" },
      ]}
    >
      <Outlet />
    </Shell>
  ),
});

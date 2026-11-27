import { createFileRoute } from "@tanstack/react-router";
import { Analytics } from "@/features/officeflow/analytics";
import { pageHead } from "@/features/officeflow/shared";
export const Route = createFileRoute("/analytics")({
  head: () =>
    pageHead(
      "Analytics",
      "Explore OfficeFlow employee growth, department distribution and HR indicators.",
    ),
  component: Analytics,
});

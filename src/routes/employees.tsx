import { createFileRoute } from "@tanstack/react-router";
import { Employees } from "@/features/officeflow/employees";
import { pageHead } from "@/features/officeflow/shared";
export const Route = createFileRoute("/employees")({
  validateSearch: (search: Record<string, unknown>): { q?: string; add?: boolean } => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
    add: search["add"] === true,
  }),
  head: () =>
    pageHead(
      "Employees",
      "Manage the OfficeFlow employee directory, profiles and team assignments.",
    ),
  component: EmployeeRoute,
});
function EmployeeRoute() {
  const search = Route.useSearch();
  return <Employees query={search.q ?? ""} add={search.add ?? false} />;
}

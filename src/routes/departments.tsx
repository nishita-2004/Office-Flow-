import { createFileRoute } from "@tanstack/react-router";
import { Departments } from "@/features/officeflow/departments";
import { pageHead } from "@/features/officeflow/shared";
export const Route = createFileRoute("/departments")({
  head: () => pageHead("Departments", "Organize OfficeFlow departments, locations and job roles."),
  component: Departments,
});

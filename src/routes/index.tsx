import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/features/officeflow/dashboard";
import { pageHead } from "@/features/officeflow/shared";
export const Route = createFileRoute("/")({
  head: () =>
    pageHead("Dashboard", "OfficeFlow people overview, attendance, leave requests and payroll."),
  component: Dashboard,
});

import { createFileRoute } from "@tanstack/react-router";
import { Payroll } from "@/features/officeflow/payroll";
import { pageHead } from "@/features/officeflow/shared";
export const Route = createFileRoute("/payroll")({
  head: () =>
    pageHead("Payroll", "Review OfficeFlow salary breakdowns, monthly payroll and demo payslips."),
  component: Payroll,
});

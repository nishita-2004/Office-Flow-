import { createFileRoute } from "@tanstack/react-router";
import { Leaves } from "@/features/officeflow/leaves";
import { pageHead } from "@/features/officeflow/shared";
export const Route = createFileRoute("/leaves")({
  head: () =>
    pageHead("Leaves", "Review OfficeFlow leave requests, employee balances and leave history."),
  component: Leaves,
});

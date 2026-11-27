import { createFileRoute } from "@tanstack/react-router";
import { Screening } from "@/features/officeflow/screening";
import { pageHead } from "@/features/officeflow/shared";
export const Route = createFileRoute("/screening")({
  head: () =>
    pageHead(
      "Screening",
      "Review candidate skills with transparent keyword-based resume screening in OfficeFlow.",
    ),
  component: Screening,
});

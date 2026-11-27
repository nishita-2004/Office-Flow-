import { createFileRoute } from "@tanstack/react-router";
import { Attendance } from "@/features/officeflow/attendance";
import { pageHead } from "@/features/officeflow/shared";
export const Route = createFileRoute("/attendance")({
  head: () =>
    pageHead(
      "Attendance",
      "Manage daily attendance, history, reports and QR check-ins in OfficeFlow.",
    ),
  component: Attendance,
});

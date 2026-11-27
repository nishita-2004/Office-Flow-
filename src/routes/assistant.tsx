import { createFileRoute } from "@tanstack/react-router";
import { Assistant } from "@/features/officeflow/assistant";
import { pageHead } from "@/features/officeflow/shared";
export const Route = createFileRoute("/assistant")({
  head: () =>
    pageHead(
      "Assistant",
      "Check employee information, leave balances and salary details with OfficeFlow Assistant.",
    ),
  component: Assistant,
});

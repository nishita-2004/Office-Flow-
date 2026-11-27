import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { OfficeFlowProvider, useOfficeFlow } from "./store";

function PayrollProbe() {
  const { generatedPayroll, setGeneratedPayroll } = useOfficeFlow();
  return (
    <>
      <output aria-label="Generated payroll">{String(!!generatedPayroll["November 2026"])}</output>
      <button
        onClick={() => setGeneratedPayroll((current) => ({ ...current, "November 2026": true }))}
      >
        Generate
      </button>
    </>
  );
}

function NavigationProbe() {
  const [visible, setVisible] = useState(true);
  return (
    <>
      <button onClick={() => setVisible((current) => !current)}>Change page</button>
      {visible && <PayrollProbe />}
    </>
  );
}

describe("OfficeFlow workspace state", () => {
  it("retains generated payroll when the payroll page unmounts and remounts", () => {
    render(
      <OfficeFlowProvider>
        <NavigationProbe />
      </OfficeFlowProvider>,
    );
    expect(screen.getByLabelText("Generated payroll").textContent).toBe("false");
    fireEvent.click(screen.getByText("Generate"));
    fireEvent.click(screen.getByText("Change page"));
    fireEvent.click(screen.getByText("Change page"));
    expect(screen.getByLabelText("Generated payroll").textContent).toBe("true");
  });
});

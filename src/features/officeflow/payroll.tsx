import { useState } from "react";
import { Download, Eye, LoaderCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useOfficeFlow } from "./store";
import { type Employee, money, payrollFor } from "./data";
import {
  Badge,
  Empty,
  ExportButton,
  PageHeading,
  Person,
  SearchField,
  downloadCsv,
} from "./shared";
import { attendanceStatus, demoAttendanceDates } from "./attendance";
export function Payroll() {
  const {
    employees,
    attendance,
    generatedPayroll: generated,
    setGeneratedPayroll: setGenerated,
    log,
  } = useOfficeFlow();
  const [month, setMonth] = useState("November 2026");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<Employee | null>(null);
  const [error, setError] = useState("");
  const data = (e: Employee) =>
    payrollFor(
      e,
      month === "November 2026"
        ? demoAttendanceDates.filter((d) => attendanceStatus(d, e.id, attendance) === "Absent")
            .length
        : e.id % 3,
    );
  const rows = employees.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));
  const gross = employees.reduce((s, e) => s + e.salary, 0);
  const deductions = employees.reduce((s, e) => s + data(e).deductions, 0);
  const payslip = async (e: Employee) => {
    setError("");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const p = data(e);
      doc.setFontSize(24);
      doc.text("OfficeFlow", 20, 25);
      doc.setFontSize(14);
      doc.text("Employee payslip", 20, 40);
      doc.setFontSize(11);
      [
        [`Employee: ${e.name}`, 55],
        [`Employee ID: OF-${String(e.id).padStart(4, "0")}`, 65],
        [`Department: ${e.department}`, 75],
        [`Month: ${month}`, 85],
        [`Basic salary: INR ${p.salary.toLocaleString("en-IN")}`, 105],
        [`Deductions: INR ${p.deductions.toLocaleString("en-IN")}`, 115],
        [`Net salary: INR ${p.net.toLocaleString("en-IN")}`, 130],
        ["FICTIONAL DEMO PAYSLIP - Not proof of payment", 155],
      ].forEach(([text, y]) => doc.text(String(text), 20, Number(y)));
      doc.save(`OfficeFlow-${e.name.replaceAll(" ", "-")}-${month.replace(" ", "-")}.pdf`);
    } catch {
      setError("The payslip could not be downloaded. Please try again.");
    }
  };
  return (
    <>
      <PageHeading title="Payroll" subtitle="Accurate payroll. Happier paydays.">
        <select
          className="control"
          aria-label="Payroll month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          <option>November 2026</option>
          <option>October 2026</option>
        </select>
        <ExportButton
          onClick={() =>
            downloadCsv("officeflow-payroll.csv", [
              ["Employee", "Month", "Gross salary", "Deductions", "Net salary", "Status"],
              ...rows.map((e) => [
                e.name,
                month,
                e.salary,
                data(e).deductions,
                data(e).net,
                generated[month] ? "Generated" : "Draft",
              ]),
            ])
          }
        />
        <Button
          disabled={busy || !!generated[month]}
          onClick={() => {
            setBusy(true);
            setTimeout(() => {
              setGenerated((g) => ({ ...g, [month]: true }));
              setBusy(false);
              log(`${month} demo payroll was generated`);
            }, 650);
          }}
        >
          {busy ? <LoaderCircle className="loading-spinner" /> : <Play />}
          {generated[month] ? "Payroll generated" : busy ? "Generating…" : "Generate payroll"}
        </Button>
      </PageHeading>
      <div className="stats-grid">
        {[
          { label: "Gross payroll", value: money(gross) },
          { label: "Total deductions", value: money(deductions) },
          { label: "Net payroll", value: money(gross - deductions) },
          { label: "Employees included", value: employees.length },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-top">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-foot">{month}</div>
          </div>
        ))}
      </div>
      <p className="notice">
        Demo estimate only. Deductions use a 30-day salary divisor and recorded absent days;
        November has six seeded attendance days. No payments are processed.
      </p>
      {error && (
        <p role="alert" className="form-error mb-4">
          {error}
        </p>
      )}
      <section className="panel">
        <div className="toolbar">
          <SearchField value={search} onChange={setSearch} />
          <Badge status={generated[month] ? "Approved" : "Pending"} />
        </div>
        {rows.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Basic salary</th>
                  <th>Deductions</th>
                  <th>Net salary</th>
                  <th>Status</th>
                  <th>Payslip</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => {
                  const p = data(e);
                  return (
                    <tr key={e.id}>
                      <td>
                        <Person employee={e} />
                      </td>
                      <td>{money(p.salary)}</td>
                      <td>{money(p.deductions)}</td>
                      <td className="font-semibold">{money(p.net)}</td>
                      <td>
                        <Badge status={generated[month] ? "Approved" : "Pending"} />
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View salary breakdown"
                            aria-label={`View ${e.name} payslip`}
                            onClick={() => setView(e)}
                          >
                            <Eye />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!generated[month]}
                            onClick={() => void payslip(e)}
                          >
                            <Download />
                            Payslip
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty />
        )}
        <div className="table-footer">
          <span>{rows.length} payroll records</span>
          <span>{generated[month] ? "Generated · Not paid" : "Draft · Ready for review"}</span>
        </div>
      </section>
      <Dialog
        open={view !== null}
        onOpenChange={(o) => {
          if (!o) setView(null);
        }}
      >
        <DialogContent>
          <DialogTitle>Salary breakdown</DialogTitle>
          <DialogDescription>
            {view?.name} · {month} · Demo payslip
          </DialogDescription>
          {view && (
            <>
              <div className="payroll-line">
                <span>Basic salary</span>
                <strong>{money(view.salary)}</strong>
              </div>
              <div className="payroll-line">
                <span>Absence deductions</span>
                <strong>{money(data(view).deductions)}</strong>
              </div>
              <div className="payroll-line border-t pt-4">
                <span>Net salary</span>
                <strong>{money(data(view).net)}</strong>
              </div>
              <Button
                className="mt-5"
                disabled={!generated[month]}
                onClick={() => void payslip(view)}
              >
                <Download />
                Download payslip
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

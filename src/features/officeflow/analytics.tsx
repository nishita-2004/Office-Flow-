import { useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useOfficeFlow } from "./store";
import { AttendanceChart, DepartmentChart } from "./dashboard";
import { PageHeading, PanelHeading, Person, ExportButton, downloadCsv } from "./shared";
import { riskLevel } from "./rules";
export function Analytics() {
  const { employees } = useOfficeFlow();
  const [range, setRange] = useState("2026");
  const year = range === "2026" ? 2026 : 2025;
  const trend = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(year, i, 1).toLocaleDateString("en", { month: "short" }),
    employees: employees.filter((e) => e.joined <= `${year}-${String(i + 1).padStart(2, "0")}-31`)
      .length,
  }));
  const risks = employees.map((e) => ({ ...e, risk: riskLevel(e.salary, e.balance) }));
  const high = risks.filter((e) => e.risk === "High").length;
  return (
    <>
      <PageHeading
        title="HR analytics"
        subtitle="A clearer picture of your people, from every angle."
      >
        <select
          className="control"
          aria-label="Analytics year"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option>2026</option>
          <option>2025</option>
        </select>
        <ExportButton
          onClick={() =>
            downloadCsv("officeflow-analytics.csv", [
              ["Employee", "Department", "Salary", "Leave balance", "Heuristic risk"],
              ...risks.map((e) => [e.name, e.department, e.salary, e.balance, e.risk]),
            ])
          }
        />
      </PageHeading>
      <div className="stats-grid">
        {[
          { label: "Headcount", value: employees.length, foot: "Current demo workforce" },
          {
            label: `New hires in ${range}`,
            value: employees.filter((e) => e.joined.startsWith(range)).length,
            foot: "From employee joining dates",
          },
          {
            label: "Active workforce",
            value: `${Math.round((employees.filter((e) => e.status === "Active").length / Math.max(employees.length, 1)) * 100)}%`,
            foot: "Currently active employees",
          },
          { label: "High-risk flags", value: high, foot: "Rule-based indicators only" },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-top">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-foot">{s.foot}</div>
          </div>
        ))}
      </div>
      <div className="dashboard-charts">
        <section className="panel">
          <PanelHeading
            title="Employee growth"
            subtitle={`Cumulative hires · ${range} · Demo records`}
          />
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ left: -15, right: 15, top: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
                <Line
                  dataKey="employees"
                  name="Employees"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "var(--card)", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-footer">
            Headcount is calculated from fictional joining dates, not forecasts.
          </div>
        </section>
        <section className="panel">
          <PanelHeading title="Department distribution" subtitle="Current organization structure" />
          <DepartmentChart />
        </section>
      </div>
      <div className="dashboard-charts">
        <section className="panel">
          <PanelHeading title="Weekly attendance" subtitle="16–20 November · Fictional snapshot" />
          <div className="legend px-6">
            <span className="legend-item">
              <span className="dot" />
              Present
            </span>
            <span className="legend-item">
              <span className="dot absent" />
              Absent / on leave
            </span>
          </div>
          <div className="chart-area">
            <AttendanceChart />
          </div>
        </section>
        <section className="panel">
          <PanelHeading
            title="Attrition-risk overview"
            subtitle="Rule-based flags, not predictive intelligence"
          />
          <p className="text-xs text-muted-foreground leading-6 px-5 mb-3">
            Salary below ₹20,000 and fewer than 5 leave days: high flag. Salary below ₹40,000:
            medium flag. Other records: low flag. These heuristics do not predict resignation.
          </p>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Indicator</th>
                </tr>
              </thead>
              <tbody>
                {[...risks]
                  .sort(
                    (a, b) =>
                      ({ High: 0, Medium: 1, Low: 2 })[a.risk] -
                      { High: 0, Medium: 1, Low: 2 }[b.risk],
                  )
                  .slice(0, 4)
                  .map((e) => (
                    <tr key={e.id}>
                      <td>
                        <Person employee={e} />
                      </td>
                      <td>
                        <span className={`badge ${e.risk === "Low" ? "active" : "pending"}`}>
                          {e.risk} flag
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

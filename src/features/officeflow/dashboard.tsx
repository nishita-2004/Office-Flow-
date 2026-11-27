import { Link } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Download,
  Plus,
  Users,
  UserCheck,
  Wallet,
  X,
  CheckCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOfficeFlow } from "./store";
import { money, dateLabel } from "./data";
import { Badge, Person, PanelHeading, PageHeading, downloadCsv } from "./shared";
const week = [
  { day: "Mon", present: 21, absent: 3 },
  { day: "Tue", present: 22, absent: 2 },
  { day: "Wed", present: 20, absent: 4 },
  { day: "Thu", present: 23, absent: 1 },
  { day: "Fri", present: 22, absent: 2 },
];
export function AttendanceChart({ period = "This week" }: { period?: string }) {
  const data =
    period === "Last week"
      ? week.map((d) => ({ ...d, present: d.present - 1, absent: d.absent + 1 }))
      : week;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 15, right: 15, left: -20, bottom: 0 }} barGap={4}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          dy={7}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          domain={[0, 24]}
          ticks={[0, 6, 12, 18, 24]}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontSize: 12,
          }}
        />
        <Bar
          name="Present"
          dataKey="present"
          fill="var(--chart-1)"
          radius={[4, 4, 0, 0]}
          barSize={22}
        />
        <Bar
          name="Absent / on leave"
          dataKey="absent"
          fill="var(--chart-3)"
          radius={[4, 4, 0, 0]}
          barSize={22}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
export function DepartmentChart() {
  const { employees, teams } = useOfficeFlow();
  const data = teams.map((t) => ({
    name: t.name,
    value: employees.filter((e) => e.department === t.name).length,
  }));
  return (
    <div className="donut-layout">
      <div className="donut">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius="70%"
              outerRadius="90%"
              paddingAngle={3}
              stroke="none"
            >
              {data.map((d, i) => (
                <Cell key={d.name} fill={i < 5 ? `var(--chart-${i + 1})` : "var(--border)"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center">
          <strong>{employees.length}</strong>
          <span>Total employees</span>
        </div>
      </div>
      <div className="department-legend">
        {data.map((d, i) => (
          <div className="department-row" key={d.name}>
            <span className={`dept-dot dept-${i}`} />
            <span>{d.name}</span>
            <strong>{d.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
export function Dashboard() {
  const { employees, leaves, decide, activities } = useOfficeFlow();
  const [period, setPeriod] = useState("This week");
  const active = employees.filter((e) => e.status === "Active").length;
  const pending = leaves.filter((l) => l.status === "Pending");
  const salary = employees.reduce((s, e) => s + e.salary, 0);
  const stats = [
    {
      label: "Total employees",
      value: String(employees.length),
      icon: Users,
      tone: 0,
      change: "+3",
      foot: "new hires this quarter",
    },
    {
      label: "Active employees",
      value: String(active),
      icon: UserCheck,
      tone: 1,
      change: `${Math.round((active / employees.length) * 100)}%`,
      foot: "of the workforce",
    },
    {
      label: "Pending leave requests",
      value: String(pending.length).padStart(2, "0"),
      icon: CalendarDays,
      tone: 2,
      change: "",
      foot: "Awaiting your approval",
    },
    {
      label: "Monthly payroll",
      value: money(salary),
      icon: Wallet,
      tone: 3,
      change: "",
      foot: "November 2026 · Gross salary",
    },
  ];
  return (
    <>
      <PageHeading
        title="Dashboard"
        subtitle="Welcome back, Nishita. Here’s what’s happening with your team."
      >
        <Button
          variant="outline"
          onClick={() =>
            downloadCsv("officeflow-overview.csv", [
              ["Metric", "Value"],
              ["Employees", employees.length],
              ["Active employees", active],
              ["Pending leaves", pending.length],
              ["Gross payroll", salary],
            ])
          }
        >
          <Download />
          Export report
        </Button>
        <Button asChild>
          <Link to="/employees" search={{ q: "", add: true }}>
            <Plus />
            Add employee
          </Link>
        </Button>
      </PageHeading>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-5">
        <CalendarDays size={13} />
        <span>Monday, 23 November 2026</span>
        <span className="ml-auto demo-label">Demo overview</span>
      </div>
      <div className="stats-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-top">
              <span>{s.label}</span>
              <span className={`stat-icon tone-${s.tone}`}>
                <s.icon size={17} />
              </span>
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-foot">
              {s.change && (
                <span className="trend">
                  <ArrowUpRight size={12} />
                  {s.change}
                </span>
              )}
              {s.foot}
            </div>
          </div>
        ))}
      </div>
      <div className="dashboard-charts">
        <section className="panel">
          <PanelHeading
            title="Attendance overview"
            subtitle="A little consistency goes a long way."
          >
            <select
              className="control text-xs"
              aria-label="Attendance chart period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option>This week</option>
              <option>Last week</option>
            </select>
          </PanelHeading>
          <div className="legend px-6 pt-2">
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
            <AttendanceChart period={period} />
          </div>
          <div className="chart-footer">
            <span className="trend">
              <ArrowUpRight size={12} />
              90%
            </span>
            average attendance · fictional weekly snapshot
          </div>
        </section>
        <section className="panel">
          <PanelHeading title="Employees by department" subtitle="Good people. Great teams." />
          <DepartmentChart />
          <div className="chart-footer">
            <span className="dot" />
            {employees.length} employees across {new Set(employees.map((e) => e.department)).size}{" "}
            departments
          </div>
        </section>
      </div>
      <div className="dashboard-lower">
        <section className="panel">
          <PanelHeading title="Employee directory" subtitle="The people behind the progress.">
            <Button variant="link" size="sm" asChild>
              <Link to="/employees" search={{ q: "" }}>
                View all
                <ArrowRight size={13} />
              </Link>
            </Button>
          </PanelHeading>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {employees.slice(0, 5).map((e) => (
                  <tr key={e.id}>
                    <td>
                      <Person employee={e} />
                    </td>
                    <td>{e.department}</td>
                    <td>
                      <Badge status={e.status} />
                    </td>
                    <td className="text-muted-foreground">
                      {dateLabel(e.joined).replace(" 20", " ’")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span>Showing 5 of {employees.length} employees</span>
            <span>All teams, one place</span>
          </div>
        </section>
        <section className="panel">
          <PanelHeading title="Leave requests" subtitle="A well-rested team is a happy team.">
            <span className="badge pending">{pending.length} pending</span>
          </PanelHeading>
          <div className="request-list">
            {pending.slice(0, 3).map((l) => {
              const e = employees.find((e) => e.id === l.employeeId);
              return e ? (
                <div className="request-row" key={l.id}>
                  <Person employee={e} subtitle={l.type} />
                  <div className="request-actions">
                    <Button
                      variant="outline"
                      size="icon"
                      title={`Reject ${e.name}’s leave`}
                      aria-label={`Reject ${e.name} leave`}
                      onClick={() => decide(l.id, "Rejected")}
                    >
                      <X size={12} />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      title={`Approve ${e.name}’s leave`}
                      aria-label={`Approve ${e.name} leave`}
                      onClick={() => decide(l.id, "Approved")}
                    >
                      <Check size={12} />
                    </Button>
                  </div>
                </div>
              ) : null;
            })}
            {pending.length === 0 && (
              <div className="empty-state py-8">
                <CheckCheck size={25} />
                <p>All caught up. No pending requests.</p>
              </div>
            )}
          </div>
          <div className="px-5 py-3">
            <Button variant="outline" className="w-full text-xs" asChild>
              <Link to="/leaves">
                Manage leave requests
                <ArrowRight size={13} />
              </Link>
            </Button>
          </div>
        </section>
      </div>
      <div className="lower-secondary">
        <section className="panel">
          <PanelHeading title="Recent activity" subtitle="Your workspace, at a glance." />
          <div className="activity-list">
            {activities.slice(0, 3).map((a, i) => (
              <div className="activity-row" key={`${a}-${i}`}>
                <span className="activity-icon">
                  {i === 0 ? (
                    <Check size={13} />
                  ) : i === 1 ? (
                    <Users size={13} />
                  ) : (
                    <Wallet size={13} />
                  )}
                </span>
                <div>
                  <p className="text-xs">{a}</p>
                  <p className="person-meta">
                    {i === 0 ? "Just now" : i === 1 ? "2 hours ago" : "Yesterday"} · Demo activity
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <PanelHeading title="Payroll overview" subtitle="November 2026">
            <Badge status="Pending" />
          </PanelHeading>
          <div className="payroll-summary">
            <div className="payroll-line">
              <span>Total gross payroll</span>
              <strong>{money(salary)}</strong>
            </div>
            <div className="payroll-line">
              <span>Employees included</span>
              <strong>{employees.length} employees</strong>
            </div>
            <div className="progress-track">
              <div className="progress-fill" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Ready for review</span>
              <Button variant="link" size="sm" asChild>
                <Link to="/payroll">
                  View payroll
                  <ArrowRight size={12} />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

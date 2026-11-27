import { useEffect, useState } from "react";
import { Eye, Pencil, Plus, Trash2, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useOfficeFlow } from "./store";
import { type Employee, money, dateLabel } from "./data";
import {
  Avatar,
  Badge,
  Empty,
  ExportButton,
  PageHeading,
  Person,
  SearchField,
  downloadCsv,
} from "./shared";
export function Employees({ query = "", add = false }: { query?: string; add?: boolean }) {
  const { employees, setEmployees, setLeaves, setAttendance, teams, roles, log } = useOfficeFlow();
  const [search, setSearch] = useState(query);
  const [department, setDepartment] = useState("All departments");
  const [status, setStatus] = useState("All statuses");
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<Employee | "new" | null>(null);
  const [view, setView] = useState<Employee | null>(null);
  const [remove, setRemove] = useState<Employee | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    setSearch(query);
    setPage(1);
  }, [query]);
  useEffect(() => {
    if (add) setEditor("new");
  }, [add]);
  const filtered = employees.filter(
    (e) =>
      (e.name + " " + e.email + " " + e.role).toLowerCase().includes(search.toLowerCase()) &&
      (department === "All departments" || e.department === department) &&
      (status === "All statuses" || e.status === status),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  const current = Math.min(page, pages);
  const shown = filtered.slice((current - 1) * 8, current * 8);
  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const salary = Number(form.get("salary"));
    const joined = String(form.get("joined"));
    if (!name.includes(" ")) {
      setError("Enter a first and last name.");
      return;
    }
    if (
      employees.some(
        (e) =>
          e.email.toLowerCase() === email.toLowerCase() &&
          (editor === "new" || e.id !== editor?.id),
      )
    ) {
      setError("An employee with this email already exists.");
      return;
    }
    if (!Number.isFinite(salary) || salary < 0) {
      setError("Salary must be a valid non-negative amount.");
      return;
    }
    const e: Employee = {
      id: editor === "new" ? Math.max(0, ...employees.map((e) => e.id)) + 1 : (editor?.id ?? 0),
      name,
      email,
      department: String(form.get("department")),
      role: String(form.get("role")),
      salary,
      joined,
      status: String(form.get("status")) === "On leave" ? "On leave" : "Active",
      balance: editor === "new" ? 20 : (editor?.balance ?? 20),
      initials: name
        .split(/\s+/)
        .map((n) => n[0])
        .slice(0, 2)
        .join(""),
      tone: editor === "new" ? employees.length % 6 : (editor?.tone ?? 0),
    };
    setEmployees((all) =>
      editor === "new" ? [e, ...all] : all.map((x) => (x.id === e.id ? e : x)),
    );
    log(`${e.name} was ${editor === "new" ? "added to" : "updated in"} the employee directory`);
    setEditor(null);
    setError("");
  };
  return (
    <>
      <PageHeading title="Employees" subtitle="A great workplace starts with great people.">
        <ExportButton
          onClick={() =>
            downloadCsv("officeflow-employees.csv", [
              ["Name", "Email", "Department", "Role", "Salary", "Joining date", "Status"],
              ...filtered.map((e) => [
                e.name,
                e.email,
                e.department,
                e.role,
                e.salary,
                e.joined,
                e.status,
              ]),
            ])
          }
        />
        <Button
          onClick={() => {
            setError("");
            setEditor("new");
          }}
        >
          <Plus />
          Add employee
        </Button>
      </PageHeading>
      <section className="panel">
        <div className="toolbar">
          <SearchField
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />
          <div className="flex gap-2 flex-wrap">
            <select
              aria-label="Department filter"
              className="control text-xs"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
            >
              <option>All departments</option>
              {teams.map((t) => (
                <option key={t.id}>{t.name}</option>
              ))}
            </select>
            <select
              aria-label="Employee status filter"
              className="control text-xs"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option>All statuses</option>
              <option>Active</option>
              <option>On leave</option>
            </select>
          </div>
        </div>
        {shown.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Joining date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <Person employee={e} subtitle={e.email} />
                    </td>
                    <td>{e.department}</td>
                    <td>{e.role}</td>
                    <td>{dateLabel(e.joined)}</td>
                    <td>
                      <Badge status={e.status} />
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`View ${e.name}`}
                          title="View profile"
                          onClick={() => setView(e)}
                        >
                          <Eye />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${e.name}`}
                          title="Edit employee"
                          onClick={() => {
                            setError("");
                            setEditor(e);
                          }}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${e.name}`}
                          title="Delete employee"
                          onClick={() => setRemove(e)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="No employees found" />
        )}
        <div className="table-footer">
          <span>
            {filtered.length
              ? `${(current - 1) * 8 + 1}–${Math.min(current * 8, filtered.length)}`
              : "0"}{" "}
            of {filtered.length} employees
          </span>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous page"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              <ChevronLeft />
            </Button>
            <span>
              Page {current} of {pages}
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next page"
              disabled={current === pages}
              onClick={() => setPage(current + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </section>
      <Dialog
        open={editor !== null}
        onOpenChange={(open) => {
          if (!open) setEditor(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-auto">
          <DialogTitle>{editor === "new" ? "Add employee" : "Edit employee"}</DialogTitle>
          <DialogDescription>Employee details · Demo workspace</DialogDescription>
          {editor && (
            <form
              key={typeof editor === "string" ? "new" : editor.id}
              onSubmit={save}
              className="form-grid"
            >
              <label className="field form-full">
                Full name
                <input
                  name="name"
                  placeholder="First and last name"
                  required
                  maxLength={100}
                  defaultValue={editor === "new" ? "" : editor.name}
                />
              </label>
              <label className="field form-full">
                Work email
                <input
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  defaultValue={editor === "new" ? "" : editor.email}
                />
              </label>
              <label className="field">
                Department
                <select
                  name="department"
                  defaultValue={editor === "new" ? teams[0]?.name : editor.department}
                >
                  {teams.map((t) => (
                    <option key={t.id}>{t.name}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Job role
                <select name="role" defaultValue={editor === "new" ? roles[0] : editor.role}>
                  {roles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Monthly salary (₹)
                <input
                  name="salary"
                  type="number"
                  min="0"
                  required
                  defaultValue={editor === "new" ? "" : editor.salary}
                />
              </label>
              <label className="field">
                Joining date
                <input
                  name="joined"
                  type="date"
                  required
                  defaultValue={editor === "new" ? "2026-11-23" : editor.joined}
                />
              </label>
              <label className="field form-full">
                Status
                <select name="status" defaultValue={editor === "new" ? "Active" : editor.status}>
                  <option>Active</option>
                  <option>On leave</option>
                </select>
              </label>
              {error && (
                <p role="alert" className="form-error form-full">
                  {error}
                </p>
              )}
              <div className="form-actions form-full">
                <Button type="button" variant="outline" onClick={() => setEditor(null)}>
                  Cancel
                </Button>
                <Button type="submit">{editor === "new" ? "Add employee" : "Save changes"}</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={view !== null}
        onOpenChange={(open) => {
          if (!open) setView(null);
        }}
      >
        <DialogContent>
          <DialogTitle>Employee profile</DialogTitle>
          <DialogDescription>OfficeFlow employee record</DialogDescription>
          {view && (
            <>
              <div className="person mt-3">
                <Avatar employee={view} />
                <div>
                  <h2 className="text-lg font-semibold">{view.name}</h2>
                  <p className="text-sm text-muted-foreground">{view.role}</p>
                </div>
                <span className="ml-auto">
                  <Badge status={view.status} />
                </span>
              </div>
              <dl className="profile-grid">
                {[
                  ["Email", view.email],
                  ["Department", view.department],
                  ["Monthly salary", money(view.salary)],
                  ["Joining date", dateLabel(view.joined)],
                  ["Leave balance", `${view.balance} days`],
                  ["Employee ID", `OF-${String(view.id).padStart(4, "0")}`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd className="break-all text-sm">{v}</dd>
                  </div>
                ))}
              </dl>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => {
                  setEditor(view);
                  setView(null);
                }}
              >
                <Pencil />
                Edit profile
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={remove !== null}
        onOpenChange={(open) => {
          if (!open) setRemove(null);
        }}
      >
        <DialogContent>
          <DialogTitle>Delete employee?</DialogTitle>
          <DialogDescription>
            {remove?.name} and their related demo leave and attendance records will be removed from
            this workspace.
          </DialogDescription>
          <div className="form-actions">
            <Button variant="outline" onClick={() => setRemove(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!remove) return;
                setEmployees((all) => all.filter((e) => e.id !== remove.id));
                setLeaves((all) => all.filter((l) => l.employeeId !== remove.id));
                setAttendance((all) =>
                  Object.fromEntries(
                    Object.entries(all).filter(([key]) => !key.endsWith(`:${remove.id}`)),
                  ),
                );
                log(`${remove.name} was removed from the directory`);
                setRemove(null);
              }}
            >
              Delete employee
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useOfficeFlow } from "./store";
import { dateLabel, leaveDays, type Leave } from "./data";
import { Badge, Empty, PageHeading, Person } from "./shared";
export function Leaves() {
  const { employees, leaves, setLeaves, decide, log } = useOfficeFlow();
  const [tab, setTab] = useState("All requests");
  const [apply, setApply] = useState(false);
  const [error, setError] = useState("");
  const [balanceId, setBalanceId] = useState(7);
  const [selectedEmployee, setSelectedEmployee] = useState(7);
  const [notice, setNotice] = useState("");
  const validLeaves = leaves.filter((l) => employees.some((e) => e.id === l.employeeId));
  const filtered = validLeaves.filter(
    (l) =>
      tab === "All requests" ||
      (tab === "My leave history" && l.employeeId === balanceId) ||
      l.status === tab,
  );
  const balance = employees.find((e) => e.id === balanceId);
  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const start = String(f.get("start"));
    const end = String(f.get("end"));
    const days = leaveDays(start, end);
    const e = employees.find((e) => e.id === selectedEmployee);
    if (!e) {
      setError("Select an employee.");
      return;
    }
    if (!Number.isFinite(days) || days < 1) {
      setError("The end date must be on or after the start date.");
      return;
    }
    if (days > e.balance) {
      setError(`This employee has ${e.balance} days remaining. Choose a shorter date range.`);
      return;
    }
    if (
      validLeaves.some(
        (l) => l.employeeId === e.id && l.status !== "Rejected" && start <= l.end && end >= l.start,
      )
    ) {
      setError("This date range overlaps an existing leave request.");
      return;
    }
    const request: Leave = {
      id: Math.max(0, ...leaves.map((l) => l.id)) + 1,
      employeeId: e.id,
      type: String(f.get("type")),
      start,
      end,
      reason: String(f.get("reason")).trim(),
      status: "Pending",
    };
    setLeaves((all) => [request, ...all]);
    log(`${e.name} submitted a leave request`);
    setApply(false);
    setNotice("Leave request submitted for approval.");
  };
  return (
    <>
      <PageHeading title="Leave management" subtitle="Make room for life outside of work.">
        <Button
          onClick={() => {
            setError("");
            setApply(true);
          }}
        >
          <Plus />
          Apply for leave
        </Button>
      </PageHeading>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">Pending requests</div>
          <div className="stat-value">
            {validLeaves.filter((l) => l.status === "Pending").length}
          </div>
          <div className="stat-foot">Awaiting your review</div>
        </div>
        <div className="stat-card">
          <div className="stat-top">Approved requests</div>
          <div className="stat-value">
            {validLeaves.filter((l) => l.status === "Approved").length}
          </div>
          <div className="stat-foot">Across the demo workspace</div>
        </div>
        <div className="stat-card">
          <div className="stat-top">Rejected requests</div>
          <div className="stat-value">
            {validLeaves.filter((l) => l.status === "Rejected").length}
          </div>
          <div className="stat-foot">All recorded decisions</div>
        </div>
        <div className="stat-card">
          <div className="stat-top">Employee leave balance</div>
          <div className="stat-value">
            {balance?.balance ?? 0}{" "}
            <span className="text-sm font-normal text-muted-foreground">days</span>
          </div>
          <select
            className="control text-xs max-w-full"
            aria-label="Leave balance employee"
            value={balanceId}
            onChange={(e) => setBalanceId(Number(e.target.value))}
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="tabs overflow-x-auto">
        {["All requests", "Pending", "Approved", "Rejected", "My leave history"].map((t) => (
          <Button
            key={t}
            variant="ghost"
            className={tab === t ? "selected" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </Button>
        ))}
      </div>
      {notice && (
        <p role="status" className="text-success text-sm mb-4">
          {notice}
        </p>
      )}
      <section className="panel">
        {filtered.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave type</th>
                  <th>Date range</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => {
                  const e = employees.find((e) => e.id === l.employeeId);
                  return e ? (
                    <tr key={l.id}>
                      <td>
                        <Person employee={e} />
                      </td>
                      <td>{l.type}</td>
                      <td>
                        {dateLabel(l.start)} – {dateLabel(l.end)}
                      </td>
                      <td>{leaveDays(l.start, l.end)}</td>
                      <td title={l.reason}>{l.reason}</td>
                      <td>
                        <Badge status={l.status} />
                      </td>
                      <td>
                        {l.status === "Pending" ? (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              title="Reject request"
                              aria-label={`Reject ${e.name} leave`}
                              onClick={() => decide(l.id, "Rejected")}
                            >
                              <X />
                            </Button>
                            <Button
                              variant="secondary"
                              size="icon"
                              title="Approve request"
                              aria-label={`Approve ${e.name} leave`}
                              onClick={() => decide(l.id, "Approved")}
                            >
                              <Check />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ) : null;
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="No leave requests"
            description="Requests matching this view will appear here."
          />
        )}
        <div className="table-footer">
          <span>{filtered.length} requests</span>
          <span>Calendar days · Fictional balances</span>
        </div>
      </section>
      <Dialog open={apply} onOpenChange={setApply}>
        <DialogContent>
          <DialogTitle>Apply for leave</DialogTitle>
          <DialogDescription>Submit a request for HR approval</DialogDescription>
          <form onSubmit={save} className="form-grid">
            <label className="field form-full">
              Employee
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(Number(e.target.value))}
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} · {e.balance} days left
                  </option>
                ))}
              </select>
            </label>
            <label className="field form-full">
              Leave type
              <select name="type">
                <option>Casual leave</option>
                <option>Sick leave</option>
                <option>Annual leave</option>
              </select>
            </label>
            <label className="field">
              Start date
              <input name="start" type="date" required />
            </label>
            <label className="field">
              End date
              <input name="end" type="date" required />
            </label>
            <label className="field form-full">
              Reason
              <textarea
                name="reason"
                rows={3}
                required
                maxLength={500}
                placeholder="A brief reason for your request"
              />
            </label>
            {error && (
              <p role="alert" className="form-error form-full">
                {error}
              </p>
            )}
            <div className="form-actions form-full">
              <Button type="button" variant="outline" onClick={() => setApply(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit request</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useEffect, useState } from "react";
import { CalendarDays, Check, Download, LoaderCircle, QrCode, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useOfficeFlow } from "./store";
import {
  Badge,
  Empty,
  ExportButton,
  PageHeading,
  Person,
  SearchField,
  downloadCsv,
} from "./shared";
export const demoAttendanceDates = [
  "2026-11-16",
  "2026-11-17",
  "2026-11-18",
  "2026-11-19",
  "2026-11-20",
  "2026-11-23",
];
export function attendanceStatus(
  date: string,
  id: number,
  records: Record<string, string>,
): string {
  return (
    records[`${date}:${id}`] ??
    (demoAttendanceDates.includes(date)
      ? id === 4 || id === 9 || (id + Number(date.slice(-2))) % 17 === 0
        ? "Absent"
        : "Present"
      : "Unmarked")
  );
}
export function Attendance() {
  const { employees, attendance, setAttendance, log } = useOfficeFlow();
  const [date, setDate] = useState("2026-11-23");
  const [tab, setTab] = useState("Daily attendance");
  const [search, setSearch] = useState("");
  const [qr, setQr] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const [qrError, setQrError] = useState("");
  const [employee, setEmployee] = useState(7);
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!qr) return;
    let canceled = false;
    setQrImage("");
    setQrError("");
    import("qrcode")
      .then((q) => q.toDataURL(`ATTENDANCE-${date}`, { width: 280, margin: 2 }))
      .then((url) => {
        if (!canceled) setQrImage(url);
      })
      .catch(() => {
        if (!canceled) setQrError("Attendance code could not be generated. Please try again.");
      });
    return () => {
      canceled = true;
    };
  }, [qr, date]);
  const rows = employees.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));
  const records = { ...attendance, ...draft };
  const present = employees.filter(
    (e) => attendanceStatus(date, e.id, records) === "Present",
  ).length;
  const absent = employees.filter((e) => attendanceStatus(date, e.id, records) === "Absent").length;
  return (
    <>
      <PageHeading
        title="Attendance"
        subtitle="Every day counts. Keep your team’s attendance in sync."
      >
        <Button variant="outline" onClick={() => setQr(true)}>
          <QrCode />
          QR attendance
        </Button>
        <ExportButton
          onClick={() =>
            downloadCsv("officeflow-attendance.csv", [
              ["Employee", "Date", "Status"],
              ...rows.map((e) => [e.name, date, attendanceStatus(date, e.id, records)]),
            ])
          }
        />
      </PageHeading>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            Present today
            <span className="stat-icon tone-0">
              <Check size={17} />
            </span>
          </div>
          <div className="stat-value">{present}</div>
          <div className="stat-foot">Selected date: {date}</div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            Absent / on leave
            <span className="stat-icon tone-2">
              <X size={17} />
            </span>
          </div>
          <div className="stat-value">{absent}</div>
          <div className="stat-foot">Includes approved time off</div>
        </div>
        <div className="stat-card">
          <div className="stat-top">Attendance rate</div>
          <div className="stat-value">
            {employees.length ? Math.round((present / employees.length) * 100) : 0}%
          </div>
          <div className="stat-foot">Of {employees.length} employees</div>
        </div>
        <div className="stat-card">
          <div className="stat-top">Unmarked</div>
          <div className="stat-value">{employees.length - present - absent}</div>
          <div className="stat-foot">Awaiting attendance entry</div>
        </div>
      </div>
      <div className="tabs">
        {["Daily attendance", "History", "Reports"].map((t) => (
          <Button
            key={t}
            className={tab === t ? "selected" : ""}
            variant="ghost"
            onClick={() => setTab(t)}
          >
            {t}
          </Button>
        ))}
      </div>
      <section className="panel">
        <div className="toolbar">
          <SearchField value={search} onChange={setSearch} />
          <div className="flex gap-3 items-center">
            <label className="field">
              <input
                type="date"
                aria-label="Attendance date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setNotice("");
                }}
              />
            </label>
            {tab === "Daily attendance" && (
              <Button
                onClick={() => {
                  setAttendance((all) => ({ ...all, ...draft }));
                  setDraft({});
                  setNotice("Attendance saved in this demo workspace.");
                  log(`Attendance was updated for ${date}`);
                }}
              >
                <Save />
                Save attendance
              </Button>
            )}
          </div>
        </div>
        {notice && (
          <p role="status" className="px-5 pb-4 text-success text-xs">
            {notice}
          </p>
        )}
        {rows.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  {tab === "Reports" ? (
                    <>
                      <th>Present days</th>
                      <th>Absent days</th>
                      <th>Attendance rate</th>
                    </>
                  ) : (
                    <>
                      <th>Date</th>
                      <th>Status</th>
                      {tab === "Daily attendance" && <th>Mark attendance</th>}
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => {
                  const s = attendanceStatus(date, e.id, records);
                  const days = demoAttendanceDates.filter(
                    (d) => attendanceStatus(d, e.id, attendance) === "Present",
                  ).length;
                  return (
                    <tr key={e.id}>
                      <td>
                        <Person employee={e} />
                      </td>
                      <td>{e.department}</td>
                      {tab === "Reports" ? (
                        <>
                          <td>{days}</td>
                          <td>{demoAttendanceDates.length - days}</td>
                          <td>{Math.round((days / demoAttendanceDates.length) * 100)}%</td>
                        </>
                      ) : (
                        <>
                          <td>{date}</td>
                          <td>
                            <Badge status={s} />
                          </td>
                          {tab === "Daily attendance" && (
                            <td>
                              <select
                                className="control"
                                aria-label={`Attendance for ${e.name}`}
                                value={s}
                                onChange={(event) =>
                                  setDraft((all) => ({
                                    ...all,
                                    [`${date}:${e.id}`]: event.target.value,
                                  }))
                                }
                              >
                                <option>Unmarked</option>
                                <option>Present</option>
                                <option>Absent</option>
                              </select>
                            </td>
                          )}
                        </>
                      )}
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
          <span>
            {tab === "Reports"
              ? "Report covers six seeded working days in November 2026"
              : "Fictional attendance records"}
          </span>
          <span>{rows.length} employees</span>
        </div>
      </section>
      <Dialog open={qr} onOpenChange={setQr}>
        <DialogContent>
          <DialogTitle>QR attendance</DialogTitle>
          <DialogDescription>Demo attendance token for {date}</DialogDescription>
          {qrImage ? (
            <img src={qrImage} className="qr-image" alt={`Attendance QR code for ${date}`} />
          ) : qrError ? (
            <p className="form-error" role="alert">
              {qrError}
            </p>
          ) : (
            <LoaderCircle className="loading-spinner mx-auto my-12" />
          )}
          <p className="text-xs text-muted-foreground text-center">
            ATTENDANCE-{date} · Not connected to Django
          </p>
          <label className="field">
            Demo employee
            <select value={employee} onChange={(e) => setEmployee(Number(e.target.value))}>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </label>
          <Button
            onClick={() => {
              setAttendance((a) => ({ ...a, [`${date}:${employee}`]: "Present" }));
              setQr(false);
              setNotice("Demo QR check-in recorded as present.");
              log(`QR check-in was recorded for ${employees.find((e) => e.id === employee)?.name}`);
            }}
          >
            <Check />
            Simulate check-in
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

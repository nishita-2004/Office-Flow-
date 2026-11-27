import { type ReactNode } from "react";
import { Download, Search, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Employee } from "./data";
export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} · OfficeFlow` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} · OfficeFlow` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
export function Avatar({ employee }: { employee: Pick<Employee, "initials" | "tone"> }) {
  return <span className={`avatar tone-${employee.tone}`}>{employee.initials}</span>;
}
export function Person({ employee, subtitle }: { employee: Employee; subtitle?: string }) {
  return (
    <div className="person">
      <Avatar employee={employee} />
      <div>
        <div className="person-name">{employee.name}</div>
        <div className="person-meta">{subtitle ?? employee.role}</div>
      </div>
    </div>
  );
}
export function Badge({ status }: { status: string }) {
  return <span className={`badge ${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</span>;
}
export function PageHeading({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="heading-actions">{children}</div>
    </div>
  );
}
export function PanelHeading({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="panel-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
export function SearchField({
  value,
  onChange,
  placeholder = "Search employees…",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="search-field">
      <Search size={15} />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
export function Empty({
  title = "No results found",
  description = "Try a different search or filter.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="empty-state">
      <SearchX size={30} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const text = rows
    .map((row) => row.map((x) => `"${String(x).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
export function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" onClick={onClick}>
      <Download />
      Export report
    </Button>
  );
}

import { useState } from "react";
import { Building2, MapPin, Pencil, Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useOfficeFlow } from "./store";
import { type Department } from "./data";
import { PageHeading } from "./shared";
export function Departments() {
  const { teams, setTeams, employees, setEmployees, roles, setRoles, log } = useOfficeFlow();
  const [edit, setEdit] = useState<Department | "new" | null>(null);
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleEdit, setRoleEdit] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [remove, setRemove] = useState<{ kind: "team" | "role"; name: string } | null>(null);
  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name")).trim();
    if (
      teams.some(
        (t) => t.name.toLowerCase() === name.toLowerCase() && (edit === "new" || t.id !== edit?.id),
      )
    ) {
      setError("This department already exists.");
      return;
    }
    const t = {
      id: edit === "new" ? Math.max(0, ...teams.map((t) => t.id)) + 1 : (edit?.id ?? 0),
      name,
      location: String(f.get("location")).trim(),
      lead: String(f.get("lead")).trim(),
    };
    setTeams((all) => (edit === "new" ? [...all, t] : all.map((x) => (x.id === t.id ? t : x))));
    if (edit && edit !== "new")
      setEmployees((all) =>
        all.map((e) => (e.department === edit.name ? { ...e, department: name } : e)),
      );
    log(`${name} department was ${edit === "new" ? "created" : "updated"}`);
    setEdit(null);
  };
  return (
    <>
      <PageHeading
        title="Departments & roles"
        subtitle="Give every team a place to do their best work."
      >
        <Button
          onClick={() => {
            setError("");
            setEdit("new");
          }}
        >
          <Plus />
          Add department
        </Button>
      </PageHeading>
      <div className="teams-grid">
        {teams.map((t, i) => (
          <article className="team-card" key={t.id}>
            <div className="flex justify-between">
              <span className={`stat-icon tone-${i % 4}`}>
                <Building2 size={18} />
              </span>
              <div className="flex">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Edit department"
                  aria-label={`Edit ${t.name}`}
                  onClick={() => {
                    setError("");
                    setEdit(t);
                  }}
                >
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Delete department"
                  aria-label={`Delete ${t.name}`}
                  onClick={() => setRemove({ kind: "team", name: t.name })}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
            <h2>{t.name}</h2>
            <p className="flex items-center gap-1">
              <MapPin size={12} />
              {t.location}
            </p>
            <div className="team-card-bottom">
              <span className="text-xs flex items-center gap-2">
                <Users size={14} />
                {employees.filter((e) => e.department === t.name).length} employees
              </span>
              <span className="text-xs text-muted-foreground">Lead: {t.lead}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="section-heading">
        <h2>Job roles</h2>
        <Button
          variant="outline"
          onClick={() => {
            setRoleEdit(null);
            setError("");
            setRoleOpen(true);
          }}
        >
          <Plus />
          Add role
        </Button>
      </div>
      <div className="role-list">
        {roles.map((r) => (
          <div className="role-item" key={r}>
            <span>{r}</span>
            <span className="text-muted-foreground">
              {employees.filter((e) => e.role === r).length}
            </span>
            <Button
              size="icon"
              variant="ghost"
              title="Edit role"
              aria-label={`Edit role ${r}`}
              onClick={() => {
                setRoleEdit(r);
                setError("");
                setRoleOpen(true);
              }}
            >
              <Pencil />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              title="Delete role"
              aria-label={`Delete role ${r}`}
              onClick={() => setRemove({ kind: "role", name: r })}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>
      <Dialog
        open={edit !== null}
        onOpenChange={(o) => {
          if (!o) setEdit(null);
        }}
      >
        <DialogContent>
          <DialogTitle>{edit === "new" ? "Add department" : "Edit department"}</DialogTitle>
          <DialogDescription>Organize your people and locations</DialogDescription>
          <form className="form-grid" onSubmit={save}>
            <label className="field form-full">
              Department name
              <input name="name" required defaultValue={edit && edit !== "new" ? edit.name : ""} />
            </label>
            <label className="field form-full">
              Location
              <input
                name="location"
                required
                defaultValue={edit && edit !== "new" ? edit.location : ""}
              />
            </label>
            <label className="field form-full">
              Department lead
              <input name="lead" required defaultValue={edit && edit !== "new" ? edit.lead : ""} />
            </label>
            {error && (
              <p className="form-error form-full" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="form-full">
              Save department
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={roleOpen} onOpenChange={setRoleOpen}>
        <DialogContent>
          <DialogTitle>{roleEdit ? "Edit role" : "Add role"}</DialogTitle>
          <DialogDescription>Job title in your organization</DialogDescription>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const value = String(new FormData(e.currentTarget).get("role")).trim();
              if (roles.some((r) => r.toLowerCase() === value.toLowerCase() && r !== roleEdit)) {
                setError("This role already exists.");
                return;
              }
              setRoles((all) =>
                roleEdit ? all.map((r) => (r === roleEdit ? value : r)) : [...all, value],
              );
              if (roleEdit)
                setEmployees((all) =>
                  all.map((e) => (e.role === roleEdit ? { ...e, role: value } : e)),
                );
              setRoleOpen(false);
              log(`${value} job role was saved`);
            }}
          >
            <label className="field">
              Role name
              <input name="role" required defaultValue={roleEdit ?? ""} />
            </label>
            {error && (
              <p className="form-error mt-3" role="alert">
                {error}
              </p>
            )}
            <Button className="mt-4" type="submit">
              Save role
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={remove !== null}
        onOpenChange={(o) => {
          if (!o) setRemove(null);
        }}
      >
        <DialogContent>
          <DialogTitle>Delete {remove?.name}?</DialogTitle>
          <DialogDescription>
            {employees.some((e) =>
              remove?.kind === "team" ? e.department === remove.name : e.role === remove?.name,
            )
              ? "This item is assigned to employees. Reassign those employees before deleting it."
              : "This empty item can be removed from the demo workspace."}
          </DialogDescription>
          <div className="form-actions">
            <Button variant="outline" onClick={() => setRemove(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={employees.some((e) =>
                remove?.kind === "team" ? e.department === remove.name : e.role === remove?.name,
              )}
              onClick={() => {
                if (!remove) return;
                if (remove.kind === "team")
                  setTeams((all) => all.filter((t) => t.name !== remove.name));
                else setRoles((all) => all.filter((r) => r !== remove.name));
                setRemove(null);
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

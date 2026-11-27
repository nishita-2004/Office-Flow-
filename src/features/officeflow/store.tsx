import { createContext, useContext, useState, type ReactNode } from "react";
import {
  departments,
  initialEmployees,
  initialLeaves,
  resolveLeave,
  type Department,
  type Employee,
  type Leave,
} from "./data";
type Store = {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  leaves: Leave[];
  setLeaves: React.Dispatch<React.SetStateAction<Leave[]>>;
  teams: Department[];
  setTeams: React.Dispatch<React.SetStateAction<Department[]>>;
  roles: string[];
  setRoles: React.Dispatch<React.SetStateAction<string[]>>;
  attendance: Record<string, string>;
  setAttendance: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  generatedPayroll: Record<string, boolean>;
  setGeneratedPayroll: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  activities: string[];
  log: (text: string) => void;
  decide: (id: number, action: "Approved" | "Rejected") => void;
};
const Context = createContext<Store | null>(null);
export function OfficeFlowProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [leaves, setLeaves] = useState(initialLeaves);
  const [teams, setTeams] = useState(departments);
  const [roles, setRoles] = useState([...new Set(initialEmployees.map((e) => e.role))]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [generatedPayroll, setGeneratedPayroll] = useState<Record<string, boolean>>({
    "October 2026": true,
  });
  const [activities, setActivities] = useState([
    "Nishita Rao approved Sneha Gupta’s leave request",
    "Neil Dutta joined the Engineering team",
    "October payroll was completed",
    "Priya Sharma submitted a leave request",
  ]);
  const log = (text: string) => setActivities((a) => [text, ...a].slice(0, 20));
  const decide = (id: number, action: "Approved" | "Rejected") => {
    const leave = leaves.find((l) => l.id === id);
    const employee = employees.find((e) => e.id === leave?.employeeId);
    if (!leave || !employee) return;
    const result = resolveLeave(leave, employee, action);
    setLeaves((l) => l.map((x) => (x.id === id ? result.leave : x)));
    setEmployees((e) => e.map((x) => (x.id === employee.id ? result.employee : x)));
    log(`${employee.name}’s leave request was ${result.leave.status.toLowerCase()}`);
  };
  return (
    <Context.Provider
      value={{
        employees,
        setEmployees,
        leaves,
        setLeaves,
        teams,
        setTeams,
        roles,
        setRoles,
        attendance,
        setAttendance,
        generatedPayroll,
        setGeneratedPayroll,
        activities,
        log,
        decide,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useOfficeFlow() {
  const value = useContext(Context);
  if (!value) throw new Error("OfficeFlow provider is required");
  return value;
}

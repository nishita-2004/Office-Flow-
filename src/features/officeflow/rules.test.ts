import { describe, expect, it } from "vitest";
import {
  initialEmployees,
  leaveDays,
  payrollFor,
  resolveLeave,
  screenResume,
  type Leave,
} from "./data";
import { riskLevel } from "./rules";

describe("OfficeFlow demo business rules", () => {
  it("matches required resume keywords without claiming AI intelligence", () => {
    expect(
      screenResume("Experienced Python developer using Django and SQL", [
        "Python",
        "Django",
        "SQL",
      ]),
    ).toEqual({ score: 100, matches: ["Python", "Django", "SQL"], missing: [] });
    expect(screenResume("No relevant experience", ["Python", "Django", "SQL"]).score).toBe(0);
    expect(screenResume("pythonic sqlserver", ["Python", "SQL"]).score).toBe(0);
  });
  it("uses the existing source 20-day initial leave balance", () => {
    expect(initialEmployees[0]?.balance).toBe(20);
  });
  it("counts both endpoints in a leave range", () => {
    expect(leaveDays("2026-11-25", "2026-11-26")).toBe(2);
  });
  it("deducts approved leave exactly once and refuses insufficient balance", () => {
    const employee = initialEmployees[0];
    if (!employee) throw new Error("Fixture missing");
    const leave: Leave = {
      id: 99,
      employeeId: employee.id,
      type: "Casual leave",
      start: "2026-11-25",
      end: "2026-11-26",
      reason: "Family",
      status: "Pending",
    };
    const approved = resolveLeave(leave, employee, "Approved");
    expect(approved.employee.balance).toBe(18);
    expect(approved.leave.status).toBe("Approved");
    expect(resolveLeave(approved.leave, approved.employee, "Approved").employee.balance).toBe(18);
    const refused = resolveLeave(leave, { ...employee, balance: 1 }, "Approved");
    expect(refused.leave.status).toBe("Rejected");
    expect(refused.employee.balance).toBe(1);
  });
  it("uses the source 30-day payroll divisor and truncates deductions", () => {
    const e = initialEmployees[0];
    if (!e) throw new Error("Fixture missing");
    expect(payrollFor({ ...e, salary: 60000 }, 2)).toEqual({
      salary: 60000,
      deductions: 4000,
      net: 56000,
    });
  });
  it("preserves the source heuristic risk thresholds without prediction", () => {
    expect(riskLevel(19999, 4)).toBe("High");
    expect(riskLevel(19999, 5)).toBe("Medium");
    expect(riskLevel(39999, 20)).toBe("Medium");
    expect(riskLevel(40000, 20)).toBe("Low");
  });
});

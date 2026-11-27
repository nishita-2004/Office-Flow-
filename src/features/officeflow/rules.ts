export function riskLevel(salary: number, leaveBalance: number): "High" | "Medium" | "Low" {
  if (salary < 20000 && leaveBalance < 5) return "High";
  if (salary < 40000) return "Medium";
  return "Low";
}

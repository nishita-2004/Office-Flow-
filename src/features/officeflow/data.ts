export type Employee = {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  salary: number;
  joined: string;
  status: "Active" | "On leave";
  balance: number;
  initials: string;
  tone: number;
};
export type Leave = {
  id: number;
  employeeId: number;
  type: string;
  start: string;
  end: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
};
export type Department = { id: number; name: string; location: string; lead: string };
export const departments: Department[] = [
  { id: 1, name: "Engineering", location: "Bengaluru", lead: "Arjun Mehta" },
  { id: 2, name: "Design", location: "Mumbai", lead: "Priya Sharma" },
  { id: 3, name: "Marketing", location: "Mumbai", lead: "Rohan Patel" },
  { id: 4, name: "Human Resources", location: "Bengaluru", lead: "Nishita Chauhan" },
  { id: 5, name: "Sales", location: "Delhi", lead: "Vikram Singh" },
  { id: 6, name: "Finance", location: "Bengaluru", lead: "Ananya Iyer" },
];
const people = [
  ["Arjun Mehta", "Engineering", "Senior Engineer", 85000, "2022-03-14"],
  ["Priya Sharma", "Design", "Product Designer", 72000, "2023-06-12"],
  ["Rohan Patel", "Marketing", "Marketing Lead", 68000, "2022-11-07"],
  ["Sneha Gupta", "Engineering", "Frontend Developer", 62000, "2024-01-15"],
  ["Vikram Singh", "Sales", "Sales Manager", 78000, "2021-08-23"],
  ["Ananya Iyer", "Finance", "Finance Analyst", 65000, "2023-04-10"],
  ["Nishita Chauhan", "Human Resources", "HR Manager", 75000, "2022-02-01"],
  ["Kabir Das", "Engineering", "Backend Developer", 70000, "2024-06-03"],
  ["Meera Nair", "Design", "UX Researcher", 60000, "2024-02-12"],
  ["Aditya Shah", "Sales", "Account Executive", 52000, "2025-01-06"],
  ["Ishita Roy", "Marketing", "Content Strategist", 48000, "2025-03-17"],
  ["Rahul Verma", "Engineering", "QA Engineer", 55000, "2025-04-21"],
  ["Aditi Kapoor", "Human Resources", "HR Executive", 45000, "2025-05-05"],
  ["Dev Malhotra", "Engineering", "DevOps Engineer", 82000, "2023-07-10"],
  ["Tara Menon", "Finance", "Accountant", 51000, "2024-09-09"],
  ["Neha Joshi", "Sales", "Sales Executive", 46000, "2025-10-13"],
  ["Sahil Bhat", "Engineering", "Software Engineer", 64000, "2025-08-04"],
  ["Diya Sen", "Design", "Visual Designer", 58000, "2025-06-16"],
  ["Karan Sethi", "Marketing", "SEO Specialist", 49000, "2025-07-07"],
  ["Pooja Reddy", "Engineering", "Data Analyst", 61000, "2026-02-09"],
  ["Aarav Kumar", "Sales", "Business Development", 54000, "2026-03-02"],
  ["Simran Kaur", "Engineering", "Software Engineer", 66000, "2026-05-18"],
  ["Zoya Ali", "Human Resources", "Recruiter", 50000, "2026-07-06"],
  ["Neil Dutta", "Engineering", "Engineering Intern", 28000, "2026-10-05"],
] as const;
export const initialEmployees: Employee[] = people.map(
  ([name, department, role, salary, joined], i) => ({
    id: i + 1,
    name,
    department,
    role,
    salary,
    joined,
    email: name.toLowerCase().replace(" ", ".") + "@officeflow.example",
    status: i === 3 || i === 8 ? "On leave" : "Active",
    balance: 20 - (i % 9),
    initials: name
      .split(" ")
      .map((n) => n[0])
      .join(""),
    tone: i % 6,
  }),
);
export const initialLeaves: Leave[] = [
  {
    id: 1,
    employeeId: 2,
    type: "Casual leave",
    start: "2026-11-25",
    end: "2026-11-26",
    reason: "Family commitment",
    status: "Pending",
  },
  {
    id: 2,
    employeeId: 8,
    type: "Sick leave",
    start: "2026-11-23",
    end: "2026-11-23",
    reason: "Medical appointment",
    status: "Pending",
  },
  {
    id: 3,
    employeeId: 5,
    type: "Annual leave",
    start: "2026-11-27",
    end: "2026-11-30",
    reason: "Planned holiday",
    status: "Pending",
  },
  {
    id: 4,
    employeeId: 4,
    type: "Casual leave",
    start: "2026-11-23",
    end: "2026-11-24",
    reason: "Personal commitment",
    status: "Approved",
  },
  {
    id: 5,
    employeeId: 9,
    type: "Annual leave",
    start: "2026-11-20",
    end: "2026-11-24",
    reason: "Family vacation",
    status: "Approved",
  },
  {
    id: 6,
    employeeId: 12,
    type: "Casual leave",
    start: "2026-11-18",
    end: "2026-11-18",
    reason: "Personal errand",
    status: "Rejected",
  },
];
export const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
export const dateLabel = (value: string) =>
  new Date(value + "T12:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
export function leaveDays(start: string, end: string) {
  return Math.round((Date.parse(end) - Date.parse(start)) / 86400000) + 1;
}
export function screenResume(text: string, keywords: string[]) {
  const normalized = text.toLowerCase();
  const matches = keywords.filter((k) =>
    new RegExp("\\b" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i").test(normalized),
  );
  return {
    matches,
    missing: keywords.filter((k) => !matches.includes(k)),
    score: keywords.length ? Math.round((matches.length / keywords.length) * 100) : 0,
  };
}
export function payrollFor(employee: Employee, absentDays: number, totalDays = 30) {
  const deductions = Math.trunc((employee.salary / totalDays) * absentDays);
  return { salary: employee.salary, deductions, net: employee.salary - deductions };
}
export function resolveLeave(
  leave: Leave,
  employee: Employee,
  action: "Approved" | "Rejected",
): { leave: Leave; employee: Employee } {
  if (leave.status !== "Pending") return { leave, employee };
  const days = leaveDays(leave.start, leave.end);
  const approved = action === "Approved" && days > 0 && employee.balance >= days;
  return {
    leave: { ...leave, status: approved ? "Approved" : "Rejected" },
    employee: { ...employee, balance: approved ? employee.balance - days : employee.balance },
  };
}

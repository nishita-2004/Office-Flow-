import { useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOfficeFlow } from "./store";
import { money } from "./data";
import { PageHeading, PanelHeading } from "./shared";
export function Assistant() {
  const { employees, leaves, teams } = useOfficeFlow();
  const [employeeId, setEmployeeId] = useState(7);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Good morning, Nishita. What would you like to know about your team today?",
    },
  ]);
  const send = (text: string) => {
    if (!text.trim()) return;
    const q = text.toLowerCase();
    const e = employees.find((e) => e.id === employeeId);
    let answer =
      "I can look up leave balances, monthly salaries, employee information, team counts, and pending leave requests in this demo workspace.";
    if (q.includes("leave") && (q.includes("pending") || q.includes("request")))
      answer = `There are ${leaves.filter((l) => l.status === "Pending" && employees.some((e) => e.id === l.employeeId)).length} pending leave requests. You can review them in Leave Management.`;
    else if (q.includes("leave") || q.includes("balance"))
      answer = e
        ? `${e.name} has ${e.balance} days of leave remaining.`
        : "Select an employee first.";
    else if (q.includes("salary") || q.includes("pay"))
      answer = e
        ? `${e.name}’s gross monthly salary is ${money(e.salary)}. Payroll deductions are shown in the Payroll section.`
        : "Select an employee first.";
    else if (q.includes("count") || q.includes("total") || q.includes("how many"))
      answer = `There are ${employees.length} employees across ${teams.length} departments. ${employees.filter((e) => e.status === "Active").length} employees are currently active.`;
    else if (q.includes("department") || q.includes("team"))
      answer = e ? `${e.name} works in ${e.department} as ${e.role}.` : "Select an employee first.";
    else if (q.includes("employee") || q.includes("profile") || q.includes("information"))
      answer = e
        ? `${e.name} is a ${e.role} in ${e.department}. They joined on ${e.joined}, and their status is ${e.status.toLowerCase()}. Their work email is ${e.email}.`
        : "Select an employee first.";
    else if (q.includes("hello") || q.includes("hi"))
      answer = "Hello! It’s good to see you. What would you like to check today?";
    setMessages((all) => [
      ...all,
      { role: "user", text: text.trim() },
      { role: "assistant", text: answer },
    ]);
    setInput("");
  };
  return (
    <>
      <PageHeading
        title="Office assistant"
        subtitle="A little help with your everyday HR questions."
      >
        <span className="demo-label">Rule-based demo · Not AI</span>
      </PageHeading>
      <div className="chat-layout">
        <section className="panel">
          <PanelHeading title="Your people, at your fingertips" subtitle="OfficeFlow assistant">
            <select
              className="control text-xs max-w-44"
              aria-label="Assistant employee context"
              value={employeeId}
              onChange={(e) => setEmployeeId(Number(e.target.value))}
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </PanelHeading>
          <div className="chat-stream" aria-live="polite">
            {messages.map((m, i) => (
              <div className={`chat-message ${m.role === "user" ? "user" : ""}`} key={i}>
                <span className={`avatar ${m.role === "user" ? "tone-2" : "tone-0"}`}>
                  {m.role === "user" ? <User size={16} /> : <Bot size={18} />}
                </span>
                <div className="chat-bubble">{m.text}</div>
              </div>
            ))}
          </div>
          <div className="chat-suggestions">
            {[
              "What is my leave balance?",
              "What is my salary?",
              "Total employee count",
              "Pending leave requests",
            ].map((q) => (
              <Button variant="outline" size="sm" key={q} onClick={() => send(q)}>
                {q}
              </Button>
            ))}
          </div>
          <form
            className="chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              aria-label="Message Office Assistant"
              placeholder="Ask about your people…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim()}
              title="Send message"
              aria-label="Send message"
            >
              <Send />
            </Button>
          </form>
        </section>
        <p className="text-center text-xs text-muted-foreground mt-4">
          Answers use fictional workspace data, not live employee records.
        </p>
      </div>
    </>
  );
}

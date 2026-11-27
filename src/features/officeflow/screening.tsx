import { useState } from "react";
import { Check, FileText, LoaderCircle, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOfficeFlow } from "./store";
import { screenResume } from "./data";
import { PageHeading, PanelHeading } from "./shared";
type Result = { name: string; score: number; matches: string[]; missing: string[] };
export function Screening() {
  const { log } = useOfficeFlow();
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [keywords, setKeywords] = useState("Python, Django, SQL");
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const screen = (e: React.FormEvent) => {
    e.preventDefault();
    const skills = [
      ...new Set(
        keywords
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      ),
    ];
    if (!skills.length) {
      setError("Enter at least one keyword.");
      return;
    }
    if (text.trim().length < 20) {
      setError("Add at least 20 characters of resume content.");
      return;
    }
    setError("");
    setBusy(true);
    setTimeout(() => {
      const r = { name: name.trim(), ...screenResume(text, skills) };
      setResult(r);
      setHistory((all) => [r, ...all]);
      setBusy(false);
      log(`${r.name}’s resume was checked against ${skills.length} keywords`);
    }, 500);
  };
  return (
    <>
      <PageHeading
        title="Resume screening"
        subtitle="Find relevant skills. Keep people at the center."
      />
      <div className="notice">
        Keyword matching only — not AI-based hiring intelligence. A match score is not a hiring
        recommendation; every candidate deserves human review.
      </div>
      <div className="module-two-column">
        <section className="panel">
          <PanelHeading
            title="Candidate submission"
            subtitle="Resume content and role requirements"
          />
          <form onSubmit={screen} className="module-body flex flex-col gap-5">
            <label className="field">
              Candidate name
              <input
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Candidate’s full name"
              />
            </label>
            <label className="field">
              Required keywords
              <input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                required
                placeholder="Python, Django, SQL"
              />
            </label>
            <label className="field">
              Resume content
              <textarea
                rows={10}
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the candidate’s resume text…"
              />
            </label>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <label className="field">
                <span className="text-muted-foreground">Text resume (.txt)</span>
                <input
                  type="file"
                  accept=".txt,text/plain"
                  aria-label="Upload text resume"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) {
                      setError("Choose a text file smaller than 2 MB.");
                      return;
                    }
                    try {
                      setText(await file.text());
                      setError("");
                    } catch {
                      setError("This file could not be read. Paste the text instead.");
                    }
                  }}
                />
              </label>
              <Button type="submit" disabled={busy}>
                {busy ? <LoaderCircle className="loading-spinner" /> : <Search />}
                {busy ? "Checking…" : "Screen resume"}
              </Button>
            </div>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
          </form>
        </section>
        <section className="panel">
          <PanelHeading
            title="Screening results"
            subtitle={result ? result.name : "No candidate screened yet"}
          />
          <div className="module-body">
            {result ? (
              <>
                <span className="text-xs text-muted-foreground">Keyword match score</span>
                <div className="screen-score">
                  {result.score}
                  <span className="text-xl">%</span>
                </div>
                <h3 className="text-sm font-semibold">Matched keywords</h3>
                <div className="keyword-tags">
                  {result.matches.length ? (
                    result.matches.map((k) => (
                      <span className="keyword-tag flex gap-1 items-center" key={k}>
                        <Check size={12} />
                        {k}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No required keywords found.</p>
                  )}
                </div>
                <h3 className="text-sm font-semibold">Missing keywords</h3>
                <div className="keyword-tags">
                  {result.missing.length ? (
                    result.missing.map((k) => (
                      <span className="keyword-tag missing" key={k}>
                        {k}
                      </span>
                    ))
                  ) : (
                    <p className="text-success text-xs">All required keywords were found.</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-6">
                  Match presence only. Experience, proficiency, context and candidate suitability
                  have not been assessed.
                </p>
              </>
            ) : (
              <div className="empty-state">
                <FileText size={34} />
                <h3>Ready for your next candidate</h3>
                <p>The result will appear here.</p>
              </div>
            )}
          </div>
        </section>
      </div>
      {history.length > 0 && (
        <section className="panel mt-6">
          <PanelHeading title="Recent screenings" subtitle="This session’s candidate submissions" />
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Match score</th>
                  <th>Matched skills</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r, i) => (
                  <tr key={`${r.name}-${i}`}>
                    <td>{r.name}</td>
                    <td>{r.score}%</td>
                    <td>{r.matches.join(", ") || "None"}</td>
                    <td>
                      <span className="badge pending">Human review required</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

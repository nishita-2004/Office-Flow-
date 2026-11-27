import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Bell,
  Bot,
  Building2,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileSearch,
  Home,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  Search,
  Settings2,
  Sparkles,
  Users,
  Wallet,
  X,
  ChartNoAxesCombined,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useOfficeFlow } from "./store";
const navigation = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Employees", to: "/employees", icon: Users },
  { label: "Departments & Roles", to: "/departments", icon: Building2 },
  { label: "Attendance", to: "/attendance", icon: CalendarCheck },
  { label: "Leave Management", to: "/leaves", icon: CalendarDays },
  { label: "Payroll", to: "/payroll", icon: Wallet },
  { label: "HR Analytics", to: "/analytics", icon: ChartNoAxesCombined },
  { label: "Resume Screening", to: "/screening", icon: FileSearch },
  { label: "Office Assistant", to: "/assistant", icon: Bot },
] as const;
export function OfficeFlowShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { employees, leaves, activities } = useOfficeFlow();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [help, setHelp] = useState(false);
  const [profile, setProfile] = useState(false);
  const [search, setSearch] = useState("");
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);
  const current = navigation.find((n) => n.to === pathname)?.label ?? "OfficeFlow";
  return (
    <div className={`app-shell ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      <aside className="sidebar">
        <Link to="/" className="brand">
          <span className="brand-symbol">
            <ChartNoAxesCombined size={23} />
          </span>
          <span className="nav-text">
            OfficeFlow<span className="text-primary">.</span>
          </span>
        </Link>
        <div className="workspace">
          <span className="workspace-symbol">
            <Building2 size={17} />
          </span>
          <div className="nav-text">
            <div className="text-xs font-semibold">OfficeFlow workspace</div>
            <div className="person-meta">People & culture</div>
          </div>
          <ChevronDown size={13} className="ml-auto" />
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav className="nav-links">
          {navigation.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`nav-link ${pathname === n.to ? "active" : ""}`}
              title={n.label}
            >
              <n.icon />
              <span className="nav-text">{n.label}</span>
              {n.to === "/leaves" && (
                <span className="nav-count">
                  {leaves.filter((l) => l.status === "Pending").length}
                </span>
              )}
              {n.to === "/assistant" && <Sparkles size={13} className="nav-text ml-auto" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={() => setHelp(true)}
          >
            <CircleHelp />
            <span className="nav-text">Help & resources</span>
            <ArrowUpRight size={14} className="nav-text ml-auto" />
          </Button>
          <div className="sidebar-foot">
            <span className="demo-label">
              <span className="dot absent" />
              Demo workspace
            </span>
            <Button
              title="Close navigation"
              aria-label="Close navigation"
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => {
                setMobileOpen(false);
                setCollapsed(!collapsed);
              }}
            >
              <PanelLeftClose />
            </Button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle navigation"
              title="Toggle navigation"
              onClick={() => {
                if (window.innerWidth <= 850) setMobileOpen(!mobileOpen);
                else setCollapsed(!collapsed);
              }}
            >
              <Menu size={18} />
            </Button>
            <Home size={14} />
            <span>Workspace</span>
            <ChevronRight size={12} />
            <span className="text-foreground">{current}</span>
          </div>
          <div className="top-actions">
            <form
              className="header-search"
              onSubmit={(e) => {
                e.preventDefault();
                void navigate({ to: "/employees", search: { q: search } });
              }}
            >
              <Search size={15} />
              <input
                aria-label="Search workspace"
                placeholder="Search anything…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="shortcut">Search ↵</span>
            </form>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              title="Notifications"
              onClick={() => setNotifications(true)}
            >
              <Bell size={18} />
            </Button>
            <Button variant="ghost" className="profile h-auto" onClick={() => setProfile(true)}>
              <span className="avatar tone-2">NC</span>
              <span className="text-left">
                <span className="block text-xs font-semibold">Nishita Chauhan</span>
                <span className="person-meta block">HR Administrator</span>
              </span>
              <ChevronDown size={13} />
            </Button>
          </div>
        </header>
        <main className="page">
          {children}
          <footer className="page-footer">
            <span>© 2026 OfficeFlow. People first, always.</span>
            <span>Fictional demo data · Changes reset on refresh</span>
          </footer>
        </main>
      </div>
      <Dialog open={notifications} onOpenChange={setNotifications}>
        <DialogContent>
          <DialogTitle>Notifications</DialogTitle>
          <DialogDescription>Your workspace activity</DialogDescription>
          {activities.slice(0, 5).map((a, i) => (
            <div className="activity-row" key={`${a}-${i}`}>
              <span className="activity-icon">
                <Bell size={14} />
              </span>
              <div>
                <p className="text-sm">{a}</p>
                <p className="person-meta">Demo activity</p>
              </div>
            </div>
          ))}
        </DialogContent>
      </Dialog>
      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent>
          <DialogTitle>Help & resources</DialogTitle>
          <DialogDescription>OfficeFlow demo workspace</DialogDescription>
          <p className="text-sm leading-7">
            This workspace contains fictional employees and records. Your existing Django backend is
            not connected. Demo changes remain available while you navigate and reset when the page
            is refreshed.
          </p>
          <p className="text-sm leading-7">
            For workspace questions, open Office Assistant. Contact your organization’s HR
            administrator for employment policies.
          </p>
          <Button asChild>
            <Link to="/assistant" onClick={() => setHelp(false)}>
              <Bot />
              Open Office Assistant
            </Link>
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={profile} onOpenChange={setProfile}>
        <DialogContent>
          <DialogTitle>Nishita Chauhan</DialogTitle>
          <DialogDescription>Demo HR administrator · Not a signed-in account</DialogDescription>
          <dl className="profile-grid">
            <div>
              <dt>Role</dt>
              <dd>HR Manager</dd>
            </div>
            <div>
              <dt>Department</dt>
              <dd>Human Resources</dd>
            </div>
            <div>
              <dt>Workspace</dt>
              <dd>{employees.length} employees</dd>
            </div>
            <div>
              <dt>Connection</dt>
              <dd>Demo data only</dd>
            </div>
          </dl>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { ShieldCheck, LayoutDashboard, UploadCloud, ScanSearch, BarChart3, BrainCircuit, UserRound, LogOut, Menu, X } from "lucide-react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AnalyzeCSV from "./pages/AnalyzeCSV";
import Prediction from "./pages/Prediction";
import Analytics from "./pages/Analytics";
import ModelPerformance from "./pages/ModelPerformance";
import Profile from "./pages/Profile";

const nav = [
  ["dashboard","Dashboard",LayoutDashboard],
  ["csv","Analyze CSV",UploadCloud],
  ["prediction","Prediction",ScanSearch],
  ["analytics","Analytics",BarChart3],
  ["model","Model Performance",BrainCircuit],
  ["profile","Profile",UserRound],
];

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("fraudshield_user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  if (!user) return <Login onAuth={(u) => setUser(u)} />;

  const logout = () => {
    localStorage.removeItem("fraudshield_token");
    localStorage.removeItem("fraudshield_user");
    setUser(null);
  };

  const content = {
    dashboard: <Dashboard user={user} go={setPage} />,
    csv: <AnalyzeCSV />,
    prediction: <Prediction />,
    analytics: <Analytics />,
    model: <ModelPerformance />,
    profile: <Profile user={user} />,
  }[page];

  return <div className="app">
    <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
      <div className="brand"><div className="brand-icon"><ShieldCheck size={25}/></div><div><b>FraudShield</b><span>AI Fraud Detection</span></div></div>
      <div className="sidebar-nav">{nav.map(([id,label,Icon]) =>
        <button key={id} className={page===id?"nav-item active":"nav-item"} onClick={()=>{setPage(id);setMobileOpen(false)}}><Icon size={19}/><span>{label}</span></button>
      )}</div>
      <div className="sidebar-card"><img src="/security-card.png" /><div><b>Secure transactions.</b><span>AI-powered protection for every payment.</span></div></div>
      <button className="logout" onClick={logout}><LogOut size={18}/> Logout</button>
    </aside>
    {mobileOpen && <div className="mobile-overlay" onClick={()=>setMobileOpen(false)}/>}
    <section className="main">
      <header className="topbar">
        <button className="icon-btn mobile-menu" onClick={()=>setMobileOpen(!mobileOpen)}>{mobileOpen?<X/>:<Menu/>}</button>
        <div className="search"><ScanSearch size={17}/><input placeholder="Search transactions, analyses..." /></div>
        <div className="top-user"><div className="avatar">{user.name.slice(0,1).toUpperCase()}</div><div><b>{user.name}</b><span>Premium User</span></div></div>
      </header>
      <main className="content">{content}</main>
    </section>
  </div>
}

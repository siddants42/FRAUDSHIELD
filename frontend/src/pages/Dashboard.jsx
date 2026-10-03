import React, {useEffect, useRef, useState} from "react";
import {ArrowUpRight, UploadCloud, ScanSearch, ShieldAlert, CheckCircle2, Activity, CreditCard, LockKeyhole} from "lucide-react";
import {api} from "../services/api";
import {gsap} from "gsap";
import {LineChart, Line, ResponsiveContainer, XAxis, Tooltip} from "recharts";

const demoTrend=[{d:"Nov 01",v:420},{d:"Nov 05",v:380},{d:"Nov 10",v:590},{d:"Nov 15",v:480},{d:"Nov 20",v:670},{d:"Nov 25",v:520},{d:"Nov 30",v:720}];

export default function Dashboard({user,go}) {
 const [stats,setStats]=useState(null),[rows,setRows]=useState([]);
 const ref=useRef();
 useEffect(()=>{gsap.fromTo(ref.current.querySelectorAll(".reveal"),{y:20,opacity:0},{y:0,opacity:1,stagger:.08,duration:.65,ease:"power2.out"});Promise.all([api.stats(),api.history()]).then(([s,h])=>{setStats(s);setRows(h)}).catch(()=>{})},[]);
 return <div ref={ref}>
   <section className="hero reveal"><div className="hero-copy"><span className="eyebrow">TRANSACTION SECURITY CONSOLE</span><h1>Welcome back, <em>{user.name.split(" ")[0]}!</em></h1><p>Review transaction activity, investigate risk, and score new data from one secure workspace.</p><div className="hero-actions"><button className="primary-btn" onClick={()=>go("prediction")}><ScanSearch size={18}/> New prediction</button><button className="ghost-btn" onClick={()=>go("csv")}><UploadCloud size={18}/> Analyze CSV</button></div></div><img src="/credit-card-hero.png" className="hero-card"/></section>
   <div className="stat-grid reveal">
     <Stat icon={<CreditCard/>} label="Total analyzed" value={stats?.total_predictions??0} accent="blue"/>
     <Stat icon={<ShieldAlert/>} label="Fraud detected" value={stats?.fraud_predictions??0} accent="red"/>
     <Stat icon={<CheckCircle2/>} label="Legitimate" value={stats?.legitimate_predictions??0} accent="green"/>
     <Stat icon={<Activity/>} label="Fraud rate" value={`${Number(stats?.fraud_rate_percent??0).toFixed(2)}%`} accent="purple"/>
   </div>
   <div className="grid-two reveal"><div className="panel chart-panel"><div className="panel-head"><div><span className="panel-kicker">OVERVIEW</span><h3>Transaction activity</h3></div><span className="chip">Last 30 days</span></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={demoTrend}><XAxis dataKey="d" axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:"#071426",border:"1px solid #203655",borderRadius:12}}/><Line type="monotone" dataKey="v" stroke="#5b7cff" strokeWidth={3} dot={false}/></LineChart></ResponsiveContainer></div></div>
   <div className="panel risk-panel"><div className="panel-head"><div><span className="panel-kicker">RISK ENGINE</span><h3>Risk snapshot</h3></div></div><div className="risk-ring"><div><b>{stats?.total_predictions??0}</b><span>transactions</span></div></div><div className="risk-list"><span><i className="dot green"/>Low risk <b>92.4%</b></span><span><i className="dot yellow"/>Medium risk <b>6.1%</b></span><span><i className="dot red"/>High risk <b>1.5%</b></span></div></div></div>
   <div className="panel reveal"><div className="panel-head"><div><span className="panel-kicker">LIVE FEED</span><h3>Recent predictions</h3></div><button className="text-btn" onClick={()=>go("analytics")}>View analytics <ArrowUpRight size={16}/></button></div><div className="table-wrap"><table><thead><tr><th>ID</th><th>Amount</th><th>Prediction</th><th>Risk</th><th>Probability</th></tr></thead><tbody>{rows.length?rows.map(r=><tr key={r.id}><td>#{r.id}</td><td>${Number(r.amount).toFixed(2)}</td><td className={r.is_fraud?"fraud":"safe"}>{r.is_fraud?"Fraud":"Legitimate"}</td><td><span className={`risk ${r.risk_level.toLowerCase()}`}>{r.risk_level}</span></td><td>{(r.fraud_probability*100).toFixed(2)}%</td></tr>):<tr><td colSpan="5" className="empty">No predictions yet. Run your first analysis.</td></tr>}</tbody></table></div></div>
 </div>
}
function Stat({icon,label,value,accent}){return <div className={`stat-card ${accent}`}><div className="stat-icon">{icon}</div><span>{label}</span><strong>{value}</strong><small><ArrowUpRight size={13}/> Live from your account</small></div>}

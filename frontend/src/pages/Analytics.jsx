import React,{useEffect,useState} from "react";
import {api} from "../services/api";
import {BarChart3, TrendingUp} from "lucide-react";
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer} from "recharts";
export default function Analytics(){
 const [stats,setStats]=useState(null),[rows,setRows]=useState([]);
 useEffect(()=>{Promise.all([api.stats(),api.history()]).then(([s,h])=>{setStats(s);setRows(h)})},[]);
 const data=rows.map((r,i)=>({name:`#${r.id}`,amount:Number(r.amount),prob:Number(r.fraud_probability*100).toFixed(2)}));
 return <div className="page"><div className="page-heading"><div><span className="eyebrow">RISK INTELLIGENCE</span><h1>Analytics</h1><p>Understand the transaction behavior your model is seeing.</p></div></div><div className="stat-grid"><Stat l="Predictions" v={stats?.total_predictions??0}/><Stat l="Fraud" v={stats?.fraud_predictions??0}/><Stat l="Average amount" v={`$${Number(stats?.average_amount??0).toFixed(2)}`}/><Stat l="Fraud rate" v={`${Number(stats?.fraud_rate_percent??0).toFixed(2)}%`}/></div><div className="panel chart-large"><div className="panel-head"><div><span className="panel-kicker">TRANSACTION AMOUNTS</span><h3>Recent analyzed transactions</h3></div><TrendingUp/></div><ResponsiveContainer width="100%" height={330}><BarChart data={data}><XAxis dataKey="name"/><YAxis/><Tooltip contentStyle={{background:"#071426",border:"1px solid #203655",borderRadius:12}}/><Bar dataKey="amount" fill="#5b7cff" radius={[7,7,0,0]}/></BarChart></ResponsiveContainer></div></div>
}
function Stat({l,v}){return <div className="stat-card purple"><span>{l}</span><strong>{v}</strong></div>}

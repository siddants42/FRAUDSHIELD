import React,{useState} from "react";
import {ScanSearch, ShieldAlert, CheckCircle2} from "lucide-react";
import {api} from "../services/api";

const fields=["Time",...Array.from({length:28},(_,i)=>`V${i+1}`),"Amount"];
export default function Prediction(){
 const [values,setValues]=useState(Object.fromEntries(fields.map(f=>[f,f==="Amount"?100:0]))),[result,setResult]=useState(null),[loading,setLoading]=useState(false),[error,setError]=useState("");
 const submit=async e=>{e.preventDefault();setLoading(true);setError("");try{setResult(await api.predict(Object.fromEntries(fields.map(k=>[k,Number(values[k])]))))}catch(e){setError(e.message)}finally{setLoading(false)}};
 return <div className="page"><div className="page-heading"><div><span className="eyebrow">REAL-TIME SCORING</span><h1>Check a transaction</h1><p>Score a single transaction using the trained fraud detection model.</p></div></div><div className="panel"><form onSubmit={submit}><div className="feature-grid">{fields.map(f=><label key={f}>{f}<input type="number" step="any" value={values[f]} onChange={e=>setValues({...values,[f]:e.target.value})}/></label>)}</div><button className="primary-btn" disabled={loading}><ScanSearch size={18}/>{loading?"Analyzing...":"Analyze transaction"}</button></form></div>{error&&<div className="error-box">{error}</div>}{result&&<div className={`prediction-result ${result.is_fraud?"danger":"success"}`}><div className="result-icon">{result.is_fraud?<ShieldAlert/>:<CheckCircle2/>}</div><div><span className="panel-kicker">MODEL DECISION</span><h2>{result.is_fraud?"Fraud detected":"Transaction looks legitimate"}</h2><p>Risk <b>{result.risk_level}</b> · Fraud probability <b>{(result.fraud_probability*100).toFixed(2)}%</b></p></div><div className="probability"><strong>{(result.fraud_probability*100).toFixed(1)}%</strong><span>probability</span></div></div>}</div>
}

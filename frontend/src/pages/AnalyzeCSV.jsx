import React, {useRef, useState} from "react";
import {UploadCloud, FileText, CheckCircle2, ShieldAlert, Database, X, FileSpreadsheet} from "lucide-react";
import {api} from "../services/api";

const MAX_MB = 512;
const formatSize = bytes => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
};

export default function AnalyzeCSV(){
 const inputRef=useRef(null);
 const [file,setFile]=useState(null),[result,setResult]=useState(null),[error,setError]=useState(""),[loading,setLoading]=useState(false),[drag,setDrag]=useState(false);
 const selectFile=(f)=>{
   setError(""); setResult(null);
   if(!f) return;
   if(!f.name.toLowerCase().endsWith(".csv")){setError("Please select a CSV file.");return;}
   if(f.size > MAX_MB*1024*1024){setError(`This file is larger than ${MAX_MB} MB. For the local app, keep the dataset below ${MAX_MB} MB.`);return;}
   setFile(f);
 };
 const submit=async()=>{if(!file)return;setLoading(true);setError("");try{setResult(await api.analyzeCSV(file))}catch(e){setError(e.message)}finally{setLoading(false)}};
 return <div className="page">
   <div className="page-heading"><div><span className="eyebrow">DATA REVIEW</span><h1>Review a transaction file</h1><p>Run the fraud model against a full CSV dataset. Large files are processed in chunks so your browser does not need to load the entire dataset into memory.</p></div></div>
   <div className="csv-layout">
    <div className="panel upload-panel">
      <div className={`dropzone ${drag?"dragging":""}`} onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);selectFile(e.dataTransfer.files?.[0])}} onClick={()=>inputRef.current?.click()}>
        <div className="upload-icon"><UploadCloud size={25}/></div>
        <h3>{file?file.name:"Choose a transaction CSV"}</h3>
        <p>{file?`${formatSize(file.size)} · Ready to analyze`:"Drag and drop here, or browse from your computer"}</p>
        <span>CSV files up to {MAX_MB} MB</span>
        <input ref={inputRef} type="file" accept=".csv,text/csv" hidden onChange={e=>selectFile(e.target.files?.[0])}/>
      </div>
      {file && <div className="selected-file"><FileSpreadsheet size={18}/><div><b>{file.name}</b><span>{formatSize(file.size)} · 30 expected model columns</span></div><button onClick={()=>setFile(null)} aria-label="Remove file"><X size={16}/></button></div>}
      <button className="primary-btn full" disabled={!file||loading} onClick={submit}>{loading?"Processing dataset…":"Run fraud analysis"}</button>
      {loading&&<div className="progress-note"><span className="loader"/> Processing rows in batches. A large CSV can take a little longer.</div>}
      {error&&<div className="error-box">{error}</div>}
    </div>
    <div className="panel requirements">
      <div className="section-icon"><Database size={20}/></div><span className="panel-kicker">DATA CONTRACT</span><h3>Expected transaction fields</h3><p>The supplied model was trained on the standard credit-card fraud dataset.</p>
      <code>Time · V1 … V28 · Amount</code>
      <div className="mini-note"><CheckCircle2 size={17}/> Results include probability, prediction and risk level.</div>
      <div className="mini-note"><ShieldAlert size={17}/> The 143 MB dataset can be processed locally in chunks.</div>
    </div>
   </div>
   {result&&<section className="result-area"><div className="stat-grid"><Stat label="Transactions" value={Number(result.total_rows).toLocaleString()}/><Stat label="Fraud detected" value={Number(result.fraud_count).toLocaleString()} danger/><Stat label="Legitimate" value={Number(result.legitimate_count).toLocaleString()}/><Stat label="Fraud rate" value={`${Number(result.fraud_rate).toFixed(2)}%`}/></div><div className="panel"><div className="panel-head"><div><span className="panel-kicker">RESULT PREVIEW</span><h3>{result.filename}</h3></div><button className="ghost-btn" onClick={()=>{setFile(null);setResult(null)}}><FileText size={16}/> New analysis</button></div><div className="table-wrap"><table><thead><tr><th>Amount</th><th>Fraud probability</th><th>Prediction</th><th>Risk</th></tr></thead><tbody>{result.preview.map((r,i)=><tr key={i}><td>${Number(r.Amount).toFixed(2)}</td><td>{(Number(r.Fraud_Probability)*100).toFixed(2)}%</td><td className={Number(r.Prediction)?"fraud":"safe"}>{Number(r.Prediction)?"Fraud":"Legitimate"}</td><td><span className={`risk ${String(r.Risk_Level).toLowerCase()}`}>{r.Risk_Level}</span></td></tr>)}</tbody></table></div></div></section>}
 </div>
}
function Stat({label,value,danger}){return <div className={`stat-card ${danger?"stat-danger":""}`}><span>{label}</span><strong>{value}</strong></div>}

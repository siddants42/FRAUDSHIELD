import React, { useState } from "react";
import { ShieldCheck, ArrowRight, Eye, EyeOff } from "lucide-react";
import { api } from "../services/api";
import hero from "../assets/credit-card-hero.png";

export default function Login({onAuth}) {
  const [mode,setMode]=useState("login"), [name,setName]=useState(""), [email,setEmail]=useState(""), [password,setPassword]=useState(""), [show,setShow]=useState(false), [error,setError]=useState(""), [loading,setLoading]=useState(false);
  const submit=async(e)=>{e.preventDefault();setError("");setLoading(true);try{const data=mode==="login"?await api.login({email,password}):await api.register({name,email,password});localStorage.setItem("fraudshield_token",data.access_token);localStorage.setItem("fraudshield_user",JSON.stringify(data.user));onAuth(data.user)}catch(err){setError(err.message)}finally{setLoading(false)}};
  return <div className="auth-page">
    <div className="auth-visual"><div className="auth-brand"><ShieldCheck/> FraudShield</div><div className="auth-copy"><span>AI-POWERED TRANSACTION SECURITY</span><h1>Stop fraud before it becomes a loss.</h1><p>Analyze transactions, detect anomalies and turn raw payment data into actionable risk intelligence.</p></div><img src={hero} className="auth-card-img"/><div className="auth-glow"/></div>
    <div className="auth-panel"><div className="auth-form"><div className="mobile-brand"><ShieldCheck/> FraudShield</div><span className="eyebrow">{mode==="login"?"WELCOME BACK":"CREATE YOUR ACCOUNT"}</span><h2>{mode==="login"?"Welcome back.":"Build your fraud defense."}</h2><p className="muted">{mode==="login"?"Sign in to your fraud intelligence dashboard.":"Create an account to start analyzing transactions."}</p>
      <form onSubmit={submit}>{mode==="register"&&<label>Name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required/></label>}<label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></label><label>Password<div className="password"><input type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimum 8 characters" required minLength="8"/><button type="button" onClick={()=>setShow(!show)}>{show?<EyeOff/>:<Eye/>}</button></div></label>{error&&<div className="error-box">{error}</div>}<button className="primary-btn" disabled={loading}>{loading?"Working...":mode==="login"?"Sign in":"Create account"} <ArrowRight size={18}/></button></form>
      <p className="switch">{mode==="login"?"Don't have an account?":"Already have an account?"} <button onClick={()=>{setMode(mode==="login"?"register":"login");setError("")}}>{mode==="login"?"Create one":"Sign in"}</button></p>
    </div></div>
  </div>
}

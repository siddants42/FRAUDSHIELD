const API = "http://localhost:8000";

async function request(path, options = {}) {
  const token = localStorage.getItem("fraudshield_token");
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail ? (typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail)) : "Request failed");
  return data;
}
export const api = {
  login: (body) => request("/api/auth/login", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)}),
  register: (body) => request("/api/auth/register", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)}),
  me: () => request("/api/auth/me"),
  stats: () => request("/api/transactions/stats"),
  history: () => request("/api/transactions?limit=20"),
  batches: () => request("/api/transactions/batches"),
  model: () => request("/api/model"),
  predict: (features) => request("/api/predictions", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({features})}),
  analyzeCSV: (file) => { const fd=new FormData(); fd.append("file", file); return request("/api/batch/analyze",{method:"POST",body:fd}); },
};

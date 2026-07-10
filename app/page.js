'use client';

import { useEffect, useMemo, useState } from "react";

const DEFAULTS = { goal: 1850, protein: 160, water: 3000, caffeine: 400 };

function brazilDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date());
}

function fmtTime(value) {
  return new Date(value).toLocaleTimeString("pt-BR", {
    hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo"
  });
}

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState("Configure sua chave.");
  const [clock, setClock] = useState(new Date());
  const [form, setForm] = useState({
    type: "meal", description: "", calories: 0, protein_g: 0,
    water_ml: 0, caffeine_mg: 0, weight_kg: "", occurred_at: ""
  });

  useEffect(() => {
    setApiKey(localStorage.getItem("nutriclock_api_key") || "");
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!apiKey) return;
    loadSummary();
    const poll = setInterval(loadSummary, 15000);
    return () => clearInterval(poll);
  }, [apiKey]);

  async function loadSummary() {
    try {
      setStatus("Sincronizando...");
      const response = await fetch(`/api/summary?date=${brazilDateKey()}`, {
        headers: { "x-api-key": apiKey },
        cache: "no-store"
      });
      if (!response.ok) throw new Error((await response.json()).error || "Falha na API");
      setSummary(await response.json());
      setStatus("Sincronizado");
    } catch (error) {
      setStatus(error.message);
    }
  }

  function saveKey(value) {
    setApiKey(value);
    localStorage.setItem("nutriclock_api_key", value);
  }

  async function submit(event) {
    event.preventDefault();
    const entry = {
      ...form,
      calories: Number(form.calories || 0),
      protein_g: Number(form.protein_g || 0),
      water_ml: Number(form.water_ml || 0),
      caffeine_mg: Number(form.caffeine_mg || 0),
      weight_kg: form.weight_kg === "" ? null : Number(form.weight_kg),
      occurred_at: form.occurred_at ? new Date(form.occurred_at).toISOString() : new Date().toISOString(),
      confidence: "medium",
      source: "app"
    };

    const response = await fetch("/api/entries", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({ user_id: "rafael", entries: [entry] })
    });
    const data = await response.json();
    if (!response.ok) return alert(data.error || "Erro ao salvar.");
    setForm({ type:"meal", description:"", calories:0, protein_g:0, water_ml:0, caffeine_mg:0, weight_kg:"", occurred_at:"" });
    await loadSummary();
  }

  const totals = summary?.totals || {
    consumed:0, exercise:0, net:0, remaining:DEFAULTS.goal,
    protein_g:0, water_ml:0, caffeine_mg:0, weight_kg:null
  };
  const entries = summary?.entries || [];

  return (
    <main className="shell">
      <header className="header">
        <div>
          <h1>⏱️ NutriClock Cloud</h1>
          <p>ChatGPT, banco de dados e iPhone sincronizados</p>
        </div>
        <div className="clock">
          <strong>{clock.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" })}</strong>
          <span>{clock.toLocaleDateString("pt-BR", { weekday:"long", day:"2-digit", month:"long", year:"numeric", timeZone:"America/Sao_Paulo" })}</span>
        </div>
      </header>

      <section className="keyCard">
        <label>Chave privada do NutriClock</label>
        <input type="password" value={apiKey} onChange={(e)=>saveKey(e.target.value)} placeholder="Cole a mesma NUTRICLOCK_API_KEY da Vercel" />
        <small>{status} • atualização automática a cada 15 segundos</small>
      </section>

      <section className="stats">
        <article><small>Consumidas</small><b>{Math.round(totals.consumed)} kcal</b></article>
        <article><small>Exercício</small><b>{Math.round(totals.exercise)} kcal</b></article>
        <article><small>Saldo líquido</small><b>{Math.round(totals.net)} kcal</b></article>
        <article><small>Restantes</small><b className={totals.remaining < 0 ? "danger" : "good"}>{Math.round(totals.remaining)} kcal</b></article>
      </section>

      <section className="grid">
        <article className="card">
          <h2>Hoje</h2>
          <p>🥩 Proteína: <b>{Math.round(totals.protein_g)} / 160 g</b></p>
          <p>💧 Água: <b>{Math.round(totals.water_ml)} / 3000 ml</b></p>
          <p>☕ Cafeína: <b>{Math.round(totals.caffeine_mg)} / 400 mg</b></p>
          <p>⚖️ Peso: <b>{totals.weight_kg ? `${totals.weight_kg} kg` : "sem registro"}</b></p>
          <button onClick={loadSummary}>Atualizar agora</button>
        </article>

        <article className="card">
          <h2>Novo registro</h2>
          <form onSubmit={submit}>
            <select value={form.type} onChange={(e)=>setForm({...form,type:e.target.value})}>
              <option value="meal">Refeição</option>
              <option value="exercise">Exercício</option>
              <option value="water">Água</option>
              <option value="caffeine">Cafeína</option>
              <option value="weight">Peso</option>
            </select>
            <input required placeholder="Descrição" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/>
            <div className="two">
              <input type="number" placeholder="Calorias" value={form.calories} onChange={(e)=>setForm({...form,calories:e.target.value})}/>
              <input type="number" placeholder="Proteína (g)" value={form.protein_g} onChange={(e)=>setForm({...form,protein_g:e.target.value})}/>
              <input type="number" placeholder="Água (ml)" value={form.water_ml} onChange={(e)=>setForm({...form,water_ml:e.target.value})}/>
              <input type="number" placeholder="Cafeína (mg)" value={form.caffeine_mg} onChange={(e)=>setForm({...form,caffeine_mg:e.target.value})}/>
              <input type="number" step="0.1" placeholder="Peso (kg)" value={form.weight_kg} onChange={(e)=>setForm({...form,weight_kg:e.target.value})}/>
              <input type="datetime-local" value={form.occurred_at} onChange={(e)=>setForm({...form,occurred_at:e.target.value})}/>
            </div>
            <button disabled={!apiKey}>Salvar na nuvem</button>
          </form>
        </article>

        <article className="card full">
          <h2>Registros sincronizados</h2>
          {!entries.length && <p className="muted">Nenhum registro hoje.</p>}
          {entries.map((entry)=>(
            <div className="entry" key={entry.id}>
              <div>
                <b>{entry.description}</b>
                <small>{fmtTime(entry.occurred_at)} • {entry.source}</small>
              </div>
              <strong>{entry.type === "exercise" ? "-" : ""}{Math.round(entry.calories || 0)} kcal</strong>
            </div>
          ))}
        </article>
      </section>
    </main>
  );
}

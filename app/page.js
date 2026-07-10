 'use client';

import { useEffect, useMemo, useState } from "react";
import {
  Settings, ChevronLeft, ChevronRight, Flame, Dumbbell, Scale,
  Droplets, Coffee, Beef, Plus, Trash2, Pencil, CalendarDays
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  ReferenceLine, LineChart, Line, CartesianGrid
} from "recharts";

const GOAL = 1850;

function brazilDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function isoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

function calendarCells(date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth()+1, 0);
  const cells = Array((first.getDay()+6)%7).fill(null);
  for (let day=1; day<=last.getDate(); day++) {
    cells.push(new Date(date.getFullYear(), date.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function Progress({ value, max }) {
  const percent = Math.min(100, Math.max(0, (value/max)*100));
  return <div className="progress"><span style={{width:`${percent}%`}} /></div>;
}

export default function Home() {
  const [apiKey,setApiKey] = useState("");
  const [settingsOpen,setSettingsOpen] = useState(false);
  const [selectedDate,setSelectedDate] = useState(brazilDateKey());
  const [calendarMonth,setCalendarMonth] = useState(new Date());
  const [summary,setSummary] = useState(null);
  const [history,setHistory] = useState([]);
  const [status,setStatus] = useState("Conectando...");
  const [clock,setClock] = useState(new Date());
  const [editEntry,setEditEntry] = useState(null);
  const [form,setForm] = useState({
    type:"meal", description:"", calories:0, protein_g:0,
    water_ml:0, caffeine_mg:0, weight_kg:"", occurred_at:""
  });

  useEffect(()=>{
    setApiKey(localStorage.getItem("nutriclock_api_key")||"");
    const timer=setInterval(()=>setClock(new Date()),1000);
    return ()=>clearInterval(timer);
  },[]);

  useEffect(()=>{
    if(!apiKey){ setStatus("Configure a conexão no botão ⚙️"); return; }
    loadData();
    const timer=setInterval(loadData,15000);
    return ()=>clearInterval(timer);
  },[apiKey,selectedDate,calendarMonth]);

  async function api(path,options={}) {
    const response=await fetch(path,{
      ...options,
      headers:{...(options.headers||{}),"x-api-key":apiKey},
      cache:"no-store"
    });
    const data=await response.json();
    if(!response.ok) throw new Error(data.error||"Falha na API");
    return data;
  }

  async function loadData(){
    try{
      setStatus("Sincronizando...");
      const [daily,all]=await Promise.all([
        api(`/api/summary?date=${selectedDate}`),
        api("/api/entries?limit=500")
      ]);
      setSummary(daily);
      setHistory(all.entries||[]);
      setStatus("Sincronizado");
    }catch(error){ setStatus(error.message); }
  }

  function saveKey(value){
    setApiKey(value);
    localStorage.setItem("nutriclock_api_key",value);
  }

  async function submit(event){
    event.preventDefault();
    const payload={
      ...form,
      calories:Number(form.calories||0),
      protein_g:Number(form.protein_g||0),
      water_ml:Number(form.water_ml||0),
      caffeine_mg:Number(form.caffeine_mg||0),
      weight_kg:form.weight_kg===""?null:Number(form.weight_kg),
      occurred_at:form.occurred_at?new Date(form.occurred_at).toISOString():new Date().toISOString(),
      confidence:"medium",
      source:"app"
    };

    if(editEntry){
      await api("/api/entries",{
        method:"PATCH",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({id:editEntry.id,...payload})
      });
      setEditEntry(null);
    }else{
      await api("/api/entries",{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({user_id:"rafael",entries:[payload]})
      });
    }

    setForm({type:"meal",description:"",calories:0,protein_g:0,water_ml:0,caffeine_mg:0,weight_kg:"",occurred_at:""});
    await loadData();
  }

  async function removeEntry(id){
    if(!confirm("Excluir este registro?")) return;
    await api(`/api/entries?id=${id}`,{method:"DELETE"});
    await loadData();
  }

  function startEdit(entry){
    setEditEntry(entry);
    setForm({
      type:entry.type,
      description:entry.description,
      calories:entry.calories||0,
      protein_g:entry.protein_g||0,
      water_ml:entry.water_ml||0,
      caffeine_mg:entry.caffeine_mg||0,
      weight_kg:entry.weight_kg||"",
      occurred_at:new Date(entry.occurred_at).toISOString().slice(0,16)
    });
    window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"});
  }

  const totals=summary?.totals||{
    consumed:0,exercise:0,net:0,remaining:GOAL,
    protein_g:0,water_ml:0,caffeine_mg:0,weight_kg:null
  };
  const entries=summary?.entries||[];

  const monthCalories=useMemo(()=>{
    const map={};
    for(const entry of history){
      const key=entry.occurred_at.slice(0,10);
      const date=new Date(`${key}T12:00:00`);
      if(date.getMonth()!==calendarMonth.getMonth()||date.getFullYear()!==calendarMonth.getFullYear()) continue;
      if(!map[key]) map[key]=0;
      if(entry.type==="meal") map[key]+=Number(entry.calories||0);
    }
    return map;
  },[history,calendarMonth]);

  const last7=useMemo(()=>{
    const points=[];
    for(let i=6;i>=0;i--){
      const date=new Date();
      date.setDate(date.getDate()-i);
      const key=isoDate(date);
      const calories=history.filter(e=>e.type==="meal"&&e.occurred_at.slice(0,10)===key)
        .reduce((sum,e)=>sum+Number(e.calories||0),0);
      const protein=history.filter(e=>e.type==="meal"&&e.occurred_at.slice(0,10)===key)
        .reduce((sum,e)=>sum+Number(e.protein_g||0),0);
      points.push({
        label:date.toLocaleDateString("pt-BR",{weekday:"short"}).replace(".",""),
        calories,protein
      });
    }
    return points;
  },[history]);

  const weightData=useMemo(()=>history
    .filter(e=>e.type==="weight"&&e.weight_kg)
    .sort((a,b)=>new Date(a.occurred_at)-new Date(b.occurred_at))
    .slice(-10)
    .map(e=>({
      label:new Date(e.occurred_at).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"}),
      weight:Number(e.weight_kg)
    })),[history]);

  const dateLabel=new Date(`${selectedDate}T12:00:00`).toLocaleDateString("pt-BR",{
    weekday:"long",day:"2-digit",month:"long",year:"numeric"
  });

  return <main className="appShell">
    <header className="topbar">
      <div className="brand">
        <div className="brandIcon">⏱️</div>
        <div><h1>NutriClock</h1><p>Seu painel nutricional inteligente</p></div>
      </div>
      <div className="topActions">
        <div className="liveClock">
          <strong>{clock.toLocaleTimeString("pt-BR",{timeZone:"America/Sao_Paulo"})}</strong>
          <span>{clock.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long",timeZone:"America/Sao_Paulo"})}</span>
        </div>
        <button className="iconButton" onClick={()=>setSettingsOpen(true)}><Settings size={20}/></button>
      </div>
    </header>

    <div className="syncPill">{status} • atualização a cada 15 segundos</div>

    <section className="heroStats">
      <article><div className="statIcon flame"><Flame/></div><div><span>Consumidas</span><strong>{Math.round(totals.consumed)} kcal</strong></div></article>
      <article><div className="statIcon exercise"><Dumbbell/></div><div><span>Exercício</span><strong>{Math.round(totals.exercise)} kcal</strong></div></article>
      <article><div className="statIcon balance"><Scale/></div><div><span>Saldo líquido</span><strong>{Math.round(totals.net)} kcal</strong></div></article>
      <article><div className="statIcon remaining"><Flame/></div><div><span>Restantes</span><strong>{Math.round(totals.remaining)} kcal</strong></div></article>
    </section>

    <section className="mainGrid">
      <article className="panel calendarPanel">
        <div className="panelHeader">
          <div><h2><CalendarDays size={20}/> Calendário</h2><p>Selecione um dia para consultar</p></div>
          <div className="monthNav">
            <button onClick={()=>setCalendarMonth(new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()-1,1))}><ChevronLeft size={18}/></button>
            <strong>{calendarMonth.toLocaleDateString("pt-BR",{month:"long",year:"numeric"})}</strong>
            <button onClick={()=>setCalendarMonth(new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1,1))}><ChevronRight size={18}/></button>
          </div>
        </div>
        <div className="weekHeader">{["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map(d=><span key={d}>{d}</span>)}</div>
        <div className="calendarGrid">
          {calendarCells(calendarMonth).map((date,index)=>{
            if(!date) return <div className="calendarBlank" key={`blank-${index}`}/>;
            const key=isoDate(date), calories=monthCalories[key]||0;
            return <button key={key} className={`calendarDay ${key===selectedDate?"active":""} ${key===brazilDateKey()?"today":""}`} onClick={()=>setSelectedDate(key)}>
              <span>{date.getDate()}</span>
              {calories>0&&<small>{Math.round(calories)} kcal</small>}
            </button>;
          })}
        </div>
      </article>

      <article className="panel overviewPanel">
        <div className="panelHeader"><div><h2>{dateLabel}</h2><p>Visão geral do dia</p></div></div>
        <div className="metric"><div><Beef size={18}/><span>Proteína</span></div><strong>{Math.round(totals.protein_g)} / 160 g</strong></div>
        <Progress value={totals.protein_g} max={160}/>
        <div className="metric"><div><Droplets size={18}/><span>Água</span></div><strong>{Math.round(totals.water_ml)} / 3000 ml</strong></div>
        <Progress value={totals.water_ml} max={3000}/>
        <div className="metric"><div><Coffee size={18}/><span>Cafeína</span></div><strong>{Math.round(totals.caffeine_mg)} / 400 mg</strong></div>
        <Progress value={totals.caffeine_mg} max={400}/>
        <div className="metric"><div><Scale size={18}/><span>Peso</span></div><strong>{totals.weight_kg?`${totals.weight_kg} kg`:"sem registro"}</strong></div>
        <button onClick={loadData}>Atualizar agora</button>
      </article>

      <article className="panel widePanel">
        <div className="panelHeader"><div><h2>Calorias nos últimos 7 dias</h2><p>A linha amarela marca sua meta diária</p></div></div>
        <div className="chartBox">
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={last7}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10"/>
              <XAxis dataKey="label" stroke="#9eb0c7"/>
              <YAxis stroke="#9eb0c7"/>
              <Tooltip contentStyle={{background:"#0e1d31",border:"1px solid #ffffff20",borderRadius:12}}/>
              <ReferenceLine y={GOAL} stroke="#ffc857" strokeDasharray="6 6"/>
              <Bar dataKey="calories" fill="#62a6ff" radius={[8,8,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="panel widePanel">
        <div className="panelHeader"><div><h2>Evolução do peso</h2><p>Últimos registros disponíveis</p></div></div>
        <div className="chartBox">
          {weightData.length ? <ResponsiveContainer width="100%" height={280}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10"/>
              <XAxis dataKey="label" stroke="#9eb0c7"/>
              <YAxis stroke="#9eb0c7" domain={["dataMin - 1","dataMax + 1"]}/>
              <Tooltip contentStyle={{background:"#0e1d31",border:"1px solid #ffffff20",borderRadius:12}}/>
              <Line type="monotone" dataKey="weight" stroke="#58e0b0" strokeWidth={4} dot={{r:5}}/>
            </LineChart>
          </ResponsiveContainer> : <p className="emptyState">Registre seu peso para começar o gráfico.</p>}
        </div>
      </article>

      <article className="panel entriesPanel">
        <div className="panelHeader"><div><h2>Registros do dia</h2><p>{entries.length} item(ns)</p></div></div>
        <div className="entryList">
          {!entries.length&&<p className="emptyState">Nenhum registro neste dia.</p>}
          {entries.map(entry=><div className="entryRow" key={entry.id}>
            <div className="entryMain">
              <div className={`entryBadge ${entry.type}`}>{entry.type==="meal"?"🍽️":entry.type==="exercise"?"🏃":entry.type==="water"?"💧":entry.type==="caffeine"?"☕":"⚖️"}</div>
              <div><strong>{entry.description}</strong><small>{new Date(entry.occurred_at).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",timeZone:"America/Sao_Paulo"})} • {entry.source}</small></div>
            </div>
            <div className="entryActions">
              <b>{entry.type==="exercise"?"-":""}{Math.round(entry.calories||0)} kcal</b>
              <button onClick={()=>startEdit(entry)}><Pencil size={16}/></button>
              <button onClick={()=>removeEntry(entry.id)}><Trash2 size={16}/></button>
            </div>
          </div>)}
        </div>
      </article>

      <article className="panel formPanel">
        <div className="panelHeader"><div><h2>{editEntry?"Editar registro":"Novo registro"}</h2><p>{editEntry?"Ajuste os valores e salve":"Adicione manualmente um item"}</p></div>{editEntry&&<button className="ghostButton" onClick={()=>{setEditEntry(null);setForm({type:"meal",description:"",calories:0,protein_g:0,water_ml:0,caffeine_mg:0,weight_kg:"",occurred_at:""})}}>Cancelar</button>}</div>
        <form onSubmit={submit}>
          <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
            <option value="meal">Refeição</option><option value="exercise">Exercício</option><option value="water">Água</option><option value="caffeine">Cafeína</option><option value="weight">Peso</option>
          </select>
          <input required placeholder="Descrição" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
          <div className="formGrid">
            <input type="number" placeholder="Calorias" value={form.calories} onChange={e=>setForm({...form,calories:e.target.value})}/>
            <input type="number" placeholder="Proteína (g)" value={form.protein_g} onChange={e=>setForm({...form,protein_g:e.target.value})}/>
            <input type="number" placeholder="Água (ml)" value={form.water_ml} onChange={e=>setForm({...form,water_ml:e.target.value})}/>
            <input type="number" placeholder="Cafeína (mg)" value={form.caffeine_mg} onChange={e=>setForm({...form,caffeine_mg:e.target.value})}/>
            <input type="number" step="0.1" placeholder="Peso (kg)" value={form.weight_kg} onChange={e=>setForm({...form,weight_kg:e.target.value})}/>
            <input type="datetime-local" value={form.occurred_at} onChange={e=>setForm({...form,occurred_at:e.target.value})}/>
          </div>
          <button className="primaryButton" disabled={!apiKey}><Plus size={18}/>{editEntry?"Salvar alteração":"Salvar na nuvem"}</button>
        </form>
      </article>
    </section>

    {settingsOpen&&<div className="modalBackdrop" onClick={()=>setSettingsOpen(false)}>
      <div className="settingsModal" onClick={e=>e.stopPropagation()}>
        <div className="panelHeader"><div><h2>Configurações</h2><p>Conexão privada do aplicativo</p></div><button className="iconButton" onClick={()=>setSettingsOpen(false)}>✕</button></div>
        <label>Chave privada do NutriClock</label>
        <input type="password" value={apiKey} onChange={e=>saveKey(e.target.value)} placeholder="NUTRICLOCK_API_KEY"/>
        <p className="muted">A chave fica somente neste navegador e não aparece no painel.</p>
        <button className="primaryButton" onClick={()=>{setSettingsOpen(false);loadData()}}>Salvar e sincronizar</button>
      </div>
    </div>}
  </main>;
}

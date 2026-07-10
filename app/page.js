 'use client';

import { useEffect, useMemo, useState } from "react";
import {
  Home as HomeIcon, Utensils, History, BarChart3, User, Gamepad2,
  Flame, Dumbbell, Scale, Droplets, Coffee, Beef, Plus, Pencil,
  Trash2, ChevronLeft, ChevronRight, CalendarDays
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  ReferenceLine, CartesianGrid, LineChart, Line
} from "recharts";

const GOAL = 1850;
const PROTEIN_GOAL = 160;
const WATER_GOAL = 3000;
const CAFFEINE_GOAL = 400;

const RECIPES = [
  {name:"Omelete proteico com frango",calories:360,protein:42,time:"15 min",ingredients:["2 ovos","100 g de frango","Tomate","Cebola"],steps:["Bata os ovos.","Misture o recheio.","Cozinhe em frigideira antiaderente."]},
  {name:"Bowl de frango, arroz e feijão",calories:520,protein:46,time:"20 min",ingredients:["120 g de frango","100 g de arroz","70 g de feijão","Salada"],steps:["Grelhe o frango.","Monte o prato.","Finalize com salada."]},
  {name:"Sanduíche de atum",calories:390,protein:32,time:"10 min",ingredients:["2 fatias de pão integral","Atum","Tomate","Folhas"],steps:["Misture o atum.","Monte o sanduíche.","Sirva."]},
  {name:"Iogurte proteico com frutas",calories:260,protein:20,time:"5 min",ingredients:["Iogurte proteico","Banana","Morangos","Aveia"],steps:["Corte as frutas.","Misture tudo.","Sirva gelado."]}
];

function dateKey(date=new Date()){
  return new Intl.DateTimeFormat("en-CA",{timeZone:"America/Sao_Paulo",year:"numeric",month:"2-digit",day:"2-digit"}).format(date);
}
function isoDate(date){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
function calendarCells(date){
  const first=new Date(date.getFullYear(),date.getMonth(),1);
  const last=new Date(date.getFullYear(),date.getMonth()+1,0);
  const cells=Array((first.getDay()+6)%7).fill(null);
  for(let day=1;day<=last.getDate();day++) cells.push(new Date(date.getFullYear(),date.getMonth(),day));
  while(cells.length%7) cells.push(null);
  return cells;
}
function Progress({value,max}){
  const pct=Math.max(0,Math.min(100,(Number(value||0)/max)*100));
  return <div className="progress"><span style={{width:`${pct}%`}}/></div>;
}
function entryValue(entry){
  if(entry.type==="exercise") return `-${Math.abs(Math.round(Number(entry.calories||0)))} kcal`;
  if(entry.type==="water") return `${Math.round(Number(entry.water_ml||0))} ml`;
  if(entry.type==="caffeine") return `${Math.round(Number(entry.caffeine_mg||0))} mg`;
  if(entry.type==="weight") return entry.weight_kg?`${Number(entry.weight_kg).toFixed(1)} kg`:"—";
  return `${Math.round(Number(entry.calories||0))} kcal`;
}
function scoreDay(entries,key){
  const day=entries.filter(e=>e.occurred_at?.slice(0,10)===key);
  const consumed=day.filter(e=>e.type==="meal").reduce((s,e)=>s+Number(e.calories||0),0);
  const exercise=day.filter(e=>e.type==="exercise").reduce((s,e)=>s+Math.abs(Number(e.calories||0)),0);
  const protein=day.filter(e=>e.type==="meal").reduce((s,e)=>s+Number(e.protein_g||0),0);
  const water=day.filter(e=>e.type==="water").reduce((s,e)=>s+Number(e.water_ml||0),0);
  let score=50;
  if(day.length) score+=8; else score-=10;
  const net=consumed-exercise;
  if(net>0&&net<=GOAL) score+=18;
  if(net>GOAL+300) score-=22; else if(net>GOAL) score-=10;
  if(protein>=130) score+=18; else if(protein>=90) score+=10; else if(day.length) score-=8;
  if(water>=2500) score+=12; else if(water>=1200) score+=5; else if(day.length) score-=6;
  if(exercise>0) score+=10;
  return Math.max(0,Math.min(100,Math.round(score)));
}

export default function Page(){
  const [active,setActive]=useState("home");
  const [selectedDate,setSelectedDate]=useState(dateKey());
  const [month,setMonth]=useState(new Date());
  const [summary,setSummary]=useState(null);
  const [historyData,setHistoryData]=useState([]);
  const [status,setStatus]=useState("Sincronizando...");
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({type:"meal",description:"",calories:0,protein_g:0,water_ml:0,caffeine_mg:0,weight_kg:"",occurred_at:""});

  useEffect(()=>{
    load();
    const retry=setTimeout(load,1800);
    const timer=setInterval(load,15000);
    return()=>{clearTimeout(retry);clearInterval(timer)};
  },[selectedDate]);

  async function api(path,options={}){
    const response=await fetch(path,{...options,headers:{...(options.headers||{})},cache:"no-store"});
    const data=await response.json();
    if(!response.ok) throw new Error(data.error||"Falha na API");
    return data;
  }

  async function load(){
    try{
      setStatus("Sincronizando...");
      const [daily,all]=await Promise.all([
        api(`/api/summary?date=${selectedDate}`),
        api("/api/entries?limit=500")
      ]);
      setSummary(daily);
      setHistoryData(all.entries||[]);
      setStatus("Sincronizado");
    }catch(error){
      console.error(error);
      setStatus("Falha ao sincronizar");
    }
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
      source:"app",confidence:"medium"
    };
    if(payload.type==="exercise") payload.calories=Math.abs(payload.calories);

    if(editing){
      await api("/api/entries",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({id:editing.id,...payload})});
    }else{
      await api("/api/entries",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({entries:[payload]})});
    }
    setEditing(null);
    setForm({type:"meal",description:"",calories:0,protein_g:0,water_ml:0,caffeine_mg:0,weight_kg:"",occurred_at:""});
    await load();
  }

  async function remove(id){
    if(!confirm("Excluir este registro?")) return;
    await api(`/api/entries?id=${id}`,{method:"DELETE"});
    await load();
  }

  function edit(entry){
    setEditing(entry);
    setForm({
      type:entry.type,description:entry.description,
      calories:entry.type==="exercise"?Math.abs(Number(entry.calories||0)):Number(entry.calories||0),
      protein_g:Number(entry.protein_g||0),water_ml:Number(entry.water_ml||0),
      caffeine_mg:Number(entry.caffeine_mg||0),weight_kg:entry.weight_kg||"",
      occurred_at:new Date(entry.occurred_at).toISOString().slice(0,16)
    });
    setTimeout(()=>document.querySelector(".formPanel")?.scrollIntoView({behavior:"smooth",block:"center"}),50);
  }

  const totals=summary?.totals||{consumed:0,exercise:0,net:0,remaining:GOAL,protein_g:0,water_ml:0,caffeine_mg:0,weight_kg:null};
  const entries=summary?.entries||[];

  const monthCalories=useMemo(()=>{
    const map={};
    for(const e of historyData){
      const key=e.occurred_at?.slice(0,10);
      if(e.type==="meal") map[key]=(map[key]||0)+Number(e.calories||0);
    }
    return map;
  },[historyData]);

  const last7=useMemo(()=>{
    const rows=[];
    for(let i=6;i>=0;i--){
      const d=new Date();d.setDate(d.getDate()-i);
      const key=isoDate(d);
      rows.push({
        label:d.toLocaleDateString("pt-BR",{weekday:"short"}).replace(".",""),
        calories:historyData.filter(e=>e.type==="meal"&&e.occurred_at?.slice(0,10)===key).reduce((s,e)=>s+Number(e.calories||0),0)
      });
    }
    return rows;
  },[historyData]);

  const weightData=useMemo(()=>historyData
    .filter(e=>e.type==="weight"&&e.weight_kg)
    .sort((a,b)=>new Date(a.occurred_at)-new Date(b.occurred_at))
    .slice(-10)
    .map(e=>({label:new Date(e.occurred_at).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"}),weight:Number(e.weight_kg)}))
  ,[historyData]);

  const recipes=useMemo(()=>{
    const target=Math.max(220,Math.min(700,Number(totals.remaining||0)));
    return [...RECIPES].sort((a,b)=>Math.abs(a.calories-target)-Math.abs(b.calories-target)).slice(0,3);
  },[totals.remaining]);

  const pet=useMemo(()=>{
    const days=[];
    for(let i=6;i>=0;i--){
      const d=new Date();d.setDate(d.getDate()-i);
      const key=isoDate(d);
      days.push({key,score:scoreDay(historyData,key)});
    }
    const average=Math.round(days.reduce((s,d)=>s+d.score,0)/days.length);
    const state=average>=80?{emoji:"🐉",name:"Dragão saudável"}:average>=65?{emoji:"🦊",name:"Raposa focada"}:average>=50?{emoji:"🐱",name:"Gato estável"}:average>=35?{emoji:"🐢",name:"Tartaruga cansada"}:{emoji:"👻",name:"Pet faminto"};
    return {days,average,level:Math.max(1,Math.floor(average/10)),...state};
  },[historyData]);

  const dateLabel=new Date(`${selectedDate}T12:00:00`).toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});

  return <main className="shell">
    <header className="topbar">
      <div className="brand"><div className="logo">⏱️</div><div><h1>NutriClock</h1><p>Painel nutricional inteligente</p></div></div>
      <div className="mode">🧪 Teste público • dados compartilhados</div>
    </header>

    <div className={`status ${status==="Sincronizado"?"ok":""}`}>{status}</div>

    {active==="home"&&<>
      <section className="stats">
        <article><Flame/><div><span>Consumidas</span><b>{Math.round(totals.consumed)} kcal</b></div></article>
        <article><Dumbbell/><div><span>Exercício</span><b>{Math.abs(Math.round(totals.exercise))} kcal</b></div></article>
        <article><Scale/><div><span>Saldo líquido</span><b>{Math.round(totals.net)} kcal</b></div></article>
        <article><Flame/><div><span>Restantes</span><b>{Math.round(totals.remaining)} kcal</b></div></article>
      </section>

      <section className="grid">
        <article className="panel calendarPanel">
          <div className="panelHead"><div><h2><CalendarDays size={20}/>Calendário</h2><p>Selecione um dia</p></div><div className="monthNav"><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}><ChevronLeft/></button><strong>{month.toLocaleDateString("pt-BR",{month:"long",year:"numeric"})}</strong><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}><ChevronRight/></button></div></div>
          <div className="week">{["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map(d=><span key={d}>{d}</span>)}</div>
          <div className="calendar">{calendarCells(month).map((d,i)=>!d?<div key={i}/>:<button key={isoDate(d)} className={`${isoDate(d)===selectedDate?"active":""} ${isoDate(d)===dateKey()?"today":""}`} onClick={()=>setSelectedDate(isoDate(d))}><span>{d.getDate()}</span>{monthCalories[isoDate(d)]>0&&<small>{Math.round(monthCalories[isoDate(d)])} kcal</small>}</button>)}</div>
        </article>

        <article className="panel overview">
          <h2>{dateLabel}</h2>
          <div className="metric"><span><Beef size={18}/>Proteína</span><b>{Math.round(totals.protein_g)} / {PROTEIN_GOAL} g</b></div><Progress value={totals.protein_g} max={PROTEIN_GOAL}/>
          <div className="metric"><span><Droplets size={18}/>Água</span><b>{Math.round(totals.water_ml)} / {WATER_GOAL} ml</b></div><Progress value={totals.water_ml} max={WATER_GOAL}/>
          <div className="metric"><span><Coffee size={18}/>Cafeína</span><b>{Math.round(totals.caffeine_mg)} / {CAFFEINE_GOAL} mg</b></div><Progress value={totals.caffeine_mg} max={CAFFEINE_GOAL}/>
          <div className="metric"><span><Scale size={18}/>Peso</span><b>{totals.weight_kg?`${totals.weight_kg} kg`:"sem registro"}</b></div>
        </article>

        <article className="panel entries">
          <div className="panelHead"><div><h2>Registros do dia</h2><p>{entries.length} item(ns)</p></div></div>
          {!entries.length&&<div className="empty">Nenhum registro neste dia.</div>}
          {entries.map(e=><div className="entry" key={e.id}><div className="entryText"><strong>{e.description}</strong><small>{new Date(e.occurred_at).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",timeZone:"America/Sao_Paulo"})} • {e.source}</small></div><div className="entryActions"><b>{entryValue(e)}</b><button onClick={()=>edit(e)}><Pencil size={16}/></button><button onClick={()=>remove(e.id)}><Trash2 size={16}/></button></div></div>)}
        </article>

        <article className="panel formPanel">
          <div className="panelHead"><div><h2>{editing?"Editar registro":"Novo registro"}</h2><p>Preencha somente o necessário</p></div>{editing&&<button onClick={()=>{setEditing(null);setForm({type:"meal",description:"",calories:0,protein_g:0,water_ml:0,caffeine_mg:0,weight_kg:"",occurred_at:""})}}>Cancelar</button>}</div>
          <form onSubmit={submit}>
            <label>Tipo<select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="meal">🍽️ Refeição</option><option value="exercise">🏃 Exercício</option><option value="water">💧 Água</option><option value="caffeine">☕ Cafeína</option><option value="weight">⚖️ Peso</option></select></label>
            <label>Descrição<input required value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Ex.: arroz, feijão e frango"/></label>
            {form.type==="meal"&&<div className="two"><label>Calorias<input type="number" value={form.calories} onChange={e=>setForm({...form,calories:e.target.value})}/></label><label>Proteína (g)<input type="number" value={form.protein_g} onChange={e=>setForm({...form,protein_g:e.target.value})}/></label></div>}
            {form.type==="exercise"&&<label>Calorias gastas<input type="number" value={form.calories} onChange={e=>setForm({...form,calories:e.target.value})}/></label>}
            {form.type==="water"&&<label>Quantidade (ml)<input type="number" value={form.water_ml} onChange={e=>setForm({...form,water_ml:e.target.value})}/></label>}
            {form.type==="caffeine"&&<label>Cafeína (mg)<input type="number" value={form.caffeine_mg} onChange={e=>setForm({...form,caffeine_mg:e.target.value})}/></label>}
            {form.type==="weight"&&<label>Peso (kg)<input type="number" step="0.1" value={form.weight_kg} onChange={e=>setForm({...form,weight_kg:e.target.value})}/></label>}
            <label>Data e horário<input type="datetime-local" value={form.occurred_at} onChange={e=>setForm({...form,occurred_at:e.target.value})}/></label>
            <button className="primary"><Plus size={18}/>{editing?"Salvar alteração":"Registrar"}</button>
          </form>
        </article>
      </section>
    </>}

    {active==="recipes"&&<section className="page">
      <div className="hero"><Utensils size={42}/><div><span>Receitas</span><h2>Sugestões para {Math.max(0,Math.round(totals.remaining))} kcal restantes</h2></div></div>
      <div className="recipeGrid">{recipes.map((r,i)=><article className={`panel recipe ${i===0?"featured":""}`} key={r.name}>{i===0&&<em>Melhor opção</em>}<h3>{r.name}</h3><div className="recipeMeta"><b>{r.calories} kcal</b><span>{r.protein} g proteína</span><span>{r.time}</span></div><details><summary>Ver receita</summary><h4>Ingredientes</h4><ul>{r.ingredients.map(x=><li key={x}>{x}</li>)}</ul><h4>Preparo</h4><ol>{r.steps.map(x=><li key={x}>{x}</li>)}</ol></details></article>)}</div>
    </section>}

    {active==="history"&&<section className="page"><div className="hero"><History size={42}/><div><span>Histórico</span><h2>Todos os registros</h2></div></div><article className="panel">{historyData.map(e=><div className="entry" key={e.id}><div className="entryText"><strong>{e.description}</strong><small>{new Date(e.occurred_at).toLocaleString("pt-BR")}</small></div><b>{entryValue(e)}</b></div>)}</article></section>}

    {active==="stats"&&<section className="page"><div className="hero"><BarChart3 size={42}/><div><span>Estatísticas</span><h2>Sua evolução</h2></div></div><article className="panel chartPanel"><h2>Calorias — últimos 7 dias</h2><ResponsiveContainer width="100%" height={300}><BarChart data={last7}><CartesianGrid strokeDasharray="3 3" stroke="#ffffff12"/><XAxis dataKey="label" stroke="#9fb2c9"/><YAxis stroke="#9fb2c9"/><Tooltip/><ReferenceLine y={GOAL} stroke="#ffc857" strokeDasharray="6 6"/><Bar dataKey="calories" fill="#62a6ff" radius={[8,8,0,0]}/></BarChart></ResponsiveContainer></article><article className="panel chartPanel"><h2>Peso</h2>{weightData.length?<ResponsiveContainer width="100%" height={280}><LineChart data={weightData}><CartesianGrid strokeDasharray="3 3" stroke="#ffffff12"/><XAxis dataKey="label" stroke="#9fb2c9"/><YAxis stroke="#9fb2c9" domain={["dataMin - 1","dataMax + 1"]}/><Tooltip/><Line dataKey="weight" stroke="#58e0b0" strokeWidth={4}/></LineChart></ResponsiveContainer>:<div className="empty">Sem registros de peso.</div>}</article></section>}

    {active==="pet"&&<section className="page"><div className="petHero"><div className="pet">{pet.emoji}</div><div><span>Bichinho virtual</span><h2>{pet.name}</h2><p>Nível {pet.level} • {pet.average}/100 XP semanal</p><Progress value={pet.average} max={100}/></div></div><div className="petDays">{pet.days.map(d=><article className="panel" key={d.key}><strong>{new Date(`${d.key}T12:00:00`).toLocaleDateString("pt-BR",{weekday:"short"})}</strong><b>{d.score}</b><Progress value={d.score} max={100}/></article>)}</div></section>}

    {active==="profile"&&<section className="page"><div className="hero"><User size={42}/><div><span>Perfil</span><h2>Metas atuais</h2></div></div><div className="profileGrid"><article className="panel"><h3>Calorias</h3><b>{GOAL} kcal</b></article><article className="panel"><h3>Proteína</h3><b>{PROTEIN_GOAL} g</b></article><article className="panel"><h3>Água</h3><b>{WATER_GOAL} ml</b></article><article className="panel"><h3>Cafeína</h3><b>{CAFFEINE_GOAL} mg</b></article></div></section>}

    <nav className="bottomNav">
      <button className={active==="home"?"active":""} onClick={()=>setActive("home")}><HomeIcon/><span>Início</span></button>
      <button className={active==="recipes"?"active":""} onClick={()=>setActive("recipes")}><Utensils/><span>Receitas</span></button>
      <button className={active==="history"?"active":""} onClick={()=>setActive("history")}><History/><span>Histórico</span></button>
      <button className={active==="stats"?"active":""} onClick={()=>setActive("stats")}><BarChart3/><span>Estatísticas</span></button>
      <button className={active==="pet"?"active":""} onClick={()=>setActive("pet")}><Gamepad2/><span>Pet</span></button>
      <button className={active==="profile"?"active":""} onClick={()=>setActive("profile")}><User/><span>Perfil</span></button>
    </nav>
  </main>
}

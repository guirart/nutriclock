 'use client';

import { useEffect, useMemo, useState } from "react";
import {
  Home as HomeIcon, Utensils, History, BarChart3, User, Gamepad2,
  Flame, Dumbbell, Scale, Droplets, Coffee, Beef, Plus, Pencil,
  Trash2, ChevronLeft, ChevronRight, CalendarDays, Sword, Shield, Crown, Trophy, LockKeyhole, Sparkles
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
  const net=consumed-exercise;
  const quests=[
    {id:"registro",name:"Diário do Aventureiro",done:day.length>0,xp:10},
    {id:"calorias",name:"Equilíbrio da Selva",done:net>0&&net<=GOAL,xp:25},
    {id:"proteina",name:"Força do Primata",done:protein>=130,xp:25},
    {id:"agua",name:"Fonte Ancestral",done:water>=2500,xp:20},
    {id:"treino",name:"Prova de Combate",done:exercise>0,xp:20}
  ];
  let xp=quests.filter(q=>q.done).reduce((sum,q)=>sum+q.xp,0);
  const penalties=[];
  if(day.length===0) penalties.push({name:"Acampamento abandonado",xp:-10});
  if(net>GOAL+300) penalties.push({name:"Banquete do Caos",xp:-25});
  else if(net>GOAL) penalties.push({name:"Excesso na jornada",xp:-10});
  if(day.length>0&&protein<90) penalties.push({name:"Força insuficiente",xp:-10});
  if(day.length>0&&water<1200) penalties.push({name:"Sede da floresta",xp:-10});
  xp+=penalties.reduce((sum,p)=>sum+p.xp,0);
  return {key,xp:Math.max(0,Math.min(100,Math.round(xp))),quests,penalties,consumed,exercise,protein,water,net};
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
    const missions=[];
    for(let i=6;i>=0;i--){
      const d=new Date();d.setDate(d.getDate()-i);
      missions.push(scoreDay(historyData,isoDate(d)));
    }
    const totalXp=missions.reduce((sum,m)=>sum+m.xp,0);
    const average=Math.round(totalXp/missions.length);
    const level=Math.max(1,Math.min(6,Math.floor(totalXp/100)+1));
    const stages=[
      {emoji:"🐒",name:"Macaco Bebê",title:"Aprendiz da Clareira",min:0},
      {emoji:"🐵",name:"Macaco Jovem",title:"Explorador da Selva",min:100},
      {emoji:"🙉",name:"Escalador Tribal",title:"Guardião das Copas",min:200},
      {emoji:"🦧",name:"Orangotango Sábio",title:"Oráculo da Floresta",min:300},
      {emoji:"🦍",name:"Gorila Guerreiro",title:"Campeão do Templo",min:400},
      {emoji:"🦍",name:"Gorila Mestre",title:"Mestre Ancestral",min:500}
    ];
    const stage=stages[level-1];
    const progress=level===6?100:Math.max(0,Math.min(100,totalXp-stage.min));
    const locations=["Clareira do Despertar","Ponte dos Cipós","Ruínas da Selva","Montanha do Eco","Templo do Gorila","Trono Ancestral","Ascensão da Lua"];
    const achievements=[
      {name:"Primeiro Passo",icon:"🌱",unlocked:historyData.length>=1},
      {name:"Mestre da Proteína",icon:"🥩",unlocked:missions.some(m=>m.protein>=130)},
      {name:"Fonte Ancestral",icon:"💧",unlocked:missions.some(m=>m.water>=2500)},
      {name:"Guerreiro da Selva",icon:"⚔️",unlocked:missions.filter(m=>m.exercise>0).length>=3},
      {name:"Semana Equilibrada",icon:"⚖️",unlocked:average>=70},
      {name:"Lenda da Selva",icon:"👑",unlocked:level>=6}
    ];
    const boss=average>=75
      ?{name:"Cobra do Açúcar",emoji:"🐍",status:"Derrotado",message:"Você venceu o chefe semanal mantendo bons hábitos."}
      :{name:"Crocodilo da Preguiça",emoji:"🐊",status:"Em combate",message:"Complete mais missões para derrotar o chefe da semana."};
    return {missions,totalXp,average,level,stage,progress,locations,achievements,boss};
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

    {active==="pet"&&<section className="page rpgPage">
      <div className="rpgHero">
        <div className="characterStage">
          <div className="characterAura"/>
          <div className="character">{pet.stage.emoji}</div>
          <span className="levelBadge">Nível {pet.level}</span>
        </div>
        <div className="rpgHeroText">
          <span className="rpgEyebrow">Jornada do Guardião da Selva</span>
          <h2>{pet.stage.name}</h2>
          <p className="rpgTitle">{pet.stage.title}</p>
          <div className="xpHeader"><strong>{pet.totalXp} XP</strong><span>{pet.level===6?"Nível máximo":"Rumo à próxima evolução"}</span></div>
          <div className="rpgXp"><span style={{width:`${pet.progress}%`}}/></div>
        </div>
      </div>

      <section className="rpgSummary">
        <article className="panel rpgStat"><Sword/><div><span>XP semanal</span><b>{pet.totalXp}</b></div></article>
        <article className="panel rpgStat"><Shield/><div><span>Moral</span><b>{pet.average>=75?"Alta":pet.average>=50?"Estável":"Baixa"}</b></div></article>
        <article className="panel rpgStat"><Crown/><div><span>Classe</span><b>{pet.stage.title}</b></div></article>
      </section>

      <article className="panel questBoard">
        <div className="panelHead"><div><h2><Sword size={20}/>Mapa da Jornada</h2><p>As etapas substituem os dias da semana.</p></div><strong className="questScore">{pet.average}/100</strong></div>
        <div className="questPath">
          {pet.missions.map((mission,index)=><article className={`questNode ${mission.xp>=70?"completed":mission.xp>=40?"active":"danger"}`} key={mission.key}>
            <div className="questIcon">{mission.xp>=70?"🏆":mission.xp>=40?"⚔️":"💀"}</div>
            <div className="questInfo"><span>{pet.locations[index]}</span><strong>Missão {index+1}</strong><small>{mission.xp} XP</small></div>
            <div className="questLine"/>
          </article>)}
        </div>
      </article>

      <section className="rpgColumns">
        <article className="panel">
          <div className="panelHead"><div><h2>Missões atuais</h2><p>Boas práticas concedem experiência.</p></div><Sparkles/></div>
          {(pet.missions.at(-1)?.quests||[]).map(q=><div className={`missionRow ${q.done?"done":""}`} key={q.id}><div className="missionStatus">{q.done?"✓":"○"}</div><div><strong>{q.name}</strong><small>{q.done?`+${q.xp} XP`:"Pendente"}</small></div></div>)}
          {(pet.missions.at(-1)?.penalties||[]).map(p=><div className="missionRow penalty" key={p.name}><div className="missionStatus">−</div><div><strong>{p.name}</strong><small>{p.xp} XP</small></div></div>)}
        </article>
        <article className="panel bossPanel">
          <div className="bossCreature">{pet.boss.emoji}</div><span className="rpgEyebrow">Chefe semanal</span><h2>{pet.boss.name}</h2><p>{pet.boss.message}</p><div className={`bossStatus ${pet.boss.status==="Derrotado"?"won":""}`}>{pet.boss.status}</div>
        </article>
      </section>

      <article className="panel">
        <div className="panelHead"><div><h2><Trophy size={20}/>Conquistas</h2><p>Relíquias desbloqueadas pela sua jornada.</p></div></div>
        <div className="achievementGrid">{pet.achievements.map(a=><article className={`achievement ${a.unlocked?"unlocked":"locked"}`} key={a.name}><div>{a.unlocked?a.icon:<LockKeyhole/>}</div><strong>{a.name}</strong><small>{a.unlocked?"Desbloqueada":"Bloqueada"}</small></article>)}</div>
      </article>

      <article className="panel evolutionPanel">
        <div className="panelHead"><div><h2>Evolução do Primata</h2><p>Do Macaco Bebê ao Gorila Mestre.</p></div></div>
        <div className="evolutionTrack">{[["🐒","Macaco Bebê"],["🐵","Macaco Jovem"],["🙉","Escalador Tribal"],["🦧","Orangotango Sábio"],["🦍","Gorila Guerreiro"],["🦍","Gorila Mestre"]].map((s,i)=><article className={`evolutionStage ${pet.level>=i+1?"unlocked":""}`} key={s[1]}><div>{s[0]}</div><strong>{s[1]}</strong><small>Nível {i+1}</small></article>)}</div>
      </article>
    </section>}

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

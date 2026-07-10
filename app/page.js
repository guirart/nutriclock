 'use client';

import { useEffect, useMemo, useState } from "react";
import {
  Settings, ChevronLeft, ChevronRight, Flame, Dumbbell, Scale,
  Droplets, Coffee, Beef, Plus, Trash2, Pencil, CalendarDays,
  Home as HomeIcon, Utensils, BarChart3, User, History, Heart, ShoppingCart, Gamepad2, Sparkles, ShieldCheck, AlertTriangle
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  ReferenceLine, LineChart, Line, CartesianGrid
} from "recharts";

const GOAL = 1850;

const RECIPES = [
  {
    id: "omelete-frango",
    name: "Omelete proteico com frango",
    calories: 360,
    protein: 42,
    time: "15 min",
    ingredients: ["2 ovos", "100 g de frango desfiado", "Tomate", "Cebola", "Temperos"],
    steps: ["Bata os ovos.", "Misture o frango e os vegetais.", "Cozinhe em frigideira antiaderente."]
  },
  {
    id: "bowl-frango-arroz",
    name: "Bowl de frango, arroz e feijão",
    calories: 520,
    protein: 46,
    time: "20 min",
    ingredients: ["120 g de peito de frango", "100 g de arroz cozido", "70 g de feijão", "Salada"],
    steps: ["Grelhe o frango.", "Monte o prato com arroz e feijão.", "Complete com salada."]
  },
  {
    id: "tapioca-frango",
    name: "Tapioca com frango e queijo",
    calories: 430,
    protein: 35,
    time: "12 min",
    ingredients: ["60 g de goma de tapioca", "100 g de frango", "25 g de queijo", "Tomate"],
    steps: ["Prepare a tapioca.", "Recheie com frango, queijo e tomate.", "Dobre e aqueça por mais 1 minuto."]
  },
  {
    id: "iogurte-frutas",
    name: "Iogurte proteico com frutas",
    calories: 260,
    protein: 20,
    time: "5 min",
    ingredients: ["1 iogurte proteico", "1 banana pequena", "Morangos", "10 g de aveia"],
    steps: ["Corte as frutas.", "Misture com o iogurte.", "Finalize com aveia."]
  },
  {
    id: "sanduiche-atum",
    name: "Sanduíche de atum",
    calories: 390,
    protein: 32,
    time: "10 min",
    ingredients: ["2 fatias de pão integral", "1 lata de atum em água", "Folhas", "Tomate", "1 colher de creme de ricota"],
    steps: ["Misture o atum com o creme de ricota.", "Monte o sanduíche.", "Adicione folhas e tomate."]
  },
  {
    id: "salada-frango",
    name: "Salada completa com frango",
    calories: 310,
    protein: 38,
    time: "15 min",
    ingredients: ["120 g de frango", "Folhas", "Tomate", "Pepino", "Milho", "Molho leve"],
    steps: ["Grelhe o frango.", "Monte a salada.", "Adicione o molho apenas ao servir."]
  },
  {
    id: "prato-carne-pure",
    name: "Carne magra com purê e legumes",
    calories: 610,
    protein: 45,
    time: "30 min",
    ingredients: ["140 g de carne magra", "150 g de purê de batata", "Legumes cozidos"],
    steps: ["Grelhe a carne.", "Prepare o purê.", "Sirva com os legumes."]
  },
  {
    id: "panqueca-banana",
    name: "Panqueca de banana e aveia",
    calories: 330,
    protein: 18,
    time: "12 min",
    ingredients: ["1 banana", "2 ovos", "25 g de aveia", "Canela"],
    steps: ["Amasse a banana.", "Misture com ovos e aveia.", "Doure dos dois lados."]
  }
];

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

function displayEntryValue(entry) {
  if (entry.type === "exercise") return `-${Math.abs(Math.round(Number(entry.calories || 0)))} kcal`;
  if (entry.type === "water") return `${Math.round(Number(entry.water_ml || 0))} ml`;
  if (entry.type === "caffeine") return `${Math.round(Number(entry.caffeine_mg || 0))} mg`;
  if (entry.type === "weight") return entry.weight_kg ? `${Number(entry.weight_kg).toFixed(1)} kg` : "peso";
  return `${Math.round(Number(entry.calories || 0))} kcal`;
}


function dayScore(entries, key) {
  const dayEntries = entries.filter((entry) => entry.occurred_at?.slice(0, 10) === key);

  const consumed = dayEntries
    .filter((entry) => entry.type === "meal")
    .reduce((sum, entry) => sum + Number(entry.calories || 0), 0);

  const exercise = dayEntries
    .filter((entry) => entry.type === "exercise")
    .reduce((sum, entry) => sum + Math.abs(Number(entry.calories || 0)), 0);

  const protein = dayEntries
    .filter((entry) => entry.type === "meal")
    .reduce((sum, entry) => sum + Number(entry.protein_g || 0), 0);

  const water = dayEntries
    .filter((entry) => entry.type === "water")
    .reduce((sum, entry) => sum + Number(entry.water_ml || 0), 0);

  const net = consumed - exercise;

  let score = 50;
  const positives = [];
  const negatives = [];

  if (dayEntries.length > 0) {
    score += 8;
    positives.push("registrou o dia");
  } else {
    score -= 10;
    negatives.push("sem registros");
  }

  if (net > 0 && net <= GOAL) {
    score += 18;
    positives.push("ficou dentro da meta");
  }

  if (net > GOAL + 300) {
    score -= 22;
    negatives.push("passou muito da meta");
  } else if (net > GOAL) {
    score -= 10;
    negatives.push("passou um pouco da meta");
  }

  if (protein >= 130) {
    score += 18;
    positives.push("bateu ótima proteína");
  } else if (protein >= 90) {
    score += 10;
    positives.push("proteína razoável");
  } else if (dayEntries.length > 0) {
    score -= 8;
    negatives.push("proteína baixa");
  }

  if (water >= 2500) {
    score += 12;
    positives.push("boa hidratação");
  } else if (water >= 1200) {
    score += 5;
    positives.push("hidratou um pouco");
  } else if (dayEntries.length > 0) {
    score -= 6;
    negatives.push("pouca água");
  }

  if (exercise > 0) {
    score += 10;
    positives.push("treinou");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  return { key, score, consumed, exercise, protein, water, net, positives, negatives, count: dayEntries.length };
}

function petStatusFromScore(score) {
  if (score >= 85) return { emoji: "🐉", name: "Dragão saudável", mood: "lendário", message: "Seu pet está evoluindo muito bem." };
  if (score >= 70) return { emoji: "🦊", name: "Raposa focada", mood: "forte", message: "Boa semana. Continue alimentando boas práticas." };
  if (score >= 55) return { emoji: "🐱", name: "Gato estável", mood: "ok", message: "Está indo, mas dá para melhorar proteína, água ou constância." };
  if (score >= 40) return { emoji: "🐢", name: "Tartaruga cansada", mood: "fraco", message: "Seu pet precisa de mais consistência esta semana." };
  return { emoji: "👻", name: "Pet faminto", mood: "crítico", message: "Muitas práticas ruins derrubaram o nível do pet." };
}

export default function Home() {
  const [apiKey,setApiKey] = useState("public-test");
  const [activePage,setActivePage] = useState("home");
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
    setApiKey("public-test");
    const timer=setInterval(()=>setClock(new Date()),1000);
    return ()=>clearInterval(timer);
  },[]);

  useEffect(()=>{
    loadData();
    const timer=setInterval(loadData,15000);
    return ()=>clearInterval(timer);
  },[apiKey,selectedDate,calendarMonth]);

  async function api(path,options={}) {
    const response=await fetch(path,{
      ...options,
      headers:{...(options.headers||{})},
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


  const recommendedRecipes = useMemo(() => {
    const remaining = Math.max(0, Number(totals.remaining || 0));

    if (remaining <= 0) {
      return RECIPES
        .filter((recipe) => recipe.calories <= 320)
        .slice(0, 3);
    }

    const lowerBound = Math.max(180, remaining * 0.35);
    const upperBound = Math.max(320, remaining * 0.85);

    const matching = RECIPES
      .filter((recipe) => recipe.calories >= lowerBound && recipe.calories <= upperBound)
      .sort((first, second) => second.protein - first.protein);

    if (matching.length >= 3) return matching.slice(0, 3);

    return [...RECIPES]
      .sort((first, second) => {
        const firstDistance = Math.abs(first.calories - Math.min(remaining, 600));
        const secondDistance = Math.abs(second.calories - Math.min(remaining, 600));
        return firstDistance - secondDistance || second.protein - first.protein;
      })
      .slice(0, 3);
  }, [totals.remaining]);

  const dateLabel=new Date(`${selectedDate}T12:00:00`).toLocaleDateString("pt-BR",{
    weekday:"long",day:"2-digit",month:"long",year:"numeric"
  });

  const petWeek = useMemo(() => {
    const days = [];
    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - index);
      const key = isoDate(date);
      days.push(dayScore(history, key));
    }

    const average = days.length
      ? Math.round(days.reduce((sum, day) => sum + day.score, 0) / days.length)
      : 0;

    const status = petStatusFromScore(average);
    const level = Math.max(1, Math.floor(average / 10));
    const xp = average;
    const bestDay = [...days].sort((first, second) => second.score - first.score)[0];
    const worstDay = [...days].sort((first, second) => first.score - second.score)[0];

    return { days, average, status, level, xp, bestDay, worstDay };
  }, [history]);

  return <main className="appShell">
    <header className="topbar">
      <div className="brand">
        <div className="brandIcon">⏱️</div>
        <div>
          <h1>NutriClock</h1>
          <p>Seu painel nutricional inteligente</p>
        </div>
      </div>

      <div className="topActions">
        <div className="liveClock">
          <strong>{clock.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",timeZone:"America/Sao_Paulo"})}</strong>
          <span>{clock.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long",timeZone:"America/Sao_Paulo"})}</span>
        </div>

      </div>
    </header>

    <div className="syncPill">{status} • modo de teste público • dados compartilhados</div>

    {activePage === "home" && (
      <>
        <section className="heroStats">
          <article><div className="statIcon flame"><Flame/></div><div><span>Consumidas</span><strong>{Math.round(totals.consumed)} kcal</strong></div></article>
          <article><div className="statIcon exercise"><Dumbbell/></div><div><span>Exercício</span><strong>{Math.abs(Math.round(totals.exercise))} kcal</strong></div></article>
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
                  <b>{displayEntryValue(entry)}</b>
                  <button onClick={()=>startEdit(entry)}><Pencil size={16}/></button>
                  <button onClick={()=>removeEntry(entry.id)}><Trash2 size={16}/></button>
                </div>
              </div>)}
            </div>
          </article>

          <article className="panel formPanel">
            <div className="panelHeader">
              <div>
                <h2>{editEntry?"Editar registro":"Novo registro"}</h2>
                <p>{editEntry?"Ajuste os valores":"Preencha somente o necessário"}</p>
              </div>
              {editEntry&&<button className="ghostButton" onClick={()=>{setEditEntry(null);setForm({type:"meal",description:"",calories:0,protein_g:0,water_ml:0,caffeine_mg:0,weight_kg:"",occurred_at:""})}}>Cancelar</button>}
            </div>

            <form onSubmit={submit} className="guidedForm">
              <div className="fieldGroup">
                <label>Tipo de registro</label>
                <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                  <option value="meal">🍽️ Refeição</option>
                  <option value="exercise">🏃 Exercício</option>
                  <option value="water">💧 Água</option>
                  <option value="caffeine">☕ Cafeína</option>
                  <option value="weight">⚖️ Peso</option>
                </select>
              </div>

              <div className="fieldGroup">
                <label>Descrição</label>
                <input required placeholder="Ex.: arroz, feijão e frango" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
              </div>

              {form.type==="meal"&&<div className="formGrid">
                <div className="fieldGroup"><label>Calorias</label><input type="number" value={form.calories} onChange={e=>setForm({...form,calories:e.target.value})}/></div>
                <div className="fieldGroup"><label>Proteína (g)</label><input type="number" value={form.protein_g} onChange={e=>setForm({...form,protein_g:e.target.value})}/></div>
              </div>}

              {form.type==="exercise"&&<div className="fieldGroup"><label>Calorias gastas</label><input type="number" value={form.calories} onChange={e=>setForm({...form,calories:e.target.value})}/></div>}
              {form.type==="water"&&<div className="fieldGroup"><label>Quantidade (ml)</label><input type="number" value={form.water_ml} onChange={e=>setForm({...form,water_ml:e.target.value})}/></div>}
              {form.type==="caffeine"&&<div className="fieldGroup"><label>Cafeína (mg)</label><input type="number" value={form.caffeine_mg} onChange={e=>setForm({...form,caffeine_mg:e.target.value})}/></div>}
              {form.type==="weight"&&<div className="fieldGroup"><label>Peso (kg)</label><input type="number" step="0.1" value={form.weight_kg} onChange={e=>setForm({...form,weight_kg:e.target.value})}/></div>}

              <div className="fieldGroup"><label>Data e horário (opcional)</label><input type="datetime-local" value={form.occurred_at} onChange={e=>setForm({...form,occurred_at:e.target.value})}/></div>

              <button className="primaryButton" ><Plus size={18}/>{editEntry?"Salvar alteração":"Registrar"}</button>
            </form>
          </article>
        </section>
      </>
    )}

    {activePage === "recipes" && (
      <section className="pageSection">
        <div className="pageHero">
          <div>
            <span className="pageEyebrow">IA Nutricionista</span>
            <h2>Receitas para o restante do seu dia</h2>
            <p>Você ainda possui <strong>{Math.max(0,Math.round(totals.remaining))} kcal</strong> e faltam aproximadamente <strong>{Math.max(0,160-Math.round(totals.protein_g))} g de proteína</strong>.</p>
          </div>
          <Utensils size={48}/>
        </div>

        <div className="recipeGrid">
          {recommendedRecipes.map((recipe,index)=><article className={`recipeCard ${index===0?"featured":""}`} key={recipe.id}>
            {index===0&&<div className="bestChoice">Melhor opção</div>}
            <div className="recipeTop">
              <div>
                <span className="recipeTag">{recipe.time}</span>
                <h3>{recipe.name}</h3>
              </div>
              <div className="recipeCalories">{recipe.calories} kcal</div>
            </div>

            <div className="recipeProtein">{recipe.protein} g de proteína</div>

            <details>
              <summary>Ver receita completa</summary>
              <div className="recipeDetails">
                <div>
                  <h4>Ingredientes</h4>
                  <ul>{recipe.ingredients.map(item=><li key={item}>{item}</li>)}</ul>
                </div>
                <div>
                  <h4>Modo de preparo</h4>
                  <ol>{recipe.steps.map(step=><li key={step}>{step}</li>)}</ol>
                </div>
              </div>
            </details>
          </article>)}
        </div>
      </section>
    )}

    {activePage === "history" && (
      <section className="pageSection">
        <div className="pageHero"><div><span className="pageEyebrow">Histórico</span><h2>Seu acompanhamento por dia</h2><p>Use o calendário para revisar qualquer data e editar ou excluir registros.</p></div><History size={48}/></div>
        <div className="mainGrid">
          <article className="panel calendarPanel">
            <div className="panelHeader"><div><h2>Calendário completo</h2><p>Escolha uma data</p></div></div>
            <div className="weekHeader">{["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map(d=><span key={d}>{d}</span>)}</div>
            <div className="calendarGrid">{calendarCells(calendarMonth).map((date,index)=>{
              if(!date)return <div className="calendarBlank" key={index}/>;
              const key=isoDate(date);
              return <button key={key} className={`calendarDay ${key===selectedDate?"active":""}`} onClick={()=>setSelectedDate(key)}><span>{date.getDate()}</span>{monthCalories[key]>0&&<small>{Math.round(monthCalories[key])} kcal</small>}</button>
            })}</div>
          </article>

          <article className="panel">
            <div className="panelHeader"><div><h2>{dateLabel}</h2><p>{entries.length} registro(s)</p></div></div>
            {entries.map(entry=><div className="entryRow" key={entry.id}><div className="entryMain"><div className="entryBadge">{entry.type==="meal"?"🍽️":"📝"}</div><div><strong>{entry.description}</strong><small>{displayEntryValue(entry)}</small></div></div><div className="entryActions"><button onClick={()=>startEdit(entry)}><Pencil size={16}/></button><button onClick={()=>removeEntry(entry.id)}><Trash2 size={16}/></button></div></div>)}
          </article>
        </div>
      </section>
    )}

    {activePage === "stats" && (
      <section className="pageSection">
        <div className="pageHero"><div><span className="pageEyebrow">Estatísticas</span><h2>Visualize sua evolução</h2><p>Calorias, proteína e peso em gráficos claros.</p></div><BarChart3 size={48}/></div>

        <article className="panel widePanel">
          <div className="panelHeader"><div><h2>Calorias nos últimos 7 dias</h2><p>Linha amarela: meta diária</p></div></div>
          <div className="chartBox"><ResponsiveContainer width="100%" height={290}><BarChart data={last7}><CartesianGrid strokeDasharray="3 3" stroke="#ffffff10"/><XAxis dataKey="label" stroke="#9eb0c7"/><YAxis stroke="#9eb0c7"/><Tooltip contentStyle={{background:"#0e1d31",border:"1px solid #ffffff20",borderRadius:12}}/><ReferenceLine y={GOAL} stroke="#ffc857" strokeDasharray="6 6"/><Bar dataKey="calories" fill="#62a6ff" radius={[8,8,0,0]}/></BarChart></ResponsiveContainer></div>
        </article>

        <article className="panel widePanel statsSpacing">
          <div className="panelHeader"><div><h2>Evolução do peso</h2><p>Últimos registros disponíveis</p></div></div>
          <div className="chartBox">{weightData.length?<ResponsiveContainer width="100%" height={280}><LineChart data={weightData}><CartesianGrid strokeDasharray="3 3" stroke="#ffffff10"/><XAxis dataKey="label" stroke="#9eb0c7"/><YAxis stroke="#9eb0c7" domain={["dataMin - 1","dataMax + 1"]}/><Tooltip contentStyle={{background:"#0e1d31",border:"1px solid #ffffff20",borderRadius:12}}/><Line type="monotone" dataKey="weight" stroke="#58e0b0" strokeWidth={4} dot={{r:5}}/></LineChart></ResponsiveContainer>:<p className="emptyState">Registre seu peso para começar o gráfico.</p>}</div>
        </article>
      </section>
    )}


    {activePage === "pet" && (
      <section className="pageSection">
        <div className="petHero">
          <div className="petCreature" aria-label="Bichinho virtual">
            <span>{petWeek.status.emoji}</span>
            <div className="petGlow" />
          </div>

          <div className="petHeroText">
            <span className="pageEyebrow">Bichinho virtual</span>
            <h2>{petWeek.status.name}</h2>
            <p>{petWeek.status.message}</p>

            <div className="petLevelRow">
              <strong>Nível {petWeek.level}</strong>
              <span>{petWeek.xp}/100 XP semanal</span>
            </div>

            <div className="petXpBar">
              <span style={{ width: `${petWeek.xp}%` }} />
            </div>
          </div>
        </div>

        <section className="petRulesGrid">
          <article className="panel petRule goodRule">
            <ShieldCheck size={26}/>
            <h3>Boas práticas alimentam o pet</h3>
            <p>Ficar dentro da meta, bater proteína, beber água e treinar aumentam o nível.</p>
          </article>

          <article className="panel petRule badRule">
            <AlertTriangle size={26}/>
            <h3>Práticas ruins reduzem o nível</h3>
            <p>Exagerar muito nas calorias, ficar sem registrar, pouca água e proteína baixa derrubam o humor.</p>
          </article>

          <article className="panel petRule">
            <Sparkles size={26}/>
            <h3>Meta da semana</h3>
            <p>Termine a semana com média acima de 70 para manter o pet forte.</p>
          </article>
        </section>

        <article className="panel petWeekPanel">
          <div className="panelHeader">
            <div>
              <h2>Semana do pet</h2>
              <p>Seu pet evolui com base nos últimos 7 dias.</p>
            </div>
            <strong className="petAverage">{petWeek.average}/100</strong>
          </div>

          <div className="petDays">
            {petWeek.days.map((day) => (
              <div className="petDay" key={day.key}>
                <div className="petDayTop">
                  <strong>{new Date(`${day.key}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}</strong>
                  <span>{day.score}</span>
                </div>
                <div className="petMiniBar"><span style={{ width: `${day.score}%` }} /></div>
                <small>{Math.round(day.net)} kcal líquidas</small>
              </div>
            ))}
          </div>
        </article>

        <section className="petDetailsGrid">
          <article className="panel">
            <h2>Melhor dia</h2>
            {petWeek.bestDay && (
              <>
                <p className="petBigScore">{petWeek.bestDay.score}/100</p>
                <p>{new Date(`${petWeek.bestDay.key}T12:00:00`).toLocaleDateString("pt-BR")}</p>
                <ul className="petList goodList">
                  {petWeek.bestDay.positives.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </>
            )}
          </article>

          <article className="panel">
            <h2>Ponto de atenção</h2>
            {petWeek.worstDay && (
              <>
                <p className="petBigScore">{petWeek.worstDay.score}/100</p>
                <p>{new Date(`${petWeek.worstDay.key}T12:00:00`).toLocaleDateString("pt-BR")}</p>
                <ul className="petList badList">
                  {petWeek.worstDay.negatives.length
                    ? petWeek.worstDay.negatives.map((item) => <li key={item}>{item}</li>)
                    : <li>sem penalidades importantes</li>}
                </ul>
              </>
            )}
          </article>
        </section>
      </section>
    )}

    {activePage === "profile" && (
      <section className="pageSection">
        <div className="pageHero"><div><span className="pageEyebrow">Perfil</span><h2>Metas e preferências</h2><p>Informações pessoais usadas no seu acompanhamento.</p></div><User size={48}/></div>

        <div className="profileGrid">
          <article className="panel profileInfo"><h2>Dados pessoais</h2><div><span>Nome</span><strong>Rafael</strong></div><div><span>Idade</span><strong>24 anos</strong></div><div><span>Altura</span><strong>170 cm</strong></div><div><span>Peso mais recente</span><strong>{totals.weight_kg?`${totals.weight_kg} kg`:"93,7 kg"}</strong></div></article>
          <article className="panel profileInfo"><h2>Metas atuais</h2><div><span>Calorias</span><strong>1.850 kcal</strong></div><div><span>Proteína</span><strong>160 g</strong></div><div><span>Água</span><strong>3.000 ml</strong></div><div><span>Cafeína</span><strong>400 mg</strong></div></article>
          <article className="panel profileInfo"><h2>Preferências</h2><div><span>Objetivo</span><strong>Perder gordura</strong></div><div><span>Estimativas</span><strong>Conservadoras para cima</strong></div><div><span>Sincronização</span><strong>Automática</strong></div><div className="testNotice">Modo de teste: todos usam a mesma conta e os mesmos dados.</div></article>
        </div>
      </section>
    )}

    <nav className="bottomNav">
      <button className={activePage==="home"?"active":""} onClick={()=>setActivePage("home")}><HomeIcon size={20}/><span>Início</span></button>
      <button className={activePage==="recipes"?"active":""} onClick={()=>setActivePage("recipes")}><Utensils size={20}/><span>Receitas</span></button>
      <button className={activePage==="history"?"active":""} onClick={()=>setActivePage("history")}><History size={20}/><span>Histórico</span></button>
      <button className={activePage==="stats"?"active":""} onClick={()=>setActivePage("stats")}><BarChart3 size={20}/><span>Estatísticas</span></button>
      <button className={activePage==="pet"?"active":""} onClick={()=>setActivePage("pet")}><Gamepad2 size={20}/><span>Pet</span></button>
      <button className={activePage==="profile"?"active":""} onClick={()=>setActivePage("profile")}><User size={20}/><span>Perfil</span></button>
    </nav>

  </main>;
}

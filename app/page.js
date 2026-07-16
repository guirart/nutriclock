 'use client';

import { useEffect, useMemo, useState } from "react";
import {
  Home as HomeIcon, Utensils, History, BarChart3, User, Gamepad2,
  Flame, Dumbbell, Scale, Droplets, Coffee, Beef, Plus, Pencil,
  Trash2, ChevronLeft, ChevronRight, CalendarDays, Sword, Shield, Crown, Trophy, LockKeyhole, Sparkles, PackageOpen, Backpack, Gem, Coins, Shirt, Footprints, CircleDot
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  ReferenceLine, CartesianGrid, LineChart, Line
} from "recharts";

const DEFAULT_PROFILE = {
  name:"Rafael",
  sex:"male",
  age:24,
  heightCm:170,
  weightKg:93.7,
  activity:"light",
  objective:"lose",
  pace:"moderate",
  caffeineGoal:400
};

const PROFILE_KEY = "nutriclock_profile_v2";

const ACTIVITY_FACTORS = {
  sedentary:1.2,
  light:1.375,
  moderate:1.55,
  high:1.725
};

function calculateGoals(profile){
  const weight=Math.max(35,Number(profile.weightKg)||70);
  const height=Math.max(130,Number(profile.heightCm)||170);
  const age=Math.max(16,Number(profile.age)||30);
  const sexOffset=profile.sex==="female"?-161:5;
  const bmr=(10*weight)+(6.25*height)-(5*age)+sexOffset;
  const tdee=Math.round(bmr*(ACTIVITY_FACTORS[profile.activity]||1.375));
  const adjustments={
    lose:{slow:-250,moderate:-450,fast:-650},
    maintain:{slow:0,moderate:0,fast:0},
    gain:{slow:180,moderate:300,fast:450},
    muscle:{slow:150,moderate:250,fast:350}
  };
  const calorieGoal=Math.max(1200,Math.round(tdee+(adjustments[profile.objective]?.[profile.pace]||0)));
  const proteinFactor=profile.objective==="muscle"||profile.objective==="gain"?2.0:profile.objective==="lose"?1.8:1.6;
  const proteinGoal=Math.round(weight*proteinFactor);
  const waterGoal=Math.round((weight*35)/100)*100;
  return {
    bmr:Math.round(bmr),
    tdee,
    calorieGoal,
    proteinGoal,
    waterGoal:Math.max(2000,waterGoal),
    caffeineGoal:Number(profile.caffeineGoal)||400
  };
}

function seededShuffle(items,seed){
  const copy=[...items];
  let value=seed||1;
  for(let i=copy.length-1;i>0;i--){
    value=(value*9301+49297)%233280;
    const j=Math.floor((value/233280)*(i+1));
    [copy[i],copy[j]]=[copy[j],copy[i]];
  }
  return copy;
}

const PET_STATE_KEY = "nutriclock_pixel_pet_v2";
const PET_NAME_KEY = "nutriclock_pet_name_v1";
const BODY_STATS = {
  measuredAt:"2026-07-16T08:56:00-03:00",
  weightKg:94.8,
  fatMassKg:28.3,
  bodyFatPercent:29.9,
  bodyFatIndex:6,
  obesityLevel:5,
  idealWeightKg:63,
  weightControlKg:31.8,
  visceralFat:11,
  leanMassKg:66.5,
  bodyWaterPercent:50.5,
  boneMassKg:3.4,
  proteinRatePercent:16,
  bmrKcal:1805,
  metabolicAge:31,
  bodyType:"Obeso",
  score:68.5
};
const PET_ACTIVE_IMAGE = "/pet/mico-idle.png";
const DAILY_LOGIN_KEY = "nutriclock_daily_login_v1";
const PET_ACTIONS_KEY = "nutriclock_pet_actions_v1";

const CHEST_KEY = "nutriclock_rpg_chests_v1";
const INVENTORY_KEY = "nutriclock_rpg_inventory_v1";
const EQUIPMENT_KEY = "nutriclock_rpg_equipment_v1";
const CLAIMS_KEY = "nutriclock_rpg_claims_v1";

const RARITIES = [
  {id:"normal",name:"Normal",color:"#b9c5d3",weight:60,multiplier:1},
  {id:"rare",name:"Raro",color:"#4ea1ff",weight:23,multiplier:1.35},
  {id:"ultrarare",name:"Ultrararo",color:"#58e0b0",weight:10,multiplier:1.8},
  {id:"epic",name:"Épico",color:"#b16cff",weight:5,multiplier:2.4},
  {id:"legendary",name:"Lendário",color:"#ffc857",weight:1.7,multiplier:3.2},
  {id:"mythic",name:"Mítico",color:"#ff596f",weight:.3,multiplier:4.5}
];

const ITEM_BASES = [
  {name:"Bastão de Bambu",icon:"🦯",slot:"weapon",stats:{strength:3,discipline:1}},
  {name:"Lança da Selva",icon:"🗡️",slot:"weapon",stats:{strength:4,determination:2}},
  {name:"Elmo Tribal",icon:"🪖",slot:"head",stats:{resistance:3,discipline:2}},
  {name:"Coroa Ancestral",icon:"👑",slot:"head",stats:{wisdom:5,discipline:3}},
  {name:"Armadura de Folhas",icon:"🥋",slot:"body",stats:{vitality:4,balance:2}},
  {name:"Peitoral do Guardião",icon:"🦺",slot:"body",stats:{resistance:5,vitality:3}},
  {name:"Botas do Explorador",icon:"🥾",slot:"feet",stats:{energy:4,determination:2}},
  {name:"Sandálias do Vento",icon:"👟",slot:"feet",stats:{energy:5,balance:2}},
  {name:"Anel da Vitalidade",icon:"💍",slot:"ring",stats:{vitality:5}},
  {name:"Anel da Disciplina",icon:"💍",slot:"ring",stats:{discipline:5}},
  {name:"Amuleto da Fonte",icon:"📿",slot:"amulet",stats:{balance:4,wisdom:2}},
  {name:"Totem do Gorila",icon:"🗿",slot:"amulet",stats:{strength:3,determination:4}}
];

const CARE_ITEM_BASES = [
  {name:"Bola de Cipó",icon:"🟢",kind:"care",effect:"happiness",amount:18,description:"Brinquedo que aumenta a felicidade."},
  {name:"Tambor Tribal",icon:"🥁",kind:"care",effect:"happiness",amount:28,description:"Brinquedo raro para animar o companheiro."},
  {name:"Rede de Descanso",icon:"🛏️",kind:"care",effect:"energy",amount:24,description:"Recupera energia e melhora o descanso."},
  {name:"Chá da Floresta",icon:"🍵",kind:"care",effect:"energy",amount:16,description:"Recupera energia para as próximas missões."},
  {name:"Banana Dourada",icon:"🍌",kind:"care",effect:"banana",amount:3,description:"Adiciona bananas à reserva."},
  {name:"Boneco de Treino",icon:"🧸",kind:"care",effect:"both",amount:14,description:"Aumenta felicidade e energia."}
];

const SLOT_LABELS = {
  weapon:"Arma",head:"Cabeça",body:"Corpo",feet:"Pés",ring:"Anel",amulet:"Amuleto"
};

const STAT_LABELS = {
  strength:"Força",discipline:"Disciplina",vitality:"Vitalidade",
  energy:"Energia",resistance:"Resistência",balance:"Equilíbrio",
  determination:"Determinação",wisdom:"Sabedoria"
};

function safeRead(key,fallback){
  if(typeof window==="undefined") return fallback;
  try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}
  catch{return fallback;}
}

function rollRarity(chestTier="normal"){
  const tierBonus={normal:0,rare:8,epic:16,legendary:24,mythic:34}[chestTier]||0;
  const adjusted=RARITIES.map((rarity,index)=>({
    ...rarity,
    adjusted:Math.max(.05,rarity.weight*(1+(index*tierBonus/100)))
  }));
  const total=adjusted.reduce((sum,r)=>sum+r.adjusted,0);
  let roll=Math.random()*total;
  for(const rarity of adjusted){
    roll-=rarity.adjusted;
    if(roll<=0) return rarity;
  }
  return adjusted[0];
}

function generateItem(chestTier){
  const rarity=rollRarity(chestTier);
  const careChance={normal:.38,rare:.34,epic:.28,legendary:.22,mythic:.18}[chestTier]??.35;
  const isCare=Math.random()<careChance;
  const base=isCare
    ?CARE_ITEM_BASES[Math.floor(Math.random()*CARE_ITEM_BASES.length)]
    :ITEM_BASES[Math.floor(Math.random()*ITEM_BASES.length)];

  if(isCare){
    return {
      id:`care-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...base,
      amount:Math.max(1,Math.round(base.amount*rarity.multiplier)),
      rarity:rarity.id,rarityName:rarity.name,rarityColor:rarity.color,
      obtainedAt:new Date().toISOString()
    };
  }

  const stats=Object.fromEntries(
    Object.entries(base.stats).map(([key,value])=>[
      key,Math.max(1,Math.round(value*rarity.multiplier))
    ])
  );
  return {
    id:`item-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ...base,kind:"equipment",stats,rarity:rarity.id,rarityName:rarity.name,
    rarityColor:rarity.color,obtainedAt:new Date().toISOString()
  };
}

const RECIPES = [
  {id:"omelete-frango",name:"Omelete proteico com frango",image:"/recipes/omelete.svg",calories:360,protein:42,time:"15 min",goals:["lose","maintain","muscle"],ingredients:["2 ovos","100 g de frango","Tomate","Cebola"],steps:["Bata os ovos.","Misture o recheio.","Cozinhe em frigideira antiaderente."]},
  {id:"bowl-frango",name:"Bowl de frango, arroz e feijão",image:"/recipes/bowl-frango.svg",calories:520,protein:46,time:"20 min",goals:["maintain","gain","muscle"],ingredients:["120 g de frango","100 g de arroz","70 g de feijão","Salada"],steps:["Grelhe o frango.","Monte o prato.","Finalize com salada."]},
  {id:"sanduiche-atum",name:"Sanduíche de atum",image:"/recipes/sanduiche-atum.svg",calories:390,protein:32,time:"10 min",goals:["lose","maintain","muscle"],ingredients:["2 fatias de pão integral","Atum","Tomate","Folhas"],steps:["Misture o atum.","Monte o sanduíche.","Sirva."]},
  {id:"iogurte-frutas",name:"Iogurte proteico com frutas",image:"/recipes/iogurte-frutas.svg",calories:260,protein:20,time:"5 min",goals:["lose","maintain"],ingredients:["Iogurte proteico","Banana","Morangos","Aveia"],steps:["Corte as frutas.","Misture tudo.","Sirva gelado."]},
  {id:"tapioca-frango",name:"Tapioca com frango e queijo",image:"/recipes/tapioca-frango.svg",calories:430,protein:35,time:"12 min",goals:["maintain","gain","muscle"],ingredients:["Goma de tapioca","Frango desfiado","Queijo","Tomate"],steps:["Prepare a tapioca.","Adicione o recheio.","Dobre e aqueça."]},
  {id:"salada-frango",name:"Salada completa com frango",image:"/recipes/salada-frango.svg",calories:310,protein:38,time:"15 min",goals:["lose","maintain"],ingredients:["Frango","Folhas","Tomate","Pepino","Milho"],steps:["Grelhe o frango.","Monte a salada.","Tempere ao servir."]},
  {id:"carne-pure",name:"Carne magra com purê",image:"/recipes/carne-pure.svg",calories:610,protein:45,time:"30 min",goals:["gain","muscle","maintain"],ingredients:["Carne magra","Purê de batata","Legumes"],steps:["Grelhe a carne.","Prepare o purê.","Sirva com legumes."]},
  {id:"panqueca-banana",name:"Panqueca de banana e aveia",image:"/recipes/panqueca-banana.svg",calories:330,protein:18,time:"12 min",goals:["maintain","gain"],ingredients:["Banana","2 ovos","Aveia","Canela"],steps:["Amasse a banana.","Misture os ingredientes.","Doure dos dois lados."]},
  {id:"massa-atum",name:"Massa integral com atum",image:"/recipes/massa-atum.svg",calories:560,protein:39,time:"22 min",goals:["gain","muscle"],ingredients:["Massa integral","Atum","Molho de tomate","Ervas"],steps:["Cozinhe a massa.","Prepare o molho.","Misture e sirva."]},
  {id:"wrap-frango",name:"Wrap de frango e avocado",image:"/recipes/wrap-frango.svg",calories:450,protein:37,time:"12 min",goals:["lose","maintain","muscle"],ingredients:["Wrap integral","Frango","Avocado","Folhas"],steps:["Aqueça o wrap.","Adicione o recheio.","Enrole e sirva."]},
  {id:"arroz-ovo",name:"Arroz, ovos e legumes",image:"/recipes/arroz-ovo.svg",calories:470,protein:27,time:"18 min",goals:["maintain","gain"],ingredients:["Arroz","2 ovos","Legumes","Cebolinha"],steps:["Refogue os legumes.","Adicione arroz e ovos.","Finalize com cebolinha."]},
  {id:"sopa-legumes",name:"Sopa de legumes com carne",image:"/recipes/sopa-legumes.svg",calories:340,protein:30,time:"35 min",goals:["lose","maintain"],ingredients:["Carne magra","Abóbora","Cenoura","Chuchu"],steps:["Cozinhe a carne.","Adicione os legumes.","Ajuste os temperos."]},
  {id:"frango-batata",name:"Frango assado com batata",image:"/recipes/frango-batata.svg",calories:590,protein:51,time:"40 min",goals:["gain","muscle"],ingredients:["Peito de frango","Batata","Alecrim","Azeite"],steps:["Tempere o frango.","Asse com as batatas.","Sirva com salada."]},
  {id:"overnight-oats",name:"Overnight oats proteico",image:"/recipes/overnight-oats.svg",calories:380,protein:26,time:"5 min",goals:["lose","maintain","muscle"],ingredients:["Aveia","Iogurte","Whey","Frutas"],steps:["Misture os ingredientes.","Leve à geladeira.","Sirva no dia seguinte."]},
  {id:"risoto-frango",name:"Risoto leve de frango",image:"/recipes/risoto-frango.svg",calories:540,protein:41,time:"28 min",goals:["maintain","gain","muscle"],ingredients:["Arroz arbóreo","Frango","Caldo","Parmesão"],steps:["Refogue o arroz.","Adicione caldo aos poucos.","Finalize com frango."]},
  {id:"quiche-atum",name:"Quiche rápida de atum",image:"/recipes/quiche-atum.svg",calories:410,protein:34,time:"25 min",goals:["lose","maintain","muscle"],ingredients:["Ovos","Atum","Creme de ricota","Tomate"],steps:["Misture tudo.","Coloque em forma.","Asse até firmar."]}
];

function dateKey(date=new Date()){
  return new Intl.DateTimeFormat("en-CA",{timeZone:"America/Sao_Paulo",year:"numeric",month:"2-digit",day:"2-digit"}).format(date);
}
function dayDifference(a,b){
  const first=new Date(`${a}T12:00:00`);
  const second=new Date(`${b}T12:00:00`);
  return Math.round((second-first)/86400000);
}
function weeklyResetAt(){
  const now=new Date();
  const local=new Date(now.toLocaleString("en-US",{timeZone:"America/Sao_Paulo"}));
  const daysUntilMonday=(8-local.getDay())%7||7;
  const reset=new Date(local);
  reset.setDate(local.getDate()+daysUntilMonday);
  reset.setHours(0,0,0,0);
  return reset;
}
function formatCountdown(milliseconds){
  const total=Math.max(0,Math.floor(milliseconds/1000));
  const days=Math.floor(total/86400);
  const hours=Math.floor((total%86400)/3600);
  const minutes=Math.floor((total%3600)/60);
  const seconds=total%60;
  return `${days}d ${String(hours).padStart(2,"0")}h ${String(minutes).padStart(2,"0")}m ${String(seconds).padStart(2,"0")}s`;
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
function scoreDay(entries,key,calorieGoal){
  const day=entries.filter(e=>e.occurred_at?.slice(0,10)===key);
  const consumed=day.filter(e=>e.type==="meal").reduce((s,e)=>s+Number(e.calories||0),0);
  const exercise=day.filter(e=>e.type==="exercise").reduce((s,e)=>s+Math.abs(Number(e.calories||0)),0);
  const protein=day.filter(e=>e.type==="meal").reduce((s,e)=>s+Number(e.protein_g||0),0);
  const water=day.filter(e=>e.type==="water").reduce((s,e)=>s+Number(e.water_ml||0),0);
  const net=consumed-exercise;
  const quests=[
    {id:"registro",name:"Diário do Aventureiro",done:day.length>0,xp:10},
    {id:"calorias",name:"Equilíbrio da Selva",done:net>0&&net<=calorieGoal,xp:25},
    {id:"proteina",name:"Força do Primata",done:protein>=130,xp:25},
    {id:"agua",name:"Fonte Ancestral",done:water>=2500,xp:20},
    {id:"treino",name:"Prova de Combate",done:exercise>0,xp:20}
  ];
  let xp=quests.filter(q=>q.done).reduce((sum,q)=>sum+q.xp,0);
  const penalties=[];
  if(day.length===0) penalties.push({name:"Acampamento abandonado",xp:-10});
  if(net>calorieGoal+300) penalties.push({name:"Banquete do Caos",xp:-25});
  else if(net>calorieGoal) penalties.push({name:"Excesso na jornada",xp:-10});
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
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({type:"meal",description:"",calories:0,protein_g:0,water_ml:0,caffeine_mg:0,weight_kg:"",occurred_at:""});
  const [chests,setChests]=useState([]);
  const [inventory,setInventory]=useState([]);
  const [equipment,setEquipment]=useState({});
  const [claims,setClaims]=useState({});
  const [lootReveal,setLootReveal]=useState(null);
  const [rpgTab,setRpgTab]=useState("journey");
  const [companionReaction,setCompanionReaction]=useState(0);
  const [companionMessage,setCompanionMessage]=useState("Vamos conquistar a selva juntos!");
  const [profile,setProfile]=useState(DEFAULT_PROFILE);
  const [profileDraft,setProfileDraft]=useState(DEFAULT_PROFILE);
  const [profileSaved,setProfileSaved]=useState(false);
  const [recipeRotation,setRecipeRotation]=useState(0);
  const [petAnimation,setPetAnimation]=useState("idle");
  const [petMessage,setPetMessage]=useState("Pronto para a próxima missão!");
  const [petNeeds,setPetNeeds]=useState({energy:86,happiness:92,hunger:34,bananas:12});
  const [petActionTick,setPetActionTick]=useState(0);
  const [dailyLogin,setDailyLogin]=useState({lastLogin:null,streak:0,totalLogins:0});
  const [petActions,setPetActions]=useState({date:dateKey(),interactions:0,feeds:0,trainings:0});
  const [bossCountdown,setBossCountdown]=useState("");
  const [petName,setPetName]=useState("MicoClock");
  const [editingPetName,setEditingPetName]=useState(false);
  const [petNameDraft,setPetNameDraft]=useState("MicoClock");




  useEffect(()=>{
    setChests(safeRead(CHEST_KEY,[]));
    setInventory(safeRead(INVENTORY_KEY,[]));
    setEquipment(safeRead(EQUIPMENT_KEY,{}));
    setClaims(safeRead(CLAIMS_KEY,{}));
    const savedProfile=safeRead(PROFILE_KEY,DEFAULT_PROFILE);
    setProfile(savedProfile);
    setProfileDraft(savedProfile);
    const savedPet=safeRead(PET_STATE_KEY,{energy:86,happiness:92,hunger:34,bananas:12});
    const savedLogin=safeRead(DAILY_LOGIN_KEY,{lastLogin:null,streak:0,totalLogins:0});
    const savedActions=safeRead(PET_ACTIONS_KEY,{date:dateKey(),interactions:0,feeds:0,trainings:0});
    const savedPetName=typeof window!=="undefined"?(localStorage.getItem(PET_NAME_KEY)||"MicoClock"):"MicoClock";
    setPetName(savedPetName);
    setPetNameDraft(savedPetName);
    const today=dateKey();
    let nextLogin=savedLogin;
    const elapsedDays=savedLogin.lastLogin?Math.max(0,dayDifference(savedLogin.lastLogin,today)):0;
    let nextPet={
      ...savedPet,
      energy:Math.max(0,(savedPet.energy??86)-(elapsedDays*8)),
      happiness:Math.max(0,(savedPet.happiness??92)-(elapsedDays*6)),
      hunger:Math.min(100,(savedPet.hunger??34)+(elapsedDays*10))
    };
    if(savedLogin.lastLogin!==today){
      const consecutive=savedLogin.lastLogin&&dayDifference(savedLogin.lastLogin,today)===1;
      const streak=consecutive?savedLogin.streak+1:1;
      const reward=streak%7===0?7:2;
      nextLogin={lastLogin:today,streak,totalLogins:(savedLogin.totalLogins||0)+1,lastReward:reward};
      nextPet={...savedPet,bananas:(savedPet.bananas||0)+reward};
      setPetMessage(`Login diário: você recebeu ${reward} bananas!`);
      setPetAnimation("celebrate");
      setTimeout(()=>setPetAnimation("idle"),2600);
    }
    setDailyLogin(nextLogin);
    setPetNeeds(nextPet);
    setPetActions(savedActions.date===today?savedActions:{date:today,interactions:0,feeds:0,trainings:0});
    load();
    const retry=setTimeout(load,1800);
    const timer=setInterval(load,15000);
    return()=>{clearTimeout(retry);clearInterval(timer)};
  },[selectedDate]);

  useEffect(()=>{if(typeof window!=="undefined") localStorage.setItem(CHEST_KEY,JSON.stringify(chests));},[chests]);
  useEffect(()=>{if(typeof window!=="undefined") localStorage.setItem(INVENTORY_KEY,JSON.stringify(inventory));},[inventory]);
  useEffect(()=>{if(typeof window!=="undefined") localStorage.setItem(EQUIPMENT_KEY,JSON.stringify(equipment));},[equipment]);
  useEffect(()=>{if(typeof window!=="undefined") localStorage.setItem(CLAIMS_KEY,JSON.stringify(claims));},[claims]);
  useEffect(()=>{if(typeof window!=="undefined") localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));},[profile]);
  useEffect(()=>{if(typeof window!=="undefined") localStorage.setItem(PET_STATE_KEY,JSON.stringify(petNeeds));},[petNeeds]);
  useEffect(()=>{if(typeof window!=="undefined") localStorage.setItem(DAILY_LOGIN_KEY,JSON.stringify(dailyLogin));},[dailyLogin]);
  useEffect(()=>{if(typeof window!=="undefined") localStorage.setItem(PET_ACTIONS_KEY,JSON.stringify(petActions));},[petActions]);
  useEffect(()=>{if(typeof window!=="undefined") localStorage.setItem(PET_NAME_KEY,petName);},[petName]);
  useEffect(()=>{
    if(active!=="pet") return;
    const idleTimer=setInterval(()=>{
      setPetAnimation("look");
      setPetMessage("Estou acompanhando seu progresso.");
      setPetActionTick(value=>value+1);
      setTimeout(()=>setPetAnimation("idle"),1800);
    },9000);
    return()=>clearInterval(idleTimer);
  },[active]);

  useEffect(()=>{
    const updateCountdown=()=>setBossCountdown(formatCountdown(weeklyResetAt()-new Date()));
    updateCountdown();
    const timer=setInterval(updateCountdown,1000);
    return()=>clearInterval(timer);
  },[]);


  async function api(path,options={}){
    const response=await fetch(path,{...options,headers:{...(options.headers||{})},cache:"no-store"});
    const data=await response.json();
    if(!response.ok) throw new Error(data.error||"Falha na API");
    return data;
  }

  async function load(){
    try{
      const [daily,all]=await Promise.all([
        api(`/api/summary?date=${selectedDate}`),
        api("/api/entries?limit=500")
      ]);
      setSummary(daily);
      setHistoryData(all.entries||[]);
    }catch(error){
      console.error(error);
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


  function awardChest(type,tier,title){
    const chest={
      id:`chest-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,tier,title,earnedAt:new Date().toISOString()
    };
    setChests(current=>[...current,chest]);
  }

  function openChest(chest){
    const item=generateItem(chest.tier);
    setChests(current=>current.filter(entry=>entry.id!==chest.id));
    setInventory(current=>[item,...current]);
    setLootReveal({chest,item});
  }

  function equipItem(item){
    setEquipment(current=>({...current,[item.slot]:item.id}));
  }

  function useCareItem(item){
    setPetNeeds(current=>{
      if(item.effect==="happiness") return {...current,happiness:Math.min(100,current.happiness+item.amount)};
      if(item.effect==="energy") return {...current,energy:Math.min(100,current.energy+item.amount)};
      if(item.effect==="banana") return {...current,bananas:current.bananas+item.amount};
      return {
        ...current,
        happiness:Math.min(100,current.happiness+item.amount),
        energy:Math.min(100,current.energy+item.amount)
      };
    });
    setInventory(current=>current.filter(entry=>entry.id!==item.id));
    setPetMessage(`${item.name} usado com sucesso!`);
    setPetAnimation(item.effect==="energy"?"relax":"celebrate");
    setTimeout(()=>setPetAnimation("idle"),1800);
  }

  function unequipSlot(slot){
    setEquipment(current=>{
      const next={...current};
      delete next[slot];
      return next;
    });
  }

  const equippedItems=useMemo(
    ()=>Object.entries(equipment)
      .map(([slot,id])=>inventory.find(item=>item.id===id))
      .filter(Boolean),
    [equipment,inventory]
  );

  const totalStats=useMemo(()=>{
    const result={};
    for(const item of equippedItems){
      if(!item?.stats) continue;
      for(const [stat,value] of Object.entries(item.stats)){
        result[stat]=(result[stat]||0)+value;
      }
    }
    return result;
  },[equippedItems]);

  function runPetAction(animation,message,mutator){
    setPetAnimation(animation);
    setPetMessage(message);
    setPetActionTick(value=>value+1);
    if(mutator) setPetNeeds(current=>mutator(current));
    window.setTimeout(()=>setPetAnimation("idle"),2200);
  }

  function interactWithCompanion(){
    const messages=[
      "Que bom ver você por aqui!",
      "Seu cuidado aumentou minha felicidade.",
      "Vamos cumprir as missões de hoje!",
      "Estou ficando mais forte com sua disciplina."
    ];
    setPetActions(current=>({...current,interactions:current.interactions+1}));
    runPetAction("wave",messages[Math.floor(Math.random()*messages.length)],current=>({
      ...current,happiness:Math.min(100,current.happiness+8)
    }));
  }

  function feedCompanion(){
    if(petNeeds.bananas<=0){
      runPetAction("sad","Você não tem bananas. Faça login amanhã ou conclua recompensas.");
      return;
    }
    setPetActions(current=>({...current,feeds:current.feeds+1}));
    runPetAction("eat","Banana recebida! Minha fome diminuiu.",current=>({
      ...current,bananas:current.bananas-1,hunger:Math.max(0,current.hunger-20),happiness:Math.min(100,current.happiness+3)
    }));
  }

  function trainCompanion(){
    if(petNeeds.energy<12){
      runPetAction("tired","Minha energia está baixa. Interaja comigo e volte mais tarde.");
      return;
    }
    setPetActions(current=>({...current,trainings:current.trainings+1}));
    runPetAction("attack","Treino concluído! Estou pronto para enfrentar o chefe.",current=>({
      ...current,energy:Math.max(0,current.energy-12),hunger:Math.min(100,current.hunger+7),happiness:Math.min(100,current.happiness+2)
    }));
  }

  const goals=useMemo(()=>calculateGoals(profile),[profile]);

  function saveProfile(event){
    event.preventDefault();
    setProfile({...profileDraft});
    setProfileSaved(true);
    setTimeout(()=>setProfileSaved(false),2200);
  }

  const rawTotals=summary?.totals||{consumed:0,exercise:0,net:0,remaining:goals.calorieGoal,protein_g:0,water_ml:0,caffeine_mg:0,weight_kg:null};
  const totals={...rawTotals,goal:goals.calorieGoal,remaining:goals.calorieGoal-Number(rawTotals.net||0)};
  const entries=summary?.entries||[];

  function savePetName(event){
    event?.preventDefault();
    const cleaned=petNameDraft.trim().slice(0,18);
    if(!cleaned) return;
    setPetName(cleaned);
    setEditingPetName(false);
    setPetMessage(`Agora meu nome é ${cleaned}!`);
    setPetAnimation("celebrate");
    setTimeout(()=>setPetAnimation("idle"),1800);
  }

  const dayAssessment=useMemo(()=>{
    const consumed=Number(totals?.consumed||0);
    const net=Number(totals?.net||0);
    const protein=Number(totals?.protein_g||0);
    const water=Number(totals?.water_ml||0);
    const exercise=Number(totals?.exercise||0);
    const caffeine=Number(totals?.caffeine_mg||0);
    let score=2;
    const positives=[];
    const improvements=[];

    if(entries.length>0){score+=1;positives.push("Você registrou o dia, o que permite acompanhar padrões reais.");}
    else improvements.push("Ainda não há registros suficientes para avaliar o dia com confiança.");

    if(protein>=goals.proteinGoal){score+=2;positives.push("A meta de proteína foi atingida.");}
    else if(protein>=goals.proteinGoal*.65){score+=1;positives.push("A ingestão de proteína está razoável, mas ainda incompleta.");}
    else improvements.push(`Proteína baixa: faltam cerca de ${Math.max(0,Math.round(goals.proteinGoal-protein))} g para a meta.`);

    if(water>=goals.waterGoal){score+=2;positives.push("A hidratação atingiu a meta diária.");}
    else if(water>=goals.waterGoal*.6){score+=1;positives.push("A hidratação está caminhando, mas ainda não fechou a meta.");}
    else improvements.push(`Hidratação insuficiente: faltam aproximadamente ${Math.max(0,Math.round(goals.waterGoal-water))} ml.`);

    if(net>0&&net<=goals.calorieGoal){score+=2;positives.push("O saldo calórico está dentro da meta planejada.");}
    else if(net>goals.calorieGoal){improvements.push(`Você ultrapassou a meta líquida em cerca de ${Math.round(net-goals.calorieGoal)} kcal.`);}
    else improvements.push("O saldo calórico ainda está incompleto ou sem registros suficientes.");

    if(exercise>0){score+=1;positives.push("Houve atividade física registrada.");}
    else improvements.push("Não há exercício registrado hoje.");

    if(caffeine>goals.caffeineGoal) improvements.push("Cafeína acima da meta definida; evite aumentar mais hoje.");
    if(consumed>0&&protein/Math.max(consumed,1)<0.05) improvements.push("A densidade proteica do dia está baixa em relação às calorias consumidas.");

    score=Math.max(1,Math.min(10,Math.round(score)));
    let verdict=score>=9?"Excelente, mas não perfeito.":score>=7?"Bom dia, com pontos claros para fechar melhor.":score>=5?"Mediano: há progresso, mas as escolhas ainda estão inconsistentes.":score>=3?"Fraco: o dia precisa de correções objetivas.":"Muito fraco: faltam registros e hábitos básicos.";

    return {score,verdict,positives,improvements};
  },[entries,totals,goals]);



  const monthCalories=useMemo(()=>{
    const map={};
    for(const e of historyData){
      const key=e.occurred_at?.slice(0,10);
      if(e.type==="meal") map[key]=(map[key]||0)+Number(e.calories||0);
    }
    return map;
  },[historyData,goals.calorieGoal]);

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

  const latestWeightEntry=useMemo(()=>historyData
    .filter(entry=>entry.type==="weight"&&Number(entry.weight_kg)>0)
    .sort((a,b)=>new Date(b.occurred_at)-new Date(a.occurred_at))[0]||null
  ,[historyData]);
  const latestWeight=latestWeightEntry?Number(latestWeightEntry.weight_kg):BODY_STATS.weightKg;
  const latestWeightDate=latestWeightEntry?latestWeightEntry.occurred_at:BODY_STATS.measuredAt;

  const recipes=useMemo(()=>{
    const target=Math.max(220,Math.min(profile.objective==="gain"||profile.objective==="muscle"?900:700,Number(totals.remaining||0)));
    const daySeed=Number(dateKey().replaceAll("-",""))+recipeRotation*97;
    const preferred=RECIPES.filter(recipe=>recipe.goals.includes(profile.objective));
    const pool=preferred.length>=6?preferred:RECIPES;
    const ranked=pool
      .map(recipe=>({...recipe,score:Math.abs(recipe.calories-target)-(recipe.protein*2)}))
      .sort((a,b)=>a.score-b.score);
    const shortlist=ranked.slice(0,Math.min(10,ranked.length));
    return seededShuffle(shortlist,daySeed).slice(0,6);
  },[totals.remaining,profile.objective,recipeRotation]);

const pet=useMemo(()=>{
    const missions=[];
    for(let i=6;i>=0;i--){
      const d=new Date();d.setDate(d.getDate()-i);
      missions.push(scoreDay(historyData,isoDate(d),goals.calorieGoal));
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
    const bossMaxHp=700;
    const missionDamage=missions.reduce((sum,mission)=>sum+mission.quests.filter(quest=>quest.done).reduce((value,quest)=>value+quest.xp,0),0);
    const trainingDamage=(petActions.trainings||0)*8;
    const baseDamage=missionDamage+trainingDamage;
    const equipmentPower=(totalStats.strength||0)+(totalStats.determination||0)+((totalStats.discipline||0)*.5)+((totalStats.energy||0)*.35);
    const equipmentMultiplier=1+(equipmentPower/100);
    const moodAverage=((petNeeds.energy||0)+(petNeeds.happiness||0))/2;
    const moodMultiplier=.55+(moodAverage/100)*.70;
    const rawDamage=Math.round(baseDamage*equipmentMultiplier*moodMultiplier);
    const regeneration=missions.reduce((sum,mission)=>sum+Math.abs(mission.penalties.reduce((value,penalty)=>value+penalty.xp,0)),0);
    const damage=Math.max(0,rawDamage-regeneration);
    const bossHp=Math.max(0,bossMaxHp-damage);
    const bossPercent=Math.round((bossHp/bossMaxHp)*100);
    const boss=bossHp===0
      ?{name:"Crocodilo da Preguiça",emoji:"🐊",status:"Derrotado",message:"O golpe final foi aplicado. O tesouro lendário foi liberado.",hp:0,maxHp:bossMaxHp,damage,regeneration,percent:0,baseDamage,equipmentMultiplier,moodMultiplier,equipmentPower,moodAverage}
      :{name:"Crocodilo da Preguiça",emoji:"🐊",status:"Em combate",message:"Missões, humor, energia, treinos e equipamentos determinam o dano final.",hp:bossHp,maxHp:bossMaxHp,damage,regeneration,percent:bossPercent,baseDamage,equipmentMultiplier,moodMultiplier,equipmentPower,moodAverage};
    const recentAttacks=missions.flatMap(mission=>mission.quests.filter(quest=>quest.done).map(quest=>({id:`${mission.key}-${quest.id}`,name:quest.name,damage:quest.xp,key:mission.key}))).slice(-5).reverse();
    return {missions,totalXp,average,level,stage,progress,locations,achievements,boss,recentAttacks};
  },[historyData,goals.calorieGoal,totalStats,petNeeds.energy,petNeeds.happiness,petActions.trainings]);

  useEffect(()=>{
    if(!historyData.length) return;
    const today=pet.missions.at(-1);
    if(!today) return;
    const key=today.key;
    const rewards=[
      {claim:`${key}:water`,done:today.water>=2500,type:"water",tier:"normal",title:"Baú da Fonte Ancestral"},
      {claim:`${key}:protein`,done:today.protein>=130,type:"protein",tier:"normal",title:"Baú da Força do Primata"},
      {claim:`${key}:training`,done:today.exercise>0,type:"training",tier:"rare",title:"Baú do Combate"},
      {claim:`${key}:balance`,done:today.net>0&&today.net<=goals.calorieGoal,type:"balance",tier:"normal",title:"Baú do Equilíbrio"},
      {claim:`boss:${pet.missions[0]?.key}`,done:pet.boss.hp===0,type:"boss",tier:"legendary",title:"Baú Lendário do Chefe Semanal"}
    ];
    const earned=rewards.filter(reward=>reward.done&&!claims[reward.claim]);
    if(!earned.length) return;
    setClaims(current=>{
      const next={...current};
      earned.forEach(reward=>{next[reward.claim]=true;});
      return next;
    });
    setChests(current=>[
      ...current,
      ...earned.map((reward,index)=>({
        id:`chest-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
        type:reward.type,tier:reward.tier,title:reward.title,earnedAt:new Date().toISOString()
      }))
    ]);
  },[historyData,pet.missions,pet.boss.hp,claims,goals.calorieGoal]);


  const dateLabel=new Date(`${selectedDate}T12:00:00`).toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});

  return <main className="shell">
    <header className="topbar">
      <div className="brand"><div className="logoMark">N</div><div><h1>NutriClock</h1><p>Acompanhamento nutricional e hábitos</p></div></div>
      <div className="mode"><span className="modeDot"/>Demonstração · v8.2</div>
    </header>
{active==="home"&&<>
      <div className="sectionIntro"><div><span>Resumo diário</span><h2>Visão geral</h2></div><p>Acompanhe o que importa hoje.</p></div><section className="stats">
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
          <div className="metric"><span><Beef size={18}/>Proteína</span><b>{Math.round(totals.protein_g)} / {goals.proteinGoal} g</b></div><Progress value={totals.protein_g} max={goals.proteinGoal}/>
          <div className="metric"><span><Droplets size={18}/>Água</span><b>{Math.round(totals.water_ml)} / {goals.waterGoal} ml</b></div><Progress value={totals.water_ml} max={goals.waterGoal}/>
          <div className="metric"><span><Coffee size={18}/>Cafeína</span><b>{Math.round(totals.caffeine_mg)} / {goals.caffeineGoal} mg</b></div><Progress value={totals.caffeine_mg} max={goals.caffeineGoal}/>
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
      <div className="hero recipeHero">
        <Utensils size={42}/>
        <div>
          <span>Receitas personalizadas</span>
          <h2>{Math.max(0,Math.round(totals.remaining))} kcal disponíveis hoje</h2>
          <p>Selecionadas para o objetivo “{profile.objective==="lose"?"emagrecer":profile.objective==="gain"?"ganhar peso":profile.objective==="muscle"?"ganhar massa muscular":"manter o peso"}”.</p>
        </div>
        <button className="recipeRefresh" onClick={()=>setRecipeRotation(value=>value+1)}>Trocar sugestões</button>
      </div>
      <div className="recipeGrid expanded">
        {recipes.map((r,i)=><article className={`panel recipe ${i===0?"featured":""}`} key={`${r.id}-${recipeRotation}`}>
          <div className="recipeImage"><img src={r.image} alt={r.name}/>{i===0&&<em>Melhor encaixe</em>}</div>
          <div className="recipeBody">
            <h3>{r.name}</h3>
            <div className="recipeMeta"><b>{r.calories} kcal</b><span>{r.protein} g proteína</span><span>{r.time}</span></div>
            <details><summary>Ingredientes e preparo</summary><h4>Ingredientes</h4><ul>{r.ingredients.map(x=><li key={x}>{x}</li>)}</ul><h4>Preparo</h4><ol>{r.steps.map(x=><li key={x}>{x}</li>)}</ol></details>
          </div>
        </article>)}
      </div>
    </section>}

    {active==="history"&&<section className="page"><div className="hero"><History size={42}/><div><span>Histórico</span><h2>Todos os registros</h2></div></div><article className="panel">{historyData.map(e=><div className="entry" key={e.id}><div className="entryText"><strong>{e.description}</strong><small>{new Date(e.occurred_at).toLocaleString("pt-BR")}</small></div><b>{entryValue(e)}</b></div>)}</article></section>}

    {active==="stats"&&<section className="page">
      <div className="hero"><BarChart3 size={42}/><div><span>Estatísticas</span><h2>Evolução e composição corporal</h2><p>Dados da balança inteligente e registros do NutriClock.</p></div></div>

      <article className="panel dayRatingPanel">
        <div className="ratingHeader"><div><span>Avaliação nutrológica do dia</span><h2>{dayAssessment.score}/10</h2></div><div className="tenStars">{Array.from({length:10},(_,i)=><span className={i<dayAssessment.score?"filled":""} key={i}>★</span>)}</div></div>
        <h3>{dayAssessment.verdict}</h3>
        <div className="ratingColumns">
          <div><h4>Pontos positivos</h4>{dayAssessment.positives.length?dayAssessment.positives.map(item=><p key={item}>✓ {item}</p>):<p>Nenhum ponto positivo confirmado ainda.</p>}</div>
          <div><h4>Correções prioritárias</h4>{dayAssessment.improvements.length?dayAssessment.improvements.slice(0,4).map(item=><p key={item}>• {item}</p>):<p>Continue mantendo o padrão atual.</p>}</div>
        </div>
        <small>A nota considera os registros disponíveis até agora. Ela não substitui avaliação médica ou nutricional.</small>
      </article>

      <section className="bodyCompositionGrid">
        <article className="panel bodyHeroCard"><span>Leitura mais recente</span><strong>{latestWeight.toFixed(1)} kg</strong><p>{new Date(latestWeightDate).toLocaleString("pt-BR")}</p><div className="bodyScore"><b>{BODY_STATS.score}</b><small>pontuação média</small></div></article>
        <article className="panel bodyMetric warning"><span>Gordura corporal</span><strong>{BODY_STATS.bodyFatPercent}%</strong><small>{BODY_STATS.fatMassKg} kg de massa gorda</small></article>
        <article className="panel bodyMetric warning"><span>Gordura visceral</span><strong>{BODY_STATS.visceralFat}</strong><small>Nível de alerta</small></article>
        <article className="panel bodyMetric"><span>Massa magra</span><strong>{BODY_STATS.leanMassKg} kg</strong><small>Peso sem gordura</small></article>
        <article className="panel bodyMetric"><span>Água corporal</span><strong>{BODY_STATS.bodyWaterPercent}%</strong><small>Faixa indicada como ideal</small></article>
        <article className="panel bodyMetric"><span>Massa óssea</span><strong>{BODY_STATS.boneMassKg} kg</strong><small>Faixa indicada como ideal</small></article>
        <article className="panel bodyMetric"><span>Taxa de proteína</span><strong>{BODY_STATS.proteinRatePercent}%</strong><small>Faixa indicada como ideal</small></article>
        <article className="panel bodyMetric"><span>Metabolismo basal</span><strong>{BODY_STATS.bmrKcal} kcal</strong><small>Estimativa da balança</small></article>
        <article className="panel bodyMetric warning"><span>Idade metabólica</span><strong>{BODY_STATS.metabolicAge} anos</strong><small>Acima da idade cronológica informada</small></article>
        <article className="panel bodyMetric warning"><span>Peso ideal estimado</span><strong>{BODY_STATS.idealWeightKg} kg</strong><small>Controle sugerido: -{BODY_STATS.weightControlKg} kg</small></article>
        <article className="panel bodyMetric danger"><span>Nível de obesidade</span><strong>{BODY_STATS.obesityLevel}</strong><small>Tipo corporal: {BODY_STATS.bodyType}</small></article>
        <article className="panel bodyMetric warning"><span>Índice de gordura</span><strong>{BODY_STATS.bodyFatIndex}</strong><small>Classificação alta</small></article>
      </section>

      <article className="panel chartPanel"><h2>Calorias — últimos 7 dias</h2><ResponsiveContainer width="100%" height={300}><BarChart data={last7}><CartesianGrid strokeDasharray="3 3" stroke="#ffffff12"/><XAxis dataKey="label" stroke="#9fb2c9"/><YAxis stroke="#9fb2c9"/><Tooltip cursor={{fill:"rgba(62,126,207,.16)"}}/><ReferenceLine y={goals.calorieGoal} stroke="#ffc857" strokeDasharray="6 6"/><Bar dataKey="calories" fill="#62a6ff" activeBar={{fill:"#3f7fce"}} radius={[8,8,0,0]}/></BarChart></ResponsiveContainer></article>
      <article className="panel chartPanel"><h2>Peso</h2>{weightData.length?<ResponsiveContainer width="100%" height={280}><LineChart data={weightData}><CartesianGrid strokeDasharray="3 3" stroke="#ffffff12"/><XAxis dataKey="label" stroke="#9fb2c9"/><YAxis stroke="#9fb2c9" domain={["dataMin - 1","dataMax + 1"]}/><Tooltip/><Line dataKey="weight" stroke="#58e0b0" strokeWidth={4}/></LineChart></ResponsiveContainer>:<div className="empty">Sem registros de peso no banco. A leitura mais recente registrada é {latestWeight.toFixed(1)} kg.</div>}</article>
    </section>}

    {active==="pet"&&<section className="page pixelPetPage">
      <header className="pixelPetHeader">
        <div><span className="pixelEyebrow">Seu companheiro de jornada</span><h2>{petName}</h2></div>
        <div className="bananaWallet"><span>🍌</span><strong>{petNeeds.bananas}</strong><button onClick={()=>setRpgTab("chests")}>+</button></div>
      </header>

      <section className="pixelCompanionCard">
        <div className={`pixelStage monkey-${petAnimation}`} onClick={interactWithCompanion} key={`${petAnimation}-${petActionTick}`}>
          <div className="pixelStageGlow"/><div className="pixelDust">{[1,2,3,4,5,6,7].map(dot=><i key={dot}/>)}</div>
          <img className="pixelCompanionArt" src={PET_ACTIVE_IMAGE} alt={`${petName} ativo`}/>
          <div className="pixelSpeech">{petMessage}</div>
          <div className="pixelStageHint">Toque no MicoClock</div>
        </div>

        <div className="pixelCharacterInfo">
          <div className="pixelNameRow">
            {editingPetName?
              <form className="petNameEditor" onSubmit={savePetName}>
                <input autoFocus maxLength="18" value={petNameDraft} onChange={e=>setPetNameDraft(e.target.value)} aria-label="Novo nome do macaco"/>
                <button type="submit">Salvar</button>
                <button type="button" onClick={()=>{setEditingPetName(false);setPetNameDraft(petName)}}>Cancelar</button>
              </form>
              :<><div><h3>{petName}</h3><span className="pixelOnline"><i/>Companheiro ativo</span></div><button aria-label="Editar nome" onClick={()=>setEditingPetName(true)}><Pencil size={16}/></button></>}
          </div>
          <div className="pixelLevelRow"><div className="pixelLevelBadge"><small>NÍVEL</small><strong>{pet.level}</strong></div><div className="pixelXp"><div><strong>{pet.totalXp}</strong><span>/ 600 XP</span></div><div className="pixelBar green"><span style={{width:`${Math.min(100,pet.progress)}%`}}/></div><small>{pet.stage.name} · {pet.stage.title}</small></div></div>
          <div className="pixelVitals">
            <div><span className="vitalIcon">⚡</span><label>Energia</label><div className="pixelBar yellow"><span style={{width:`${petNeeds.energy}%`}}/></div><strong>{petNeeds.energy}/100</strong></div>
            <div><span className="vitalIcon">♥</span><label>Felicidade</label><div className="pixelBar red"><span style={{width:`${petNeeds.happiness}%`}}/></div><strong>{petNeeds.happiness}/100</strong></div>
            <div><span className="vitalIcon">🍴</span><label>Fome</label><div className="pixelBar orange"><span style={{width:`${petNeeds.hunger}%`}}/></div><strong>{petNeeds.hunger}/100</strong></div>
          </div>
        </div>

        <div className="pixelActions">
          <button className="interact" onClick={interactWithCompanion}><Gamepad2/><span><strong>Interagir</strong><small>+ Felicidade</small></span></button>
          <button className="feed" onClick={feedCompanion}><span className="actionEmoji">🍌</span><span><strong>Alimentar</strong><small>- Fome</small></span></button>
          <button className="train" onClick={trainCompanion}><Dumbbell/><span><strong>Treinar</strong><small>Preparar ataque</small></span></button>
        </div>
        <div className="petActionFeedback">
          <span>Interações hoje: <b>{petActions.interactions}</b></span>
          <span>Alimentações: <b>{petActions.feeds}</b></span>
          <span>Treinos: <b>{petActions.trainings}</b></span>
        </div>
      </section>

      <article className="dailyLoginCard">
        <div className="loginCalendarIcon">📅</div>
        <div><small>RECOMPENSA DE LOGIN</small><h3>{dailyLogin.streak} dia(s) consecutivo(s)</h3><p>Entre uma vez por dia para receber 2 bananas. A cada 7º dia, receba 7 bananas.</p></div>
        <div className="loginReward"><span>🍌</span><strong>+{dailyLogin.lastReward||0}</strong><small>hoje</small></div>
      </article>

      <nav className="pixelTabs">
        <button className={rpgTab==="journey"?"active":""} onClick={()=>setRpgTab("journey")}><Sword/>Jornada</button>
        <button className={rpgTab==="chests"?"active":""} onClick={()=>setRpgTab("chests")}><PackageOpen/>Baús <b>{chests.length}</b></button>
        <button className={rpgTab==="inventory"?"active":""} onClick={()=>setRpgTab("inventory")}><Backpack/>Inventário <b>{inventory.length}</b></button>
      </nav>

      {rpgTab==="journey"&&<>
        <article className="pixelBossCard compactBoss">
          <div className="pixelBossHead">
            <div><span>☠</span><div><small>CHEFE DA SEMANA</small><h3>Gorilão Sombrio</h3></div></div>
            <div className="bossTimerLive"><small>REINÍCIO EM</small><strong>{bossCountdown}</strong></div>
          </div>
          <div className="pixelBossBody">
            <div className={`pixelBossSprite resizedBoss ${pet.boss.hp===0?"defeated":""}`}>
              <img src="/pet/boss-shadow.png" alt="Gorilão Sombrio"/>
            </div>
            <div className="pixelBossProgress">
              <div className="bossHpLabels"><strong>{pet.boss.hp} / {pet.boss.maxHp} HP</strong><span>{pet.boss.percent}%</span></div>
              <div className="pixelBossHp"><span style={{width:`${pet.boss.percent}%`}}/></div>
              <p>Cumpra as missões listadas abaixo. Cada missão concluída retira HP do chefe. O chefe é reiniciado toda segunda-feira à meia-noite.</p>
              <div className="bossReward">
                <span>⚔ Dano final: {pet.boss.damage}</span>
                <span>🧱 Base: {pet.boss.baseDamage}</span>
                <span>🎒 Equipamento: ×{pet.boss.equipmentMultiplier.toFixed(2)}</span>
                <span>😊 Humor/energia: ×{pet.boss.moodMultiplier.toFixed(2)}</span>
                <span>💚 Cura do chefe: {pet.boss.regeneration}</span>
              </div>
            </div>
          </div>
        </article>

        <section className="pixelDashboardGrid">
          <article className="pixelWindow missionsWindow">
            <div className="pixelWindowTitle"><span>📜</span><h3>Missões atuais</h3></div>
            {(pet.missions.at(-1)?.quests||[]).map(q=>{
              const detail=q.id==="agua"
                ?{text:`Registre água até alcançar ${goals.waterGoal} ml.`,current:Math.round(totals.water_ml||0),target:goals.waterGoal,unit:"ml"}
                :q.id==="proteina"
                ?{text:`Registre refeições até alcançar ${goals.proteinGoal} g de proteína.`,current:Math.round(totals.protein_g||0),target:goals.proteinGoal,unit:"g"}
                :q.id==="treino"
                ?{text:"Registre pelo menos um exercício no dia.",current:(pet.missions.at(-1)?.exercise||0)>0?1:0,target:1,unit:"treino"}
                :q.id==="calorias"
                ?{text:`Mantenha o saldo líquido entre 1 e ${goals.calorieGoal} kcal.`,current:Math.max(0,Math.round(totals.net||0)),target:goals.calorieGoal,unit:"kcal"}
                :{text:"Faça pelo menos um registro nutricional hoje.",current:entries.length>0?1:0,target:1,unit:"registro"};
              const percent=Math.min(100,Math.round((detail.current/detail.target)*100));
              return <div className={`pixelMission explainedMission ${q.done?"done":""}`} key={q.id}>
                <div className="missionGlyph">{q.id==="agua"?"💧":q.id==="proteina"?"🍖":q.id==="treino"?"⚔":q.id==="calorias"?"⚖":"✓"}</div>
                <div className="missionContent"><strong>{q.name}</strong><p>{detail.text}</p><small>{detail.current} / {detail.target} {detail.unit}</small><div className="missionMiniBar"><span style={{width:`${percent}%`}}/></div></div>
                <b>{q.done?`+${q.xp} XP`:"Pendente"}</b>
              </div>;
            })}
          </article>

          <div className="pixelSideStack">
            <article className="pixelWindow equipmentPreview">
              <div className="pixelWindowTitle"><span>🎒</span><h3>Equipamentos</h3></div>
              <div className="pixelEquipmentSlots">{["head","weapon","body"].map(slot=>{const item=inventory.find(entry=>entry.id===equipment[slot]);return <button onClick={()=>setRpgTab("inventory")} key={slot}>{item?<><span>{item.icon}</span><small>{item.rarityName}</small></>:<><LockKeyhole/><small>Vazio</small></>}</button>})}</div>
            </article>
            <article className="pixelWindow inventoryPreview">
              <div className="pixelWindowTitle"><span>👜</span><h3>Inventário</h3><small>{inventory.length}/30 itens</small></div>
              <div className="pixelInventoryQuick">{inventory.slice(0,3).map(item=><button onClick={()=>setRpgTab("inventory")} key={item.id}><span>{item.icon}</span><b>{item.rarityName}</b></button>)}<button onClick={()=>setRpgTab("inventory")}><Plus/><b>Abrir</b></button></div>
            </article>
          </div>
        </section>

        <article className="pixelWindow journeyWindow">
          <div className="pixelWindowTitle"><span>🗺</span><h3>Mapa da semana</h3><strong>{pet.average}/100</strong></div>
          <div className="pixelQuestPath">{pet.missions.map((mission,index)=><div className={`pixelQuestNode ${mission.xp>=70?"complete":mission.xp>=40?"current":"danger"}`} key={mission.key}><span>{mission.xp>=70?"🏆":mission.xp>=40?"⚔":"☠"}</span><strong>{pet.locations[index]}</strong><small>{mission.xp} XP</small></div>)}</div>
        </article>
      </>}

      {rpgTab==="chests"&&<section className="pixelLootPage">
        <article className="pixelWindow pixelLootIntro"><div><span className="pixelEyebrow">Recompensas guardadas</span><h2>{chests.length} baú(s) disponíveis</h2><p>Abra quando quiser. Cada baú pode conter equipamentos de diferentes raridades.</p></div><div className="bigPixelChest">🧰</div></article>
        <div className="pixelRarityRow">{RARITIES.map(r=><span key={r.id} style={{color:r.color,borderColor:r.color}}>{r.name} {r.weight}%</span>)}</div>
        {!chests.length&&<div className="pixelWindow pixelEmpty"><PackageOpen/><h3>Nenhum baú guardado</h3><p>Complete metas para receber recompensas.</p></div>}
        <div className="pixelChestGrid">{chests.map(chest=><article className={`pixelChestCard ${chest.tier}`} key={chest.id}><div>🧰</div><small>{chest.tier==="rare"?"RARO":"MISSÃO"}</small><h3>{chest.title}</h3><button onClick={()=>openChest(chest)}>Abrir baú</button></article>)}</div>
      </section>}

      {rpgTab==="inventory"&&<section className="pixelInventoryPage">
        <article className="pixelWindow"><div className="pixelWindowTitle"><span>🛡</span><h3>Equipamentos ativos</h3></div><div className="pixelFullEquipment">{Object.entries(SLOT_LABELS).map(([slot,label])=>{const item=inventory.find(entry=>entry.id===equipment[slot]);return <article key={slot}><small>{label}</small>{item?<><div>{item.icon}</div><strong style={{color:item.rarityColor}}>{item.name}</strong><button onClick={()=>unequipSlot(slot)}>Remover</button></>:<><LockKeyhole/><strong>Vazio</strong></>}</article>})}</div></article>
        <article className="pixelWindow"><div className="pixelWindowTitle"><span>🎒</span><h3>Mochila</h3><small>{inventory.length} itens</small></div>{!inventory.length&&<div className="pixelEmpty"><Gem/><p>Abra baús para encontrar equipamentos.</p></div>}<div className="pixelItemGrid">{inventory.map(item=><article className={item.kind==="care"?"careLootCard":""} style={{borderColor:item.rarityColor}} key={item.id}><div>{item.icon}</div><span style={{color:item.rarityColor}}>{item.rarityName}</span><h4>{item.name}</h4><small>{item.kind==="care"?`${item.description} +${item.amount}`:Object.entries(item.stats||{}).map(([stat,value])=>`${STAT_LABELS[stat]} +${value}`).join(" · ")}</small><button onClick={()=>item.kind==="care"?useCareItem(item):equipItem(item)}>{item.kind==="care"?"Usar":equipment[item.slot]===item.id?"Equipado":"Equipar"}</button></article>)}</div></article>
      </section>}

      {lootReveal&&<div className="lootModal" onClick={()=>setLootReveal(null)}><div className="pixelLootReveal" onClick={event=>event.stopPropagation()} style={{borderColor:lootReveal.item.rarityColor}}><Sparkles/><span>ITEM ENCONTRADO</span><div>{lootReveal.item.icon}</div><h2>{lootReveal.item.name}</h2><strong style={{color:lootReveal.item.rarityColor}}>{lootReveal.item.rarityName}</strong><button onClick={()=>{lootReveal.item.kind==="care"?useCareItem(lootReveal.item):equipItem(lootReveal.item);setLootReveal(null);setRpgTab("inventory")}}>{lootReveal.item.kind==="care"?"Usar agora":"Equipar agora"}</button><button onClick={()=>setLootReveal(null)}>Guardar</button></div></div>}
    </section>}

    {active==="profile"&&<section className="page">
      <div className="hero profileHero">
        <User size={42}/>
        <div><span>Perfil e objetivos</span><h2>Metas adaptadas ao seu corpo e objetivo</h2><p>Os cálculos usam Mifflin–St Jeor e um ajuste conforme objetivo, ritmo e atividade.</p></div>
      </div>

      <div className="profileLayout">
        <form className="panel profileForm" onSubmit={saveProfile}>
          <div className="panelHead"><div><h2>Seus dados</h2><p>Altere quando quiser. As metas são recalculadas automaticamente.</p></div></div>
          <div className="profileFields">
            <label>Nome<input value={profileDraft.name} onChange={e=>setProfileDraft({...profileDraft,name:e.target.value})}/></label>
            <label>Sexo<select value={profileDraft.sex} onChange={e=>setProfileDraft({...profileDraft,sex:e.target.value})}><option value="male">Masculino</option><option value="female">Feminino</option></select></label>
            <label>Idade<input type="number" min="16" value={profileDraft.age} onChange={e=>setProfileDraft({...profileDraft,age:e.target.value})}/></label>
            <label>Altura (cm)<input type="number" min="130" value={profileDraft.heightCm} onChange={e=>setProfileDraft({...profileDraft,heightCm:e.target.value})}/></label>
            <label>Peso atual (kg)<input type="number" min="35" step="0.1" value={profileDraft.weightKg} onChange={e=>setProfileDraft({...profileDraft,weightKg:e.target.value})}/></label>
            <label>Nível de atividade<select value={profileDraft.activity} onChange={e=>setProfileDraft({...profileDraft,activity:e.target.value})}><option value="sedentary">Sedentário</option><option value="light">Levemente ativo</option><option value="moderate">Moderadamente ativo</option><option value="high">Muito ativo</option></select></label>
            <label>Objetivo<select value={profileDraft.objective} onChange={e=>setProfileDraft({...profileDraft,objective:e.target.value})}><option value="lose">Emagrecer</option><option value="maintain">Manter peso</option><option value="gain">Ganhar peso</option><option value="muscle">Ganhar massa muscular</option></select></label>
            <label>Ritmo<select value={profileDraft.pace} onChange={e=>setProfileDraft({...profileDraft,pace:e.target.value})}><option value="slow">Gradual</option><option value="moderate">Moderado</option><option value="fast">Acelerado</option></select></label>
          </div>
          <button className="primary">{profileSaved?"Metas atualizadas":"Salvar e recalcular metas"}</button>
        </form>

        <aside className="profileGoals">
          <article className="panel goalSummary"><span>Meta recomendada</span><strong>{goals.calorieGoal} kcal</strong><p>{profile.objective==="lose"?"Déficit calculado para perda de gordura.":profile.objective==="muscle"?"Superávit leve com proteína elevada para hipertrofia.":profile.objective==="gain"?"Superávit calórico para ganho gradual de peso.":"Meta próxima ao gasto diário estimado."}</p></article>
          <div className="profileGrid dynamic">
            <article className="panel"><h3>Proteína</h3><b>{goals.proteinGoal} g</b><small>Baseada no peso e objetivo</small></article>
            <article className="panel"><h3>Água</h3><b>{goals.waterGoal} ml</b><small>Aproximadamente 35 ml/kg</small></article>
            <article className="panel"><h3>Metabolismo basal</h3><b>{goals.bmr} kcal</b><small>Estimativa em repouso</small></article>
            <article className="panel"><h3>Gasto diário</h3><b>{goals.tdee} kcal</b><small>Inclui nível de atividade</small></article>
          </div>
          <div className="profileDisclaimer">Estimativas servem para acompanhamento pessoal e não substituem avaliação de nutricionista ou médico.</div>
        </aside>
      </div>
    </section>}

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

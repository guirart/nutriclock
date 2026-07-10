
const ENTRY_KEY = "nutriclock_entries_pro_v1";
const SETTINGS_KEY = "nutriclock_settings_pro_v1";

let entries = JSON.parse(localStorage.getItem(ENTRY_KEY) || "[]");
let settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null") || {
  goal: 1850,
  protein: 160,
  water: 3000,
  caffeine: 400
};

const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, "0");

function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function localDateTime(date = new Date()) {
  return `${dateKey(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDateBR(key) {
  const [year, month, day] = key.split("-");
  return `${day}/${month}/${year}`;
}

function saveEntries() {
  localStorage.setItem(ENTRY_KEY, JSON.stringify(entries));
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function updateClock() {
  const now = new Date();
  $("clockTime").textContent = now.toLocaleTimeString("pt-BR");
  $("clockDate").textContent = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  $("todayBadge").textContent = now.toLocaleDateString("pt-BR");
}

setInterval(updateClock, 1000);
updateClock();

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => showPage(tab.dataset.page));
});

function showPage(pageId) {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.page === pageId);
  });
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.toggle("active", page.id === pageId);
  });
  if (pageId === "history") renderHistory();
}

function typeIcon(type) {
  return {
    meal: "🍽️",
    exercise: "🏋️",
    water: "💧",
    caffeine: "☕",
    weight: "⚖️"
  }[type] || "📝";
}

function typeLabel(type) {
  return {
    meal: "Refeição",
    exercise: "Exercício",
    water: "Água",
    caffeine: "Cafeína",
    weight: "Peso"
  }[type] || type;
}

function entryValue(entry) {
  if (entry.type === "meal") return `${Math.round(entry.calories || 0)} kcal`;
  if (entry.type === "exercise") return `−${Math.round(entry.calories || 0)} kcal`;
  if (entry.type === "water") return `${Math.round(entry.water || 0)} ml`;
  if (entry.type === "caffeine") return `${Math.round(entry.caffeine || 0)} mg`;
  if (entry.type === "weight") return `${Number(entry.weight).toFixed(1)} kg`;
  return "";
}

function getTotals(key) {
  return entries
    .filter((entry) => entry.datetime.startsWith(key))
    .reduce(
      (total, entry) => {
        if (entry.type === "meal") {
          total.consumed += Number(entry.calories || 0);
          total.protein += Number(entry.protein || 0);
        }
        if (entry.type === "exercise") total.exercise += Number(entry.calories || 0);
        if (entry.type === "water") total.water += Number(entry.water || 0);
        if (entry.type === "caffeine") total.caffeine += Number(entry.caffeine || 0);
        if (entry.type === "weight" && entry.weight) total.weight = Number(entry.weight);
        total.list.push(entry);
        return total;
      },
      {
        consumed: 0,
        exercise: 0,
        protein: 0,
        water: 0,
        caffeine: 0,
        weight: null,
        list: []
      }
    );
}

function setProgress(id, value, max) {
  $(id).style.width = `${Math.min(100, Math.max(0, (value / max) * 100))}%`;
}

function renderDashboard() {
  const today = getTotals(dateKey());
  const net = today.consumed - today.exercise;
  const balance = settings.goal - net;

  $("consumedValue").textContent = Math.round(today.consumed);
  $("exerciseValue").textContent = Math.round(today.exercise);
  $("netValue").textContent = Math.round(net);
  $("goalValue").textContent = settings.goal;
  $("proteinValue").textContent = Math.round(today.protein);
  $("waterValue").textContent = Math.round(today.water);
  $("caffeineValue").textContent = Math.round(today.caffeine);
  $("balanceValue").innerHTML = `${Math.abs(Math.round(balance))} <small>kcal</small>`;
  $("balanceValue").className = `stat-value ${balance >= 0 ? "positive" : "negative"}`;
  $("balanceText").textContent = balance >= 0 ? "Abaixo da meta líquida" : "Acima da meta líquida";
  $("entryCount").textContent = `${today.list.length} ${today.list.length === 1 ? "registro" : "registros"}`;

  setProgress("consumedBar", today.consumed, settings.goal);
  setProgress("exerciseBar", today.exercise, 500);
  setProgress("proteinBar", today.protein, settings.protein);
  setProgress("waterBar", today.water, settings.water);
  setProgress("caffeineBar", today.caffeine, settings.caffeine);

  renderTodayEntries(today.list);
  renderWeeklyTable();
  drawWeeklyChart();
  updateProfile();
}

function renderTodayEntries(list) {
  const container = $("todayEntries");
  if (!list.length) {
    container.innerHTML = '<div class="empty">Nenhum registro hoje.</div>';
    return;
  }

  const sorted = [...list].sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
  container.innerHTML = sorted
    .map(
      (entry) => `
      <div class="entry">
        <div class="entry-icon">${typeIcon(entry.type)}</div>
        <div>
          <div class="entry-title">${entry.description}</div>
          <div class="entry-meta">
            ${typeLabel(entry.type)} •
            ${new Date(entry.datetime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} •
            confiança ${entry.confidence || "—"}
          </div>
        </div>
        <div class="entry-value">
          ${entryValue(entry)}
          <br />
          <button class="delete-button" onclick="deleteEntry('${entry.id}')">excluir</button>
        </div>
      </div>
    `
    )
    .join("");
}

function lastSevenDays() {
  const result = [];
  const now = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    result.push(dateKey(date));
  }
  return result;
}

function renderWeeklyTable() {
  $("weeklyTable").innerHTML = lastSevenDays()
    .map((key) => {
      const total = getTotals(key);
      return `
        <tr>
          <td>${formatDateBR(key)}</td>
          <td>${Math.round(total.consumed)} kcal</td>
          <td>${Math.round(total.exercise)} kcal</td>
          <td>${Math.round(total.consumed - total.exercise)} kcal</td>
          <td>${Math.round(total.protein)} g</td>
          <td>${Math.round(total.water)} ml</td>
          <td>${total.weight ? `${total.weight.toFixed(1)} kg` : "—"}</td>
        </tr>
      `;
    })
    .join("");
}

function drawWeeklyChart() {
  const canvas = $("weeklyChart");
  const context = canvas.getContext("2d");
  const keys = lastSevenDays();
  const values = keys.map((key) => getTotals(key).consumed);
  const max = Math.max(settings.goal, ...values, 1) * 1.15;
  const width = canvas.width;
  const height = canvas.height;
  const paddingX = 52;
  const paddingY = 34;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;
  const barWidth = (plotWidth / 7) * 0.55;

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#091628";
  context.fillRect(0, 0, width, height);

  for (let i = 0; i < 4; i += 1) {
    const y = paddingY + (plotHeight / 3) * i;
    context.strokeStyle = "rgba(255,255,255,.10)";
    context.beginPath();
    context.moveTo(paddingX, y);
    context.lineTo(width - paddingX, y);
    context.stroke();
  }

  const goalY = paddingY + plotHeight - (settings.goal / max) * plotHeight;
  context.strokeStyle = "rgba(255,200,87,.85)";
  context.setLineDash([8, 6]);
  context.beginPath();
  context.moveTo(paddingX, goalY);
  context.lineTo(width - paddingX, goalY);
  context.stroke();
  context.setLineDash([]);

  keys.forEach((key, index) => {
    const value = values[index];
    const barHeight = (value / max) * plotHeight;
    const x = paddingX + (index + 0.5) * (plotWidth / 7) - barWidth / 2;
    const y = paddingY + plotHeight - barHeight;

    const gradient = context.createLinearGradient(0, y, 0, y + barHeight);
    gradient.addColorStop(0, "#58e0b0");
    gradient.addColorStop(1, "#62a6ff");
    context.fillStyle = gradient;
    context.fillRect(x, y, barWidth, barHeight);

    context.fillStyle = "#9eb0c7";
    context.font = "12px system-ui";
    context.textAlign = "center";
    context.fillText(key.slice(8), x + barWidth / 2, height - 10);

    context.fillStyle = "#f4f8ff";
    context.fillText(Math.round(value), x + barWidth / 2, Math.max(18, y - 7));
  });
}

$("entryForm").addEventListener("submit", (event) => {
  event.preventDefault();

  entries.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    type: $("entryType").value,
    datetime: $("entryDateTime").value,
    description: $("entryDescription").value.trim(),
    calories: Number($("entryCalories").value || 0),
    protein: Number($("entryProtein").value || 0),
    water: Number($("entryWater").value || 0),
    caffeine: Number($("entryCaffeine").value || 0),
    weight: $("entryWeight").value ? Number($("entryWeight").value) : null,
    confidence: $("entryConfidence").value,
    notes: $("entryNotes").value.trim()
  });

  saveEntries();
  resetForm();
  renderDashboard();
  showPage("dashboard");
  showToast("Registro salvo");
});

function resetForm() {
  $("entryForm").reset();
  $("entryDateTime").value = localDateTime();
  $("entryCalories").value = 0;
  $("entryProtein").value = 0;
  $("entryWater").value = 0;
  $("entryCaffeine").value = 0;
}

$("clearForm").addEventListener("click", resetForm);

$("quickWater").addEventListener("click", () => {
  entries.push({
    id: `${Date.now()}-water`,
    type: "water",
    datetime: localDateTime(),
    description: "Água",
    calories: 0,
    protein: 0,
    water: 250,
    caffeine: 0,
    weight: null,
    confidence: "Alta",
    notes: "Ação rápida"
  });
  saveEntries();
  renderDashboard();
  showToast("250 ml de água adicionados");
});

$("quickCoffee").addEventListener("click", () => {
  entries.push({
    id: `${Date.now()}-coffee`,
    type: "caffeine",
    datetime: localDateTime(),
    description: "Café sem açúcar",
    calories: 2,
    protein: 0,
    water: 200,
    caffeine: 90,
    weight: null,
    confidence: "Média",
    notes: "Ação rápida"
  });
  saveEntries();
  renderDashboard();
  showToast("Café adicionado");
});

$("quickMeal").addEventListener("click", () => {
  showPage("add");
  $("entryType").value = "meal";
  $("entryDescription").focus();
});

window.deleteEntry = function deleteEntry(id) {
  if (!confirm("Excluir este registro?")) return;
  entries = entries.filter((entry) => entry.id !== id);
  saveEntries();
  renderDashboard();
  renderHistory();
};

$("historyFilter").addEventListener("change", renderHistory);

function renderHistory() {
  const filter = $("historyFilter").value;
  let list = [...entries].sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
  if (filter) list = list.filter((entry) => entry.datetime.startsWith(filter));

  const container = $("historyEntries");
  if (!list.length) {
    container.innerHTML = '<div class="empty">Nenhum registro encontrado.</div>';
    return;
  }

  container.innerHTML = list
    .map(
      (entry) => `
      <div class="entry">
        <div class="entry-icon">${typeIcon(entry.type)}</div>
        <div>
          <div class="entry-title">${entry.description}</div>
          <div class="entry-meta">
            ${new Date(entry.datetime).toLocaleString("pt-BR")} •
            ${typeLabel(entry.type)}
          </div>
        </div>
        <div class="entry-value">${entryValue(entry)}</div>
      </div>
    `
    )
    .join("");
}

$("settingsForm").addEventListener("submit", (event) => {
  event.preventDefault();
  settings = {
    goal: Number($("settingGoal").value),
    protein: Number($("settingProtein").value),
    water: Number($("settingWater").value),
    caffeine: Number($("settingCaffeine").value)
  };
  saveSettings();
  renderDashboard();
  showToast("Metas salvas");
});

function loadSettings() {
  $("settingGoal").value = settings.goal;
  $("settingProtein").value = settings.protein;
  $("settingWater").value = settings.water;
  $("settingCaffeine").value = settings.caffeine;
}

function updateProfile() {
  $("profileGoal").textContent = settings.goal;
  const weights = entries
    .filter((entry) => entry.type === "weight" && entry.weight)
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
  const lastWeight = weights[0]?.weight || 93.7;
  $("profileWeight").textContent = lastWeight.toFixed(1).replace(".", ",");
}

$("exportButton").addEventListener("click", () => {
  const blob = new Blob(
    [JSON.stringify({ settings, entries, exportedAt: new Date().toISOString() }, null, 2)],
    { type: "application/json" }
  );
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `nutriclock-backup-${dateKey()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
});

$("importInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const data = JSON.parse(await file.text());
    if (Array.isArray(data.entries)) entries = data.entries;
    if (data.settings) settings = data.settings;
    saveEntries();
    saveSettings();
    loadSettings();
    renderDashboard();
    showToast("Backup importado");
  } catch {
    alert("Arquivo inválido.");
  }
});

$("clearAllButton").addEventListener("click", () => {
  if (!confirm("Apagar todos os dados?")) return;
  entries = [];
  settings = { goal: 1850, protein: 160, water: 3000, caffeine: 400 };
  saveEntries();
  saveSettings();
  loadSettings();
  renderDashboard();
  renderHistory();
  showToast("Dados apagados");
});

function showToast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 1800);
}

let deferredPrompt;

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  $("installButton").classList.remove("hidden");
});

$("installButton").addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  $("installButton").classList.add("hidden");
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}

resetForm();
loadSettings();
renderDashboard();

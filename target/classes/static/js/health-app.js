// ===============================
// 体重入力画面（health-weight.html）
// ===============================
let chart;

const saveWeightBtn = document.getElementById("saveWeightBtn");
if (saveWeightBtn) {
  saveWeightBtn.addEventListener("click", () => {
    const height = parseFloat(document.getElementById("height").value);
    const weight = parseFloat(document.getElementById("weight").value);

    if (!height || !weight) {
      alert("身長と体重を入力してね");
      return;
    }

    localStorage.setItem("latestHeight", height);

    const bmi = (weight / ((height / 100) ** 2)).toFixed(1);

    saveWeightToLocal(weight, bmi);
    const today = new Date().toLocaleDateString("ja-JP");
    localStorage.setItem("lastWeightDate", today);

    alert("保存しました");
    location.href = "health-dashboard.html";
  });
}

function saveWeightToLocal(weight, bmi) {
  const today = new Date().toLocaleDateString("ja-JP");
  const data = JSON.parse(localStorage.getItem("weights") || "[]");
  data.push({ date: today, weight: weight, bmi: bmi });
  localStorage.setItem("weights", JSON.stringify(data));
}

function updateChart() {
  const data = JSON.parse(localStorage.getItem("weights") || "[]");
  const height = localStorage.getItem("latestHeight");

  if (!height || data.length === 0) return;

  const labels  = data.map(d => d.date);
  const weights = data.map(d => d.weight);
  const bmis    = data.map(d => (d.weight / ((height / 100) ** 2)).toFixed(1));

  const ctx = document.getElementById("weightChart");
  if (!ctx) return;

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "体重 (kg)",
          data: weights,
          borderColor: "#4CAF50",
          backgroundColor: "rgba(76, 175, 80, 0.2)",
          borderWidth: 2,
          tension: 0.3
        },
        {
          label: "BMI",
          data: bmis,
          borderColor: "#FF5722",
          backgroundColor: "rgba(255, 87, 34, 0.2)",
          borderWidth: 2,
          tension: 0.3,
          yAxisID: "y1"
        }
      ]
    },
    options: {
      scales: {
        y:  { beginAtZero: false },
        y1: { beginAtZero: false, position: "right" }
      }
    }
  });
}

// ===============================
// 食事入力画面（health-food.html）
// ===============================
const saveFoodBtn = document.getElementById("saveFoodBtn");

if (saveFoodBtn) {
  saveFoodBtn.addEventListener("click", () => {
    const name    = document.getElementById("foodName").value;
    const calorie = document.getElementById("calorie").value;
    const protein = document.getElementById("protein").value;

    if (!name || !calorie || !protein) {
      alert("食品名・カロリー・タンパク質を入力してね");
      return;
    }

    const foodData = {
      name:    name,
      calorie: Number(calorie),
      protein: Number(protein)
    };

    const savedFoods = JSON.parse(localStorage.getItem("todayFoods") || "[]");
    savedFoods.push(foodData);
    localStorage.setItem("todayFoods", JSON.stringify(savedFoods));

    document.getElementById("foodName").value = "";
    document.getElementById("calorie").value  = "";
    document.getElementById("protein").value  = "";

    alert("保存しました");
    location.href = "health-dashboard.html";
  });
}

function updateFoodList() {
  const list = document.getElementById("foodList");
  if (!list) return;

  const data = JSON.parse(localStorage.getItem("todayFoods") || "[]");
  list.innerHTML = "";

  data.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name}（${item.calorie}kcal / タンパク質${item.protein}g）`;
    list.appendChild(li);
  });
}

// ===============================
// ToDo 入力画面（health-todo.html）
// ===============================
const addTodoBtn = document.getElementById("addTodoBtn");
if (addTodoBtn) {
  addTodoBtn.addEventListener("click", () => {
    const text = document.getElementById("todoInput").value.trim();

    if (!text) {
      alert("やることを入力してね");
      return;
    }

    const data = JSON.parse(localStorage.getItem("todos") || "[]");
    data.push({ text: text, done: false });
    localStorage.setItem("todos", JSON.stringify(data));

    document.getElementById("todoInput").value = "";

    alert("追加しました");
    location.href = "health-dashboard.html";
  });
}

function updateTodoList() {
  const list = document.getElementById("todoList");
  if (!list) return;

  const data = JSON.parse(localStorage.getItem("todos") || "[]");
  list.innerHTML = "";

  data.forEach((item, index) => {
    const li = document.createElement("li");
    li.style.display   = "flex";
    li.style.alignItems = "center";
    li.style.gap       = "8px";
    li.style.listStyle = "none";

    const checkbox     = document.createElement("input");
    checkbox.type      = "checkbox";
    checkbox.checked   = item.done;

    checkbox.addEventListener("change", () => {
      data[index].done = checkbox.checked;
      localStorage.setItem("todos", JSON.stringify(data));
      updateTodoList();
    });

    const span = document.createElement("span");
    span.textContent = item.text;

    if (item.done) {
      span.style.textDecoration = "line-through";
      span.style.opacity        = "0.6";
    }

    li.appendChild(checkbox);
    li.appendChild(span);
    list.appendChild(li);
  });
}

// ===============================
// スケジュール入力画面（health-schedule.html）
// ===============================
const addPlanBtn = document.getElementById("addPlanBtn");
if (addPlanBtn) {
  addPlanBtn.addEventListener("click", () => {
    const time = document.getElementById("timeInput").value;
    const plan = document.getElementById("planInput").value.trim();

    if (!time || !plan) {
      alert("時間と予定を入力してね");
      return;
    }

    const data = JSON.parse(localStorage.getItem("plans") || "[]");
    data.push({ time, plan });
    localStorage.setItem("plans", JSON.stringify(data));

    document.getElementById("planInput").value = "";

    alert("追加しました");
    location.href = "health-dashboard.html";
  });
}

function updatePlanList() {
  const list = document.getElementById("planList");
  if (!list) return;

  const data = JSON.parse(localStorage.getItem("plans") || "[]");
  list.innerHTML = "";

  data.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.time}：${item.plan}`;
    list.appendChild(li);
  });
}

// ===============================
// ダッシュボード（health-dashboard.html）
// ===============================
function loadLatestWeight() {
  const data = JSON.parse(localStorage.getItem("weights") || "[]");
  if (data.length === 0) return;

  const latest = data[data.length - 1];
  const el = document.getElementById("latestWeight");
  if (el) el.textContent = "体重: " + latest.weight + " kg";
}

function loadLatestBMI() {
  const height = localStorage.getItem("latestHeight");
  const data   = JSON.parse(localStorage.getItem("weights") || "[]");
  if (!height || data.length === 0) return;

  const latest = data[data.length - 1].weight;
  const bmi    = (latest / ((height / 100) ** 2)).toFixed(1);

  const el = document.getElementById("latestBMI");
  if (el) el.textContent = "BMI: " + bmi;
}

function loadTodayCalorie() {
  const data = JSON.parse(localStorage.getItem("todayFoods") || "[]");

  let totalCalorie = 0;
  let totalProtein = 0;

  data.forEach(item => {
    totalCalorie += Number(item.calorie);
    totalProtein += Number(item.protein);
  });

  const calEl = document.getElementById("todayCalorie");
  if (calEl) calEl.textContent = "合計: " + totalCalorie + " kcal";

  const proEl = document.getElementById("todayProtein");
  if (proEl) proEl.textContent = "タンパク質: " + totalProtein + " g";
}

function loadTodayFoodsDashboard() {
  const list = document.getElementById("foodListDashboard");
  if (!list) return;

  const data = JSON.parse(localStorage.getItem("todayFoods") || "[]");
  list.innerHTML = "";

  data.forEach(item => {
    const li = document.createElement("li");

    const name = document.createElement("div");
    name.textContent   = item.name;
    name.style.fontWeight = "bold";
    name.style.whiteSpace = "nowrap";

    const detail = document.createElement("div");
    detail.innerHTML   = `カロリー：${item.calorie} kcal<br>タンパク質：${item.protein} g`;
    detail.style.fontSize = "14px";
    detail.style.opacity  = "0.8";

    li.appendChild(name);
    li.appendChild(detail);
    list.appendChild(li);
  });
}

function loadTodoDashboard() {
  const list = document.getElementById("todoListDashboard");
  if (!list) return;

  const data = JSON.parse(localStorage.getItem("todos") || "[]");
  list.innerHTML = "";

  data.forEach((item, index) => {
    const li = document.createElement("li");
    li.style.display    = "flex";
    li.style.alignItems = "center";
    li.style.gap        = "8px";
    li.style.listStyle  = "none";

    const checkbox   = document.createElement("input");
    checkbox.type    = "checkbox";
    checkbox.checked = item.done;

    checkbox.addEventListener("change", () => {
      data[index].done = checkbox.checked;
      localStorage.setItem("todos", JSON.stringify(data));
      loadTodoDashboard();
    });

    const span = document.createElement("span");
    span.textContent = item.text;

    if (item.done) {
      span.style.textDecoration = "line-through";
      span.style.opacity        = "0.6";
    }

    li.appendChild(checkbox);
    li.appendChild(span);
    list.appendChild(li);
  });
}

function loadPlanDashboard() {
  const list = document.getElementById("planListDashboard");
  if (!list) return;

  const data = JSON.parse(localStorage.getItem("plans") || "[]");
  list.innerHTML = "";

  data.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.time}：${item.plan}`;
    list.appendChild(li);
  });
}

function loadMiniChart() {
  const data   = JSON.parse(localStorage.getItem("weights") || "[]");
  const height = localStorage.getItem("latestHeight");

  if (!height || data.length === 0) return;

  const labels  = data.map(d => d.date);
  const weights = data.map(d => d.weight);
  const bmis    = data.map(d => (d.weight / ((height / 100) ** 2)).toFixed(1));

  const ctx = document.getElementById("miniChart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "体重",
          data: weights,
          borderColor: "#4CAF50",
          borderWidth: 2,
          tension: 0.3
        },
        {
          label: "BMI",
          data: bmis,
          borderColor: "#FF5722",
          borderWidth: 2,
          tension: 0.3,
          yAxisID: "y1"
        }
      ]
    },
    options: {
      scales: {
        y:  { beginAtZero: false },
        y1: { beginAtZero: false, position: "right" }
      }
    }
  });
}

// ===============================
// 各ページの初期化
// ===============================
window.addEventListener("DOMContentLoaded", () => {
  // ダッシュボード
  loadLatestWeight();
  loadLatestBMI();
  loadTodayCalorie();
  loadTodayFoodsDashboard();
  loadTodoDashboard();
  loadPlanDashboard();
  loadMiniChart();

  // 食事入力ページ
  updateFoodList();

  // ToDoページ
  updateTodoList();

  // スケジュールページ
  updatePlanList();
});

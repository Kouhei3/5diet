// ===============================
// 体重入力画面（weight.html）
// ===============================
let chart; // グラフ用

const saveWeightBtn = document.getElementById("saveWeightBtn");
if (saveWeightBtn) {
  saveWeightBtn.addEventListener("click", () => {
    const height = parseFloat(document.getElementById("height").value);
    const weight = parseFloat(document.getElementById("weight").value);

    if (!height || !weight) {
      alert("身長と体重を入力してね");
      return;
    }

    // 身長保存
    localStorage.setItem("latestHeight", height);

    // BMI計算
    const bmi = (weight / ((height / 100) ** 2)).toFixed(1);

    // 結果表示
    document.getElementById("weightResult").textContent = weight;
    document.getElementById("bmiResult").textContent = bmi;

    // 体重保存
    saveWeightToLocal(weight);

    // ★ 今日入力した日付を記録
    localStorage.setItem("lastWeightDate", today);

    // グラフ更新
    updateChart();

    alert("保存しました");
  });

  updateChart();
}
// -------------------------
// 体重データ保存
// -------------------------
function saveWeightToLocal(weight) {
  const today = new Date().toLocaleDateString("ja-JP");
  const data = JSON.parse(localStorage.getItem("weights") || "[]");

  data.push({ date: today, weight: weight });
  localStorage.setItem("weights", JSON.stringify(data));
}
// -------------------------
// グラフ描画
// -------------------------
function updateChart() {
  const data = JSON.parse(localStorage.getItem("weights") || "[]");
  const height = localStorage.getItem("latestHeight"); // BMI計算に必要

  if (!height || data.length === 0) return;

  const labels = data.map(d => d.date);
  const weights = data.map(d => d.weight);

  // ★ BMI の配列を作る
  const bmis = data.map(d => {
    return (d.weight / ((height / 100) ** 2)).toFixed(1);
  });

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
          yAxisID: "y1" // ★ BMI 用の右側軸
        }
      ]
    },
    options: {
      scales: {
        y: { beginAtZero: false },
        y1: { beginAtZero: false, position: "right" } // ★ 右側にBMI軸
      }
    }
  });
}
// ===============================
// 食事入力画面（food.html）
// ===============================
const saveFoodBtn = document.getElementById("saveFoodBtn");

if (saveFoodBtn) {
  saveFoodBtn.addEventListener("click", () => {
    const name = document.getElementById("foodName").value;
    const calorie = document.getElementById("calorie").value;
    const protein = document.getElementById("protein").value;

    if (!name || !calorie || !protein) {
      alert("食品名・カロリー・タンパク質を入力してね");
      return;
    }

    // 保存するデータ
    const foodData = {
      name: name,
      calorie: Number(calorie),
      protein: Number(protein)
    };

    // 既存データを取得（なければ空配列）
    const savedFoods = JSON.parse(localStorage.getItem("todayFoods")) || [];

    // 新しいデータを追加
    savedFoods.push(foodData);

    // 保存
    localStorage.setItem("todayFoods", JSON.stringify(savedFoods));

    // 食事リスト更新（food.html の画面用）
    updateFoodList();

    // 入力欄クリア
    document.getElementById("foodName").value = "";
    document.getElementById("calorie").value = "";
    document.getElementById("protein").value = "";

    alert("保存しました");
  });
}
updateFoodList();
// -------------------------
// 食事データ保存
// -------------------------
function saveFoodToLocal(name, calorie, protein) {
  const data = JSON.parse(localStorage.getItem("todayFoods") || "[]");

  data.push({
    name: name,
    calorie: calorie,
    protein: protein
  });

  localStorage.setItem("todayFoods", JSON.stringify(data));
}
// -------------------------
// 食事リスト表示
// -------------------------
function updateFoodList() {
  const list = document.getElementById("foodList");
  if (!list) return;

  const data = JSON.parse(localStorage.getItem("todayFoods") || "[]");

  list.innerHTML = "";
  data.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name}：${item.calorie} kcal / ${item.protein} g`;
    list.appendChild(li);
  });
}
// ===============================
// ToDo 入力画面（todo.html）
// ===============================
const addTodoBtn = document.getElementById("addTodoBtn");
if (addTodoBtn) {
  addTodoBtn.addEventListener("click", () => {
    const text = document.getElementById("todoInput").value;

    if (!text) {
      alert("やることを入力してね");
      return;
    }

    const data = JSON.parse(localStorage.getItem("todos") || "[]");

    // ★ チェック機能対応の保存形式
    data.push({ text: text, done: false });

    localStorage.setItem("todos", JSON.stringify(data));

    document.getElementById("todoInput").value = "";

    updateTodoList();
    alert("追加しました");
  });

  updateTodoList();
}
// -------------------------
// ToDo 表示（チェック機能つき）
// -------------------------
function updateTodoList() {
  const list = document.getElementById("todoList");
  if (!list) return;

  const data = JSON.parse(localStorage.getItem("todos") || "[]");
  list.innerHTML = "";

  data.forEach((item, index) => {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.done;

    checkbox.addEventListener("change", () => {
      data[index].done = checkbox.checked;
      localStorage.setItem("todos", JSON.stringify(data));
      updateTodoList();
    });

    const span = document.createElement("span");
    span.textContent = item.text;

    if (item.done) {
      span.style.textDecoration = "line-through";
      span.style.opacity = "0.6";
    }

    li.appendChild(checkbox);
    li.appendChild(span);
    list.appendChild(li);
  });
}
// ===============================
// スケジュール入力画面（schedule.html）
// ===============================
const addPlanBtn = document.getElementById("addPlanBtn");
if (addPlanBtn) {
  addPlanBtn.addEventListener("click", () => {
    const time = document.getElementById("timeInput").value;
    const plan = document.getElementById("planInput").value;

    if (!time || !plan) {
      alert("時間と予定を入力してね");
      return;
    }

    const data = JSON.parse(localStorage.getItem("plans") || "[]");
    data.push({ time, plan });
    localStorage.setItem("plans", JSON.stringify(data));

    document.getElementById("planInput").value = "";

    updatePlanList();
    alert("追加しました");
  });

  updatePlanList();
}
// -------------------------
// スケジュール表示
// -------------------------
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
// ダッシュボード（index.html）
// ===============================
function loadLatestWeight() {
  const data = JSON.parse(localStorage.getItem("weights") || "[]");
  if (data.length === 0) return;

  const latest = data[data.length - 1];
  const el = document.getElementById("latestWeight");
  if (el) el.textContent = latest.weight + " kg";
}
function loadLatestBMI() {
  const height = localStorage.getItem("latestHeight");
  const data = JSON.parse(localStorage.getItem("weights") || "[]");
  if (!height || data.length === 0) return;

  const latest = data[data.length - 1].weight;
  const bmi = (latest / ((height / 100) ** 2)).toFixed(1);

  const el = document.getElementById("latestBMI");
  if (el) el.textContent = "BMI: " + bmi;
}
function loadTodayCalorie() {
  const data = JSON.parse(localStorage.getItem("todayFoods") || "[]");
  let total = 0;

  data.forEach(item => total += Number(item.calorie));

  const el = document.getElementById("todayCalorie");
  if (el) el.textContent = "合計: " + total + " kcal";
}
function loadTodoDashboard() {
  const list = document.getElementById("todoListDashboard");
  if (!list) return;

  const data = JSON.parse(localStorage.getItem("todos") || "[]");
  list.innerHTML = "";

  data.forEach((item, index) => {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.done;
    // ★ ダッシュボードでもチェック可能にする
    checkbox.addEventListener("change", () => {
      data[index].done = checkbox.checked;
      localStorage.setItem("todos", JSON.stringify(data));
      loadTodoDashboard(); // 見た目更新
    });
    const span = document.createElement("span");
    span.textContent = item.text;

    if (item.done) {
      span.style.textDecoration = "line-through";
      span.style.opacity = "0.6";
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
function loadTodayFoodsDashboard() {
  const list = document.getElementById("foodListDashboard");
  if (!list) return;

  const data = JSON.parse(localStorage.getItem("todayFoods") || "[]");
  list.innerHTML = "";

  data.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name}：${item.calorie} kcal / ${item.protein} g`;
    list.appendChild(li);
  });
}
function loadMiniChart() {
  const data = JSON.parse(localStorage.getItem("weights") || "[]");
  const height = localStorage.getItem("latestHeight");

  if (!height || data.length === 0) return;

  const labels = data.map(d => d.date);
  const weights = data.map(d => d.weight);
  // ★ BMI の配列
  const bmis = data.map(d => {
    return (d.weight / ((height / 100) ** 2)).toFixed(1);
  });

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
        y: { beginAtZero: false },
        y1: { beginAtZero: false, position: "right" }
      }
    }
  });
}
// -------------------------
// index.html 読み込み時
// -------------------------
window.addEventListener("DOMContentLoaded", () => {
  loadLatestWeight();
  loadLatestBMI();
  loadTodayCalorie();
  loadTodoDashboard();
  loadPlanDashboard();
  loadMiniChart();
  loadTodayFoodsDashboard();
});

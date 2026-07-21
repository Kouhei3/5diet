/**
 * 5DIET – main-dashboard.js
 * アプリケーション共通ロジック（ダッシュボード・各入力画面統合版）
 */

// チャートのインスタンス保持用グローバル変数
let weightChartInstance = null;

// =====================================================
// 共通ユーティリティ関数
// =====================================================
/**
 * BMIの数値を計算して文字列で返す
 */
function calculateBMI(weight, height) {
  if (!weight || !height || height <= 0) return "0.0";
  return (weight / ((height / 100) ** 2)).toFixed(1);
}

// =====================================================
// 体重入力画面（health-weight.html）のロジック
// =====================================================
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

    const bmi = calculateBMI(weight, height);
    saveWeightToLocal(weight, bmi);

    const today = new Date().toLocaleDateString("ja-JP");
    localStorage.setItem("lastWeightDate", today);

    alert("保存しました");
    // 環境に合わせて適切なダッシュボードのパスに遷移させます
    location.href = "health-dashboard.html";
  });
}

function saveWeightToLocal(weight, bmi) {
  const today = new Date().toLocaleDateString("ja-JP");
  const data = JSON.parse(localStorage.getItem("weights") || "[]");
  data.push({ date: today, weight: weight, bmi: bmi });
  localStorage.setItem("weights", JSON.stringify(data));
}

/**
 * 体重入力画面用のフルサイズチャートを描画
 */
function updateChart() {
  const ctx = document.getElementById("weightChart");
  if (!ctx) return;

  const data = JSON.parse(localStorage.getItem("weights") || "[]");
  const height = localStorage.getItem("latestHeight");

  if (!height || data.length === 0) return;

  const labels = data.map(d => d.date);
  const weights = data.map(d => d.weight);
  const bmis = data.map(d => calculateBMI(d.weight, height));

  if (weightChartInstance) {
    weightChartInstance.destroy();
  }

  weightChartInstance = new Chart(ctx, {
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
      responsive: true,
      scales: {
        y: { beginAtZero: false },
        y1: { beginAtZero: false, position: "right" }
      }
    }
  });
}

// =====================================================
// 食事入力画面（health-food.html）のロジック
// =====================================================
const saveFoodBtn = document.getElementById("saveFoodBtn");
if (saveFoodBtn) {
  saveFoodBtn.addEventListener("click", () => {
    const name = document.getElementById("foodName").value.trim();
    const calorie = document.getElementById("calorie").value;
    const protein = document.getElementById("protein").value;

    if (!name || !calorie || !protein) {
      alert("食品名・カロリー・タンパク質を入力してね");
      return;
    }

    const foodData = {
      name: name,
      calorie: Number(calorie),
      protein: Number(protein)
    };

    const savedFoods = JSON.parse(localStorage.getItem("todayFoods") || "[]");
    savedFoods.push(foodData);
    localStorage.setItem("todayFoods", JSON.stringify(savedFoods));

    document.getElementById("foodName").value = "";
    document.getElementById("calorie").value = "";
    document.getElementById("protein").value = "";

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

// =====================================================
// ToDo 入力画面（health-todo.html）のロジック
// =====================================================
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
    li.style.display = "flex";
    li.style.alignItems = "center";
    li.style.gap = "8px";
    li.style.listStyle = "none";

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

    // チェックボックスの後にテキストを配置する元のUI順に統一
    li.appendChild(checkbox);
    li.appendChild(span);
    list.appendChild(li);
  });
}

// =====================================================
// スケジュール入力画面（health-schedule.html）のロジック
// =====================================================
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

// =====================================================
// ダッシュボード（health-dashboard.html）のロジック
// =====================================================
/**
 * アンケートで最初に入力した「初期体重」と「目標体重」をヘッダー等に表示
 */
function loadLatestWeightTopSurvey() {
  const surveyWeight = localStorage.getItem("surveyWeight");
  const surveyGoalWeight = localStorage.getItem("surveyGoalWeight");

  const weightEl = document.getElementById("latestWeightTop");
  const goalEl = document.getElementById("goalWeightTop");

  if (weightEl && surveyWeight) {
    weightEl.textContent = surveyWeight + " kg";
  }
  if (goalEl && surveyGoalWeight) {
    goalEl.textContent = surveyGoalWeight + " kg";
  }
}

/**
 * 毎日の記録から「最新の現在の体重」を表示
 */
function loadLatestWeight() {
  const data = JSON.parse(localStorage.getItem("weights") || "[]");
  const el = document.getElementById("latestWeight");
  if (!el) return;

  if (data.length === 0) {
    // 毎日記録がなければアンケートの数値をフォールバック表示
    const surveyWeight = localStorage.getItem("surveyWeight");
    el.textContent = "体重: " + (surveyWeight ? surveyWeight : "—") + " kg";
    return;
  }

  const latest = data[data.length - 1];
  el.textContent = "体重: " + latest.weight + " kg";
}

/**
 * 最新の現在のBMIを表示
 */
function loadLatestBMI() {
  const el = document.getElementById("latestBMI");
  if (!el) return;

  const height = localStorage.getItem("latestHeight") || localStorage.getItem("surveyHeight");
  const data = JSON.parse(localStorage.getItem("weights") || "[]");

  if (!height) {
    el.textContent = "BMI: —";
    return;
  }

  let currentWeight = 0;
  if (data.length > 0) {
    currentWeight = data[data.length - 1].weight;
  } else {
    currentWeight = parseFloat(localStorage.getItem("surveyWeight")) || 0;
  }

  if (currentWeight > 0) {
    el.textContent = "BMI: " + calculateBMI(currentWeight, height);
  } else {
    el.textContent = "BMI: —";
  }
}

/**
 * 今日の摂取カロリーとタンパク質の合計を表示
 */
function loadTodayCalorie() {
  const calEl = document.getElementById("todayCalorie");
  const proEl = document.getElementById("todayProtein");
  if (!calEl && !proEl) return;

  const data = JSON.parse(localStorage.getItem("todayFoods") || "[]");
  let totalCalorie = 0;
  let totalProtein = 0;

  data.forEach(item => {
    totalCalorie += Number(item.calorie || 0);
    totalProtein += Number(item.protein || 0);
  });

  if (calEl) calEl.textContent = "合計: " + totalCalorie + " kcal";
  if (proEl) proEl.textContent = "タンパク質: " + totalProtein + " g";
}

/**
 * ダッシュボード用の食事ミニリストを表示
 */
function loadTodayFoodsDashboard() {
  const list = document.getElementById("foodListDashboard");
  if (!list) return;

  const data = JSON.parse(localStorage.getItem("todayFoods") || "[]");
  list.innerHTML = "";

  data.forEach(item => {
    const li = document.createElement("li");
    li.style.marginBottom = "8px";

    const name = document.createElement("div");
    name.textContent = item.name;
    name.style.fontWeight = "bold";
    name.style.whiteSpace = "nowrap";

    const detail = document.createElement("div");
    detail.innerHTML = `カロリー：${item.calorie} kcal<br>タンパク質：${item.protein} g`;
    detail.style.fontSize = "14px";
    detail.style.opacity = "0.8";

    li.appendChild(name);
    li.appendChild(detail);
    list.appendChild(li);
  });
}

/**
 * ダッシュボード用のToDoミニリストを表示
 */
function loadTodoDashboard() {
  const list = document.getElementById("todoListDashboard");
  if (!list) return;

  const data = JSON.parse(localStorage.getItem("todos") || "[]");
  list.innerHTML = "";

  data.forEach((item, index) => {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.alignItems = "center";
    li.style.gap = "8px";
    li.style.listStyle = "none";
    li.style.marginBottom = "4px";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
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
      span.style.opacity = "0.6";
    }

    // チェックボックスとテキストの並び順を管理画面側と同期
    li.appendChild(checkbox);
    li.appendChild(span);
    list.appendChild(li);
  });
}

/**
 * ダッシュボード用のスケジュールミニリストを表示
 */
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

/**
 * ダッシュボード用のミニトレンドチャートを描画
 */
function loadMiniChart() {
  const ctx = document.getElementById("miniChart");
  if (!ctx) return;

  const data = JSON.parse(localStorage.getItem("weights") || "[]");
  const height = localStorage.getItem("latestHeight") || localStorage.getItem("surveyHeight");

  if (!height || data.length === 0) return;

  const labels = data.map(d => d.date);
  const weights = data.map(d => d.weight);
  const bmis = data.map(d => calculateBMI(d.weight, height));

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
      responsive: true,
      scales: {
        y: { beginAtZero: false },
        y1: { beginAtZero: false, position: "right" }
      }
    }
  });
}

// =====================================================
// 安全なイベント駆動による一元初期化（すべての画面に対応）
// =====================================================
window.addEventListener("DOMContentLoaded", () => {
  // ダッシュボード表示の初期化
  loadLatestWeightTopSurvey();
  loadLatestWeight();
  loadLatestBMI();
  loadTodayCalorie();
  loadTodayFoodsDashboard();
  loadTodoDashboard();
  loadPlanDashboard();
  loadMiniChart();

  // 体重管理ページのフルチャート初期化
  updateChart();

  // 食事入力ページの単体リスト更新
  updateFoodList();

  // ToDoページの単体リスト更新
  updateTodoList();

  // スケジュールページの単体リスト更新
  updatePlanList();
});
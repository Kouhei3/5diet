// ===============================
// 体重入力画面
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
    location.href = "http://localhost:8080/task/health-dashboard";
  });
}

function saveWeightToLocal(weight, bmi) {
  const today = new Date().toLocaleDateString("ja-JP");
  const data = JSON.parse(localStorage.getItem("weights") || "[]");
  data.push({ date: today, weight: weight, bmi: bmi });
  localStorage.setItem("weights", JSON.stringify(data));
}

// ===============================
// ToDo 入力画面
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
    location.href = "http://localhost:8080/task/health-dashboard";
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

    li.appendChild(span);
    li.appendChild(checkbox);
    list.appendChild(li);
  });
}

// ===============================
// ダッシュボード
// ===============================
function loadLatestWeight() {
  const data = JSON.parse(localStorage.getItem("weights") || "[]");
  if (data.length === 0) return;

  const latest = data[data.length - 1];
  const el = document.getElementById("latestWeight");
  if (el) el.textContent = latest.weight + " kg";
}

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

    // ★ updateTodoList() と同じ順番にする（決定打）
    li.appendChild(span);
    li.appendChild(checkbox);

    list.appendChild(li);
  });
}


function loadMiniChart() {
  const data = JSON.parse(localStorage.getItem("weights") || "[]");
  const height = localStorage.getItem("latestHeight");

  if (!height || data.length === 0) return;

  const labels = data.map(d => d.date);
  const weights = data.map(d => d.weight);
  const bmis = data.map(d => (d.weight / ((height / 100) ** 2)).toFixed(1));

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

// ===============================
// 初期化（DOMContentLoaded を使わない）
// ===============================

loadLatestWeightTopSurvey();
loadLatestWeight();
loadTodoDashboard();
loadMiniChart();

if (document.getElementById("todoList")) {
  updateTodoList();
}

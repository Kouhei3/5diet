/**
 * 5DIET – survey.js
 * 初回アンケートのロジック（マルチステップ対応）
 */

"use strict";

/* =====================================================
   DOM 参照
   ===================================================== */
const form = document.getElementById("surveyForm");
const steps = Array.from(form.querySelectorAll(".card[data-section]"));
const totalSteps = steps.length;

const heightInput = document.getElementById("height");
const weightInput = document.getElementById("weight");
const bmiValue = document.getElementById("bmiValue");
const bmiStatus = document.getElementById("bmiStatus");

const goalDateInput = document.getElementById("goalDate");
const daysBadge = document.getElementById("daysBadge");

const purposeSelect = document.getElementById("purpose");
const purposeOtherWrap = document.getElementById("purposeOtherWrap");
const purposeOtherInput = document.getElementById("purposeOther");

const progressBar = document.getElementById("progressBar");
const stepCurrentLabel = document.getElementById("stepCurrentLabel");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const submitNote = document.getElementById("submitNote");
const remainingCountEl = document.getElementById("remainingCount");

/* =====================================================
   ステップ状態
   ===================================================== */
let currentStep = 0;

/* =====================================================
   必須項目カウント
   ===================================================== */
function countRequiredInStep(stepEl) {
  const requiredEls = Array.from(stepEl.querySelectorAll("[required]")).filter(
    (el) => !el.closest(".hidden"),
  );
  const radioNames = new Set();
  let count = 0;
  requiredEls.forEach((el) => {
    if (el.type === "radio") {
      if (!radioNames.has(el.name)) {
        radioNames.add(el.name);
        count++;
      }
    } else {
      count++;
    }
  });
  return count;
}

function isFilledInStep(stepEl) {
  const requiredEls = Array.from(stepEl.querySelectorAll("[required]")).filter(
    (el) => !el.closest(".hidden"),
  );
  const radioNames = new Set();
  let filled = 0;
  requiredEls.forEach((el) => {
    if (el.type === "radio") {
      if (!radioNames.has(el.name)) {
        radioNames.add(el.name);
        if (form.querySelector(`[name="${el.name}"]:checked`)) filled++;
      }
    } else if (el.value.trim() !== "") {
      filled++;
    }
  });
  return filled;
}

/* =====================================================
   ステップ表示切替
   ===================================================== */
function showStep(index) {
  steps.forEach((step, i) => {
    step.classList.toggle("active", i === index);
  });

  stepCurrentLabel.textContent = `STEP ${index + 1} / ${totalSteps}`;

  const isFirst = index === 0;
  const isLast = index === totalSteps - 1;

  prevBtn.classList.toggle("invisible", isFirst);
  nextBtn.classList.toggle("hidden", isLast);
  submitBtn.classList.toggle("hidden", !isLast);
  submitNote.classList.toggle("hidden", !isLast);

  updateProgress();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =====================================================
   進捗バー更新
   ===================================================== */
function updateProgress() {
  let totalRequired = 0;
  let totalFilled = 0;

  steps.forEach((step) => {
    totalRequired += countRequiredInStep(step);
    totalFilled += isFilledInStep(step);
  });

  const pct =
    totalRequired > 0
      ? Math.min(100, Math.round((totalFilled / totalRequired) * 100))
      : 0;
  progressBar.style.width = pct + "%";

  const remaining = Math.max(0, totalRequired - totalFilled);
  if (remainingCountEl) {
    remainingCountEl.textContent = remaining;
  }
}

/* =====================================================
   BMI 計算
   ===================================================== */
function calcBMI() {
  const h = parseFloat(heightInput.value);
  const w = parseFloat(weightInput.value);

  if (!h || !w || h <= 0 || w <= 0) {
    bmiValue.textContent = "—";
    bmiStatus.textContent = "";
    bmiStatus.style.background = "rgba(255,255,255,0.15)";
    return;
  }

  const hm = h / 100;
  const bmi = w / (hm * hm);
  bmiValue.textContent = bmi.toFixed(1);

  let label = "";
  let bg = "rgba(255,255,255,0.15)";
  if (bmi < 18.5) {
    label = "低体重";
    bg = "rgba(100,160,255,0.35)";
  } else if (bmi < 25.0) {
    label = "標準";
    bg = "rgba(126,200,69,0.45)";
  } else if (bmi < 30.0) {
    label = "肥満（1度）";
    bg = "rgba(255,190,60,0.45)";
  } else if (bmi < 35.0) {
    label = "肥満（2度）";
    bg = "rgba(255,120,60,0.45)";
  } else {
    label = "肥満（3度）";
    bg = "rgba(214,59,59,0.5)";
  }

  bmiStatus.textContent = label;
  bmiStatus.style.background = bg;
}

heightInput.addEventListener("input", calcBMI);
weightInput.addEventListener("input", calcBMI);

/* =====================================================
   残り日数計算
   ===================================================== */
function calcDays() {
  const val = goalDateInput.value;
  if (!val) {
    daysBadge.textContent = "";
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(val);
  target.setHours(0, 0, 0, 0);

  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (diff < 0) {
    daysBadge.textContent = "過去の日付です";
    daysBadge.style.color = "#D63B3B";
    daysBadge.style.borderColor = "#D63B3B";
  } else {
    daysBadge.textContent = `残り ${diff} 日`;
    daysBadge.style.color = "";
    daysBadge.style.borderColor = "";
  }
}

goalDateInput.addEventListener("input", calcDays);

/* =====================================================
   「その他」表示切替
   ===================================================== */
purposeSelect.addEventListener("change", function () {
  if (this.value === "その他") {
    purposeOtherWrap.classList.remove("hidden");
    purposeOtherInput.required = true;
  } else {
    purposeOtherWrap.classList.add("hidden");
    purposeOtherInput.required = false;
    purposeOtherInput.value = "";
    clearError("purposeOther");
  }
  updateProgress();
});

/* =====================================================
   エラー処理
   ===================================================== */
function showError(id, msg) {
  const el = document.getElementById(`err-${id}`);
  if (el) el.textContent = msg;
  const input =
    document.getElementById(id) || form.querySelector(`[name="${id}"]`);
  if (input) input.classList.add("error");
}

function clearError(id) {
  const el = document.getElementById(`err-${id}`);
  if (el) el.textContent = "";
  const input =
    document.getElementById(id) || form.querySelector(`[name="${id}"]`);
  if (input) input.classList.remove("error");
}

function clearErrorsInStep(stepEl) {
  stepEl.querySelectorAll(".err-msg").forEach((el) => (el.textContent = ""));
  stepEl.querySelectorAll(".error").forEach((el) => el.classList.remove("error"));
}

/* =====================================================
   STEP バリデーション
   ===================================================== */
function validateStep(index) {
  const stepEl = steps[index];
  clearErrorsInStep(stepEl);
  let valid = true;

  if (stepEl.dataset.section === "1") {
    if (!form.querySelector('[name="gender"]:checked')) {
      showError("gender", "性別を選択してください。");
      valid = false;
    }
    const age = parseInt(document.getElementById("age").value, 10);
    if (!age || age < 10 || age > 100) {
      showError("age", "10〜100の範囲で年齢を入力してください。");
      valid = false;
    }
    const height = parseFloat(heightInput.value);
    if (!height || height < 100 || height > 250) {
      showError("height", "100〜250cmの範囲で身長を入力してください。");
      valid = false;
    }
    const weight = parseFloat(weightInput.value);
    if (!weight || weight < 20 || weight > 300) {
      showError("weight", "20〜300kgの範囲で体重を入力してください。");
      valid = false;
    }
    const goalWeight = parseFloat(document.getElementById("goalWeight").value);
    if (!goalWeight || goalWeight < 20 || goalWeight > 300) {
      showError("goalWeight", "20〜300kgの範囲で目標体重を入力してください。");
      valid = false;
    }
  }

  if (stepEl.dataset.section === "2") {
    const goalDate = goalDateInput.value;
    if (!goalDate) {
      showError("goalDate", "目標達成日を選択してください。");
      valid = false;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(goalDate);
      target.setHours(0, 0, 0, 0);
      if (target <= today) {
        showError("goalDate", "今日より未来の日付を選択してください。");
        valid = false;
      }
    }

    const purpose = document.getElementById("purpose").value;
    if (!purpose) {
      showError("purpose", "ダイエットの目的を選択してください。");
      valid = false;
    } else if (purpose === "その他") {
      const otherVal = purposeOtherInput.value.trim();
      if (!otherVal) {
        showError("purposeOther", "「その他」の詳細を入力してください。");
        valid = false;
      }
    }
  }

  if (stepEl.dataset.section === "3") {
    if (!document.getElementById("activityLevel").value) {
      showError("activityLevel", "活動レベルを選択してください。");
      valid = false;
    }
    if (!document.getElementById("jobType").value) {
      showError("jobType", "仕事の種類を選択してください。");
      valid = false;
    }
  }

  if (stepEl.dataset.section === "4") {
    if (!document.getElementById("dietExp").value) {
      showError("dietExp", "食事管理経験を選択してください。");
      valid = false;
    }
    if (!document.getElementById("mealStyle").value) {
      showError("mealStyle", "食事スタイルを選択してください。");
      valid = false;
    }
  }

  return valid;
}

/* =====================================================
   次へ
   ===================================================== */
nextBtn.addEventListener("click", function () {
  if (!validateStep(currentStep)) {
    const firstErr = steps[currentStep].querySelector(".error");
    if (firstErr) {
      firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  if (currentStep < totalSteps - 1) {
    currentStep++;
    showStep(currentStep);
  }
});

/* =====================================================
   戻る
   ===================================================== */
prevBtn.addEventListener("click", function () {
  if (currentStep > 0) {
    currentStep--;
    showStep(currentStep);
  }
});

/* =====================================================
   フォーム送信（修正版）
   ===================================================== */
form.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!validateStep(currentStep)) {
    const firstErr = steps[currentStep].querySelector(".error");
    if (firstErr) {
      firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  const h = parseFloat(heightInput.value);
  const w = parseFloat(weightInput.value);
  const hm = h / 100;
  const bmi = (w / (hm * hm)).toFixed(1);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(goalDateInput.value);
  target.setHours(0, 0, 0, 0);
  const remainDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

  const surveyData = {
    gender: form.querySelector('[name="gender"]:checked').value,
    age: document.getElementById("age").value,
    height: h,
    weight: w,
    bmi: bmi,
    goalWeight: document.getElementById("goalWeight").value,
    goalDate: goalDateInput.value,
    remainDays: remainDays,
    purpose: document.getElementById("purpose").value,
    purposeOther: purposeOtherInput.value.trim() || null,
    activityLevel: document.getElementById("activityLevel").value,
    jobType: document.getElementById("jobType").value,
    dietExp: document.getElementById("dietExp").value,
    mealStyle: document.getElementById("mealStyle").value,
    allergy: document.getElementById("allergy").value.trim() || null,
  };

  fetch("/api/survey", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(surveyData),
  })
    .then((res) => {
      if (!res.ok) throw new Error("送信に失敗しました");
      return res.json();
    })
    .then((data) => {
      // ★ アンケート体重を専用キーで保存（今日の体重と区別する）
      localStorage.setItem("surveyHeight", surveyData.height);
      localStorage.setItem("surveyWeight", surveyData.weight);
      localStorage.setItem("surveyGoalWeight", surveyData.goalWeight);

      // ダッシュボードへ遷移
      window.location.href = "/task/health-dashboard";
    })
    .catch((err) => {
      alert("エラーが発生しました: " + err.message);
    });
});


/* =====================================================
   リアルタイムエラー解除
   ===================================================== */
form.querySelectorAll("input, select, textarea").forEach((el) => {
  el.addEventListener("input", () => {
    clearError(el.id || el.name);
    updateProgress();
  });
  el.addEventListener("change", () => {
    clearError(el.id || el.name);
    updateProgress();
  });
});

/* =====================================================
   初期化
   ===================================================== */
showStep(currentStep);

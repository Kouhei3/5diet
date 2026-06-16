/**
 * 5DIET – survey.js
 * 初回アンケートのロジック
 * ・BMI リアルタイム計算
 * ・残り日数リアルタイム更新
 * ・「その他」選択時のテキストエリア表示
 * ・バリデーション & 送信処理
 */

"use strict";

/* =====================================================
   DOM 参照
   ===================================================== */
const form = document.getElementById("surveyForm");

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

/* =====================================================
   BMI 計算
   ===================================================== */
function calcBMI() {
  const h = parseFloat(heightInput.value); // cm
  const w = parseFloat(weightInput.value); // kg

  if (!h || !w || h <= 0 || w <= 0) {
    bmiValue.textContent = "—";
    bmiStatus.textContent = "";
    bmiStatus.style.background = "rgba(255,255,255,0.15)";
    return;
  }

  const hm = h / 100; // m に変換
  const bmi = w / (hm * hm);
  bmiValue.textContent = bmi.toFixed(1);

  // BMI 判定
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

// 今日以前の日付を最小値として設定
(function setMinDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate() + 1).padStart(2, "0"); // 明日以降
  goalDateInput.min = `${yyyy}-${mm}-${dd}`;
})();

/* =====================================================
   「その他」テキストエリアの条件表示
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
});

/* =====================================================
   プログレスバー更新
   ===================================================== */
function updateProgress() {
  const required = form.querySelectorAll("[required]");
  let filled = 0;

  required.forEach((el) => {
    if (el.type === "radio") {
      const checked = form.querySelector(`[name="${el.name}"]:checked`);
      if (checked) filled++;
    } else if (el.value.trim() !== "") {
      filled++;
    }
  });

  // ラジオは name ごとに1つ分だけカウント
  const radioNames = [
    ...new Set(
      [...form.querySelectorAll('input[type="radio"][required]')].map(
        (r) => r.name,
      ),
    ),
  ];
  const otherRequiredCount =
    required.length -
    form.querySelectorAll('input[type="radio"][required]').length;
  const totalCount = otherRequiredCount + radioNames.length;

  // ラジオ分再計算
  let filledCount = 0;
  radioNames.forEach((name) => {
    if (form.querySelector(`[name="${name}"]:checked`)) filledCount++;
  });
  form.querySelectorAll('[required]:not([type="radio"])').forEach((el) => {
    if (el.value.trim() !== "" && !el.closest(".hidden")) filledCount++;
  });

  const pct =
    totalCount > 0
      ? Math.min(100, Math.round((filledCount / totalCount) * 100))
      : 0;
  progressBar.style.width = pct + "%";
}

form.addEventListener("input", updateProgress);
form.addEventListener("change", updateProgress);

/* =====================================================
   バリデーション ユーティリティ
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

function clearAllErrors() {
  form.querySelectorAll(".err-msg").forEach((el) => (el.textContent = ""));
  form.querySelectorAll(".error").forEach((el) => el.classList.remove("error"));
}

/* =====================================================
   フォームバリデーション
   ===================================================== */
function validateForm() {
  clearAllErrors();
  let valid = true;

  // 性別
  if (!form.querySelector('[name="gender"]:checked')) {
    showError("gender", "性別を選択してください。");
    valid = false;
  }

  // 年齢
  const age = parseInt(document.getElementById("age").value, 10);
  if (!age || age < 10 || age > 100) {
    showError("age", "10〜100の範囲で年齢を入力してください。");
    valid = false;
  }

  // 身長
  const height = parseFloat(heightInput.value);
  if (!height || height < 100 || height > 250) {
    showError("height", "100〜250cmの範囲で身長を入力してください。");
    valid = false;
  }

  // 体重
  const weight = parseFloat(weightInput.value);
  if (!weight || weight < 20 || weight > 300) {
    showError("weight", "20〜300kgの範囲で体重を入力してください。");
    valid = false;
  }

  // 目標体重
  const goalWeight = parseFloat(document.getElementById("goalWeight").value);
  if (!goalWeight || goalWeight < 20 || goalWeight > 300) {
    showError("goalWeight", "20〜300kgの範囲で目標体重を入力してください。");
    valid = false;
  }

  // 目標達成日
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

  // ダイエットの目的
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

  // 活動レベル
  if (!document.getElementById("activityLevel").value) {
    showError("activityLevel", "活動レベルを選択してください。");
    valid = false;
  }

  // 仕事の種類
  if (!document.getElementById("jobType").value) {
    showError("jobType", "仕事の種類を選択してください。");
    valid = false;
  }

  // 食事管理経験
  if (!document.getElementById("dietExp").value) {
    showError("dietExp", "食事管理経験を選択してください。");
    valid = false;
  }

  // 食事スタイル
  if (!document.getElementById("mealStyle").value) {
    showError("mealStyle", "食事スタイルを選択してください。");
    valid = false;
  }

  return valid;
}

/* =====================================================
   フォーム送信
   ===================================================== */
form.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!validateForm()) {
    // 最初のエラーにスクロール
    const firstErr = form.querySelector(".error, .err-msg:not(:empty)");
    if (firstErr) {
      firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  // ===== データ収集 =====
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

  console.log("[5DIET] Survey submitted:", surveyData);

  /* ===== バックエンドへ送信（Java Servlet / REST API） =====
   * 例: fetch('/api/survey', { method:'POST', headers:{'Content-Type':'application/json'},
   *                             body: JSON.stringify(surveyData) })
   *       .then(r => r.json()).then(d => window.location.href = '/home.html');
   */

  // 送信完了 UI（デモ）
  showSuccess(surveyData);
});

/* =====================================================
   送信完了表示（デモ用）
   ===================================================== */
function showSuccess(data) {
  const main = document.querySelector(".survey-main");
  main.innerHTML = `
    <div class="card" style="text-align:center;padding:48px 24px;">
      <div style="font-size:3.5rem;margin-bottom:16px;">🎉</div>
      <div class="section-tag" style="margin-bottom:12px;">COMPLETE</div>
      <h2 class="section-title" style="border:none;margin-bottom:8px;">
        アンケートありがとうございます！
      </h2>
      <p style="color:var(--text-sub);font-size:0.9rem;margin-bottom:28px;">
        あなたのプロフィールをもとに<br>パーソナライズされたプランを作成します。
      </p>

      <div style="
        background:var(--bg);border-radius:12px;padding:20px 24px;
        text-align:left;display:inline-block;min-width:260px;
        font-size:0.88rem;line-height:2;
      ">
        <div><b>性別</b>：${data.gender === "male" ? "男性" : "女性"}</div>
        <div><b>年齢</b>：${data.age} 歳</div>
        <div><b>身長</b>：${data.height} cm</div>
        <div><b>体重</b>：${data.weight} kg</div>
        <div><b>BMI</b>：${data.bmi}</div>
        <div><b>目標体重</b>：${data.goalWeight} kg</div>
        <div><b>目標達成日</b>：${data.goalDate}（残り ${data.remainDays} 日）</div>
        <div><b>目的</b>：${data.purpose}${data.purposeOther ? "（" + data.purposeOther + "）" : ""}</div>
        <div><b>活動レベル</b>：${data.activityLevel}</div>
        <div><b>仕事の種類</b>：${data.jobType}</div>
        <div><b>食事管理経験</b>：${data.dietExp}</div>
        <div><b>食事スタイル</b>：${data.mealStyle}</div>
        ${data.allergy ? `<div><b>アレルギー</b>：${data.allergy}</div>` : ""}
      </div>

      <div style="margin-top:32px;">
        <a href="survey.html" style="
          display:inline-block;padding:12px 32px;
          background:var(--primary);color:#fff;border-radius:99px;
          font-weight:700;text-decoration:none;font-size:0.9rem;
        ">もう一度記入する</a>
      </div>
    </div>
  `;

  progressBar.style.width = "100%";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =====================================================
   リアルタイムエラー解除（UX改善）
   ===================================================== */
form.querySelectorAll("input, select, textarea").forEach((el) => {
  el.addEventListener("input", () => clearError(el.id || el.name));
  el.addEventListener("change", () => clearError(el.id || el.name));
});

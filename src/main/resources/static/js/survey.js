/**
 * 5DIET – survey.js
 * 初回アンケートのロジック（ステップ連動・決定版）
 */

document.addEventListener("DOMContentLoaded", function () {
  let currentStep = 1;
  const totalSteps = 4;

  // DOM要素の取得
  const cards = document.querySelectorAll(".card");
  const progressBar = document.getElementById("progressBar");
  const stepCurrentText = document.getElementById("stepCurrent");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");
  const submitNote = document.getElementById("submitNote");
  const navRemaining = document.getElementById("navRemaining");
  const goalDateInput = document.getElementById("goalDate");

  const purposeSelect = document.getElementById("purpose");
  const purposeOtherWrap = document.getElementById("purposeOtherWrap");
  const purposeOtherInput = document.getElementById("purposeOther");

  // デフォルトの目標達成日（3ヶ月後）を自動設定
  if (goalDateInput) {
    const today = new Date();
    today.setMonth(today.getMonth() + 3);
    goalDateInput.value = today.toISOString().split('T')[0];
  }

  // 「その他」入力欄の初期制御
  if (purposeSelect && purposeOtherWrap) {
    togglePurposeOther();
    purposeSelect.addEventListener("change", togglePurposeOther);
  }

  function togglePurposeOther() {
    if (purposeSelect.value === "その他") {
      purposeOtherWrap.style.display = "block";
      if (purposeOtherInput) purposeOtherInput.required = true;
    } else {
      purposeOtherWrap.style.display = "none";
      if (purposeOtherInput) {
        purposeOtherInput.required = false;
        purposeOtherInput.value = "";
      }
    }
  }

  // ステップ表示の更新関数（survey.cssのアニメーションと進捗バーを連動）
  function updateStepDisplay() {
    cards.forEach((card) => {
      if (parseInt(card.getAttribute("data-section")) === currentStep) {
        card.classList.add("active");
      } else {
        card.classList.remove("active");
      }
    });

    // プログレスバーの進捗率を計算（ステップ数ベース）
    if (progressBar) {
      const progressPercent = (currentStep / totalSteps) * 100;
      progressBar.style.width = `${progressPercent}%`;
    }

    // インジケーターテキスト更新
    if (stepCurrentText) {
      stepCurrentText.innerText = `STEP ${currentStep} / ${totalSteps}`;
    }

    // 下部固定ナビのコントロール表示切り替え
    if (currentStep === 1) {
      prevBtn.classList.add("invisible");
    } else {
      prevBtn.classList.remove("invisible");
    }

    if (currentStep === totalSteps) {
      nextBtn.classList.add("hidden");
      submitBtn.classList.remove("hidden");
      if (submitNote) submitNote.classList.remove("hidden");
      navRemaining.classList.add("hidden");
    } else {
      nextBtn.classList.remove("hidden");
      submitBtn.classList.add("hidden");
      if (submitNote) submitNote.classList.add("hidden");
      navRemaining.classList.remove("hidden");
      
      const remainingSpan = navRemaining.querySelector("span");
      if (remainingSpan) {
        remainingSpan.innerText = totalSteps - currentStep;
      }
    }

    // STEP2に遷移したタイミングでBMIをリアルタイム計算して表示
    if (currentStep === 2) {
      calculateAndDisplayBMI();
    }
  }

  // BMI計算ロジック
  function calculateAndDisplayBMI() {
    const heightCm = parseFloat(document.getElementById("height").value);
    const weightKg = parseFloat(document.getElementById("weight").value);
    const bmiValueSpan = document.getElementById("bmiValue");
    const bmiStatusSpan = document.getElementById("bmiStatus");

    if (heightCm > 0 && weightKg > 0 && bmiValueSpan && bmiStatusSpan) {
      const heightM = heightCm / 100.0;
      const bmi = weightKg / (heightM * heightM);
      bmiValueSpan.innerText = bmi.toFixed(1);

      if (bmi < 18.5) {
        bmiStatusSpan.innerText = "低体重";
        bmiStatusSpan.style.background = "rgba(33, 150, 243, 0.2)";
      } else if (bmi < 25) {
        bmiStatusSpan.innerText = "普通体重";
        bmiStatusSpan.style.background = "rgba(76, 175, 80, 0.2)";
      } else {
        bmiStatusSpan.innerText = "肥満";
        bmiStatusSpan.style.background = "rgba(244, 67, 54, 0.2)";
      }
    }
  }

  // 「次へ」ボタンイベント
  nextBtn.addEventListener("click", function () {
    if (currentStep < totalSteps) {
      currentStep++;
      updateStepDisplay();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // 「戻る」ボタンイベント
  prevBtn.addEventListener("click", function () {
    if (currentStep > 1) {
      currentStep--;
      updateStepDisplay();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // 初回起動時のUIセット
  updateStepDisplay();

  // 最終サブミット（API連携）
  const form = document.getElementById("surveyForm");
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const h = parseFloat(document.getElementById("height").value);
    const w = parseFloat(document.getElementById("weight").value);
    const gDate = goalDateInput.value;
    const remainDays = Math.max(1, Math.round((new Date(gDate) - new Date()) / (1000 * 60 * 60 * 24)));

    const surveyData = {
      gender: form.querySelector('[name="gender"]:checked').value,
      age: parseInt(document.getElementById("age").value) || 0,
      height: h,
      weight: w,
      goalWeight: parseFloat(document.getElementById("goalWeight").value) || 0,
      goalDate: gDate,
      remainDays: remainDays,
      purpose: document.getElementById("purpose").value,
      purposeOther: document.getElementById("purposeOther") ? document.getElementById("purposeOther").value.trim() || null : null,
      activityLevel: document.getElementById("activityLevel").value,
      jobType: document.getElementById("jobType").value.trim() || null,
      dietExp: document.getElementById("dietExp").value,
      mealStyle: document.getElementById("mealStyle").value.trim() || null,
      allergy: document.getElementById("allergy").value.trim() || null,
    };

    fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyData)
    })
    .then(response => {
        if (response.ok) {
            // ローカルストレージへの保存（ダッシュボード等での利用を想定）
            localStorage.setItem("surveyHeight", surveyData.height);
            localStorage.setItem("surveyWeight", surveyData.weight);
            localStorage.setItem("surveyGoalWeight", surveyData.goalWeight);

            alert("初回診断データの保存が完了しました！ログイン画面へ移動します。");
            window.location.href = '/login.html';
        } else {
            alert("データの保存に失敗しました。セッション切れの可能性があるため新規登録からやり直してください。");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("サーバー通信エラーが発生しました。");
    });
  });
});
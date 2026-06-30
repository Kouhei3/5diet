const userId = 1;
const targetCalories = 1800;
const MEAL_STORAGE_KEY = "mealRecordsLocal";

let allFoods = [];

window.onload = () => {
  loadFoods();
  loadTodayMeals();
  loadMealHistory();
};


async function loadFoods() {
  // 一時的にサーバー通信をスキップし、ローカルのDEFAULT_FOODSを直接セットする
  if (typeof DEFAULT_FOODS !== "undefined") {
    allFoods = DEFAULT_FOODS;
  } else {
    // 万が一上の変数が見つからない場合の予備データ
    allFoods = [
      { id: 1, food_name: '鶏むね肉', calorie_per_100g: 108, protein_per_100g: 23.3, fat_per_100g: 1.9, carbohydrate_per_100g: 0 },
      { id: 4, food_name: '白米', calorie_per_100g: 156, protein_per_100g: 2.5, fat_per_100g: 0.3, carbohydrate_per_100g: 37.1 },
      { id: 5, food_name: '卵', calorie_per_100g: 151, protein_per_100g: 12.3, fat_per_100g: 10.3, carbohydrate_per_100g: 0.3 }
    ];
  }
  showFoods(allFoods);
}

/*async function loadFoods() {
  try {
    const response = await fetch("/foods", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`食品取得失敗: ${response.status}`);
    }

    const foods = await response.json();
    allFoods = Array.isArray(foods) && foods.length > 0 ? foods : [];
  } catch (error) {
    console.warn("食品データ取得に失敗したため、初期データを使用します。", error);
    allFoods = typeof window !== "undefined" && typeof window.getDefaultFoods === "function"
      ? window.getDefaultFoods()
      : [];
  }

  showFoods(allFoods);
}*/

function showFoods(foods) {
  const select = document.getElementById("foodSelect");
  select.innerHTML = "";

  if (foods.length === 0) {
    const option = document.createElement("option");
    option.textContent = "該当する食品がありません";
    option.value = "";
    select.appendChild(option);
    return;
  }

  foods.forEach(food => {
    const option = document.createElement("option");
    option.value = food.id;
    option.textContent = `${food.food_name}（${food.calorie_per_100g}kcal / 100g）`;
    select.appendChild(option);
  });
}

function filterFoods() {
  const keyword = document.getElementById("searchFood").value.trim();

  if (keyword === "") {
    showFoods(allFoods);
    return;
  }

  const filteredFoods = typeof window !== "undefined" && typeof window.filterFoodsByKeyword === "function"
    ? window.filterFoodsByKeyword(allFoods, keyword)
    : allFoods.filter(food => food.food_name.includes(keyword));

  showFoods(filteredFoods);
}

async function addMeal() {
  const foodId = document.getElementById("foodSelect").value;
  const amount = Number(document.getElementById("amount").value);
  const mealType = document.getElementById("mealType").value;

  if (!foodId) {
    alert("食品を選択してください");
    return;
  }

  if (!amount || amount <= 0) {
    alert("食べた量を入力してください");
    return;
  }

  try {
    const response = await fetch("/meals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: userId,
        food_id: foodId,
        amount_g: amount,
        meal_type: mealType
      })
    });

    let result = {};
    try {
      result = await response.json();
    } catch (e) {
      result = { message: "" };
    }

    if (!response.ok) {
      saveMealLocally(foodId, amount, mealType);
      alert(result.message || "記録しました（ローカル保存）");
    } else {
      document.getElementById("amount").value = "";
      alert(result.message || "記録しました");
    }

    await loadTodayMeals();
    await loadMealHistory();
  } catch (error) {
    console.error(error);
    alert("通信に失敗しました。サーバーが起動しているか確認してください。");
  }
}

function saveMealLocally(foodId, amount, mealType) {
  const records = JSON.parse(localStorage.getItem(MEAL_STORAGE_KEY) || "[]");
  const food = allFoods.find(item => String(item.id) === String(foodId)) || { food_name: "食品" };

  records.push({
    id: Date.now(),
    food_id: foodId,
    food_name: food.food_name || "食品",
    amount_g: amount,
    meal_type: mealType,
    calorie: Number(food.calorie_per_100g || 0) * Number(amount || 0) / 100,
    protein: Number(food.protein_per_100g || 0) * Number(amount || 0) / 100,
    fat: Number(food.fat_per_100g || 0) * Number(amount || 0) / 100,
    carbohydrate: Number(food.carbohydrate_per_100g || 0) * Number(amount || 0) / 100,
    record_date: new Date().toISOString()
  });

  localStorage.setItem(MEAL_STORAGE_KEY, JSON.stringify(records));
}

function getLocalMealRecords() {
  return JSON.parse(localStorage.getItem(MEAL_STORAGE_KEY) || "[]");
}

async function loadTodayMeals() {
  try {
    const response = await fetch(`/meals/today/${userId}`);
    const data = await response.json();

    const totalCalorie = Number(data.total_calorie || 0);
    const protein = Number(data.total_protein || 0);
    const fat = Number(data.total_fat || 0);
    const carbs = Number(data.total_carbohydrate || 0);

    document.getElementById("totalCalorie").textContent = totalCalorie;
    document.getElementById("protein").textContent = protein;
    document.getElementById("fat").textContent = fat;
    document.getElementById("carbs").textContent = carbs;

    document.getElementById("targetCalorie").textContent = targetCalories;
    document.getElementById("remainingCalorie").textContent =
      Math.max(targetCalories - totalCalorie, 0).toFixed(1);

    calcPFCRatio(protein, fat, carbs);
  } catch (error) {
    console.error(error);
    const localRecords = getLocalMealRecords();
    const totalCalorie = localRecords.reduce((sum, item) => sum + Number(item.calorie || 0), 0);
    const protein = localRecords.reduce((sum, item) => sum + Number(item.protein || 0), 0);
    const fat = localRecords.reduce((sum, item) => sum + Number(item.fat || 0), 0);
    const carbs = localRecords.reduce((sum, item) => sum + Number(item.carbohydrate || 0), 0);

    document.getElementById("totalCalorie").textContent = totalCalorie.toFixed(1);
    document.getElementById("protein").textContent = protein.toFixed(1);
    document.getElementById("fat").textContent = fat.toFixed(1);
    document.getElementById("carbs").textContent = carbs.toFixed(1);

    document.getElementById("targetCalorie").textContent = targetCalories;
    document.getElementById("remainingCalorie").textContent =
      Math.max(targetCalories - totalCalorie, 0).toFixed(1);

    calcPFCRatio(protein, fat, carbs);
  }
}

function calcPFCRatio(protein, fat, carbs) {
  const pCal = protein * 4;
  const fCal = fat * 9;
  const cCal = carbs * 4;

  const total = pCal + fCal + cCal;

  if (total === 0) {
    document.getElementById("proteinRatio").textContent = 0;
    document.getElementById("fatRatio").textContent = 0;
    document.getElementById("carbsRatio").textContent = 0;
    return;
  }

  document.getElementById("proteinRatio").textContent =
    ((pCal / total) * 100).toFixed(1);

  document.getElementById("fatRatio").textContent =
    ((fCal / total) * 100).toFixed(1);

  document.getElementById("carbsRatio").textContent =
    ((cCal / total) * 100).toFixed(1);
}

async function loadMealHistory() {
  let meals = [];
  try {
    // 1. まずサーバー（AWSやローカルサーバー）から食事履歴の取得を試みる
    const response = await fetch(`/meals/history/${userId}`);
    if (response.ok) {
      meals = await response.json();
    }
  } catch (error) {
    // 💡 サーバーが動いていなくても、警告を出すだけで処理を止めないようにします
    console.warn("サーバー未起動のため、ローカルデータのみでテストします。", error);
  }

  // 2. 画面のリスト要素（ul）を取得して一旦クリアする
  const list = document.getElementById("mealHistory");
  if (!list) return;
  list.innerHTML = "";

  // 3. ローカル（localStorage）のデータと、サーバーのデータを合体させる
  const localRecords = getLocalMealRecords();
  const combinedMeals = [...localRecords, ...meals];

  // 4. 履歴が1件もない場合はメッセージを表示して終了
  if (combinedMeals.length === 0) {
    list.innerHTML = "<li>まだ記録がありません</li>";
    return;
  }

  // 5. 画面に食事履歴を1件ずつ描画する
  combinedMeals.forEach(meal => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div>
        <strong>${meal.food_name || "食品"}</strong>
        <p>${meal.meal_type || "食事"} / ${meal.amount_g || 0}g / ${Number(meal.calorie || 0).toFixed(1)}kcal</p>
        <small>
          P:${Number(meal.protein || 0).toFixed(1)}g 
          F:${Number(meal.fat || 0).toFixed(1)}g 
          C:${Number(meal.carbohydrate || 0).toFixed(1)}g
        </small>
      </div>
      <button class="delete-btn" onclick="deleteMeal(${meal.id})">削除</button>
    `;

    list.appendChild(li);
  }); 
  // 👈 forEach の閉じカッコ。関数の末尾にはこれ以上の catch は不要です！
}
async function deleteMeal(id) {
  const result = confirm("この食事記録を削除しますか？");

  if (!result) {
    return;
  }

  await fetch(`/meals/${id}`, {
    method: "DELETE"
  });

  loadTodayMeals();
  loadMealHistory();
}
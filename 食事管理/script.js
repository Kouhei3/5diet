const userId = 1;
const targetCalories = 1800;

let allFoods = [];

window.onload = () => {
  loadFoods();
  loadTodayMeals();
  loadMealHistory();
};

async function loadFoods() {
  const response = await fetch("/foods");
  const foods = await response.json();

  allFoods = foods;

  showFoods(allFoods);
}

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

  const filteredFoods = allFoods.filter(food =>
    food.food_name.includes(keyword)
  );

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

  const result = await response.json();

  if (!response.ok) {
    alert(result.message);
    return;
  }

  document.getElementById("amount").value = "";

  loadTodayMeals();
  loadMealHistory();
}

async function loadTodayMeals() {
  const response = await fetch(`/meals/today/${userId}`);
  const data = await response.json();

  const totalCalorie = Number(data.total_calorie);
  const protein = Number(data.total_protein);
  const fat = Number(data.total_fat);
  const carbs = Number(data.total_carbohydrate);

  document.getElementById("totalCalorie").textContent = totalCalorie;
  document.getElementById("protein").textContent = protein;
  document.getElementById("fat").textContent = fat;
  document.getElementById("carbs").textContent = carbs;

  document.getElementById("targetCalorie").textContent = targetCalories;
  document.getElementById("remainingCalorie").textContent =
    Math.max(targetCalories - totalCalorie, 0).toFixed(1);

  calcPFCRatio(protein, fat, carbs);
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
  const response = await fetch(`/meals/history/${userId}`);
  const meals = await response.json();

  const list = document.getElementById("mealHistory");
  list.innerHTML = "";

  if (meals.length === 0) {
    list.innerHTML = "<li>まだ記録がありません</li>";
    return;
  }

  meals.forEach(meal => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div>
        <strong>${meal.food_name}</strong>
        <p>${meal.meal_type} / ${meal.amount_g}g / ${meal.calorie}kcal</p>
        <small>
          P:${meal.protein}g　
          F:${meal.fat}g　
          C:${meal.carbohydrate}g
        </small>
      </div>
      <button class="delete-btn" onclick="deleteMeal(${meal.id})">削除</button>
    `;

    list.appendChild(li);
  });
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
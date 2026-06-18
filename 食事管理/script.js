const userId = 1;

window.onload = () => {

  loadFoods();
  loadTodayMeals();

};

async function loadFoods() {

  const response =
    await fetch("/foods");

  const foods =
    await response.json();

  const select =
    document.getElementById("foodSelect");

  select.innerHTML = "";

  foods.forEach(food => {

    const option =
      document.createElement("option");

    option.value = food.id;

    option.textContent =
      `${food.food_name}（${food.calorie_per_100g}kcal / 100g）`;

    select.appendChild(option);

  });

}

async function addMeal() {

  const foodId =
    document.getElementById("foodSelect").value;

  const amount =
    Number(document.getElementById("amount").value);

  const mealType =
    document.getElementById("mealType").value;

  if (!amount || amount <= 0) {

    alert("食べた量を入力してください");

    return;

  }

  const response =
    await fetch("/meals", {

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

  const result =
    await response.json();

  if (!response.ok) {

    alert(result.message);

    return;

  }

  document.getElementById("amount").value = "";

  loadTodayMeals();

}

async function loadTodayMeals() {

  const response =
    await fetch(`/meals/today/${userId}`);

  const data =
    await response.json();

  document.getElementById("totalCalorie").textContent =
    data.total_calorie;

  document.getElementById("protein").textContent =
    data.total_protein;

  document.getElementById("fat").textContent =
    data.total_fat;

  document.getElementById("carbs").textContent =
    data.total_carbohydrate;

}
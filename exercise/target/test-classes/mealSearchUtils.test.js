const assert = require('assert');
const { filterFoodsByKeyword, getDefaultFoods } = require('../../main/resources/static/mealSearchUtils.js');

const foods = [
  { id: 1, food_name: '鶏むね肉', protein_per_100g: 23.3, carbohydrate_per_100g: 0 },
  { id: 2, food_name: '鶏もも肉', protein_per_100g: 16.6, carbohydrate_per_100g: 0 },
  { id: 3, food_name: '白米', protein_per_100g: 2.5, carbohydrate_per_100g: 37.1 },
  { id: 4, food_name: 'ブロッコリー', protein_per_100g: 4.3, carbohydrate_per_100g: 6.6 }
];

const chickenResults = filterFoodsByKeyword(foods, '鶏肉');
assert.ok(chickenResults.some((food) => food.food_name.includes('鶏')),
  '鶏肉検索で鶏系食品を返すこと');

const proteinResults = filterFoodsByKeyword(foods, 'タンパク質');
assert.ok(proteinResults.some((food) => food.food_name.includes('鶏')),
  'タンパク質検索で高たんぱく食品を返すこと');

const defaultFoods = getDefaultFoods();
assert.ok(defaultFoods.some((food) => food.food_name === '鶏むね肉'),
  'フォールバック食品データに鶏むね肉が含まれること');

console.log('mealSearchUtils tests passed');

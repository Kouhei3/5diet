const DEFAULT_FOODS = [
  { id: 1, food_name: '鶏むね肉', calorie_per_100g: 108, protein_per_100g: 23.3, fat_per_100g: 1.9, carbohydrate_per_100g: 0 },
  { id: 2, food_name: '鶏もも肉', calorie_per_100g: 190, protein_per_100g: 16.6, fat_per_100g: 14.2, carbohydrate_per_100g: 0 },
  { id: 3, food_name: 'サラダチキン', calorie_per_100g: 115, protein_per_100g: 24.0, fat_per_100g: 1.5, carbohydrate_per_100g: 0 },
  { id: 4, food_name: '白米', calorie_per_100g: 156, protein_per_100g: 2.5, fat_per_100g: 0.3, carbohydrate_per_100g: 37.1 },
  { id: 5, food_name: '卵', calorie_per_100g: 151, protein_per_100g: 12.3, fat_per_100g: 10.3, carbohydrate_per_100g: 0.3 },
  { id: 6, food_name: '鮭', calorie_per_100g: 124, protein_per_100g: 22.3, fat_per_100g: 4.1, carbohydrate_per_100g: 0.1 },
  { id: 7, food_name: 'まぐろ赤身', calorie_per_100g: 115, protein_per_100g: 26.4, fat_per_100g: 1.4, carbohydrate_per_100g: 0.1 },
  { id: 8, food_name: '豆腐', calorie_per_100g: 56, protein_per_100g: 5.3, fat_per_100g: 3.5, carbohydrate_per_100g: 2.0 },
  { id: 9, food_name: '納豆', calorie_per_100g: 190, protein_per_100g: 16.5, fat_per_100g: 10.0, carbohydrate_per_100g: 12.1 },
  { id: 10, food_name: 'ブロッコリー', calorie_per_100g: 37, protein_per_100g: 4.3, fat_per_100g: 0.5, carbohydrate_per_100g: 6.6 },
  { id: 11, food_name: 'レタス', calorie_per_100g: 12, protein_per_100g: 0.6, fat_per_100g: 0.1, carbohydrate_per_100g: 2.8 },
  { id: 12, food_name: 'トマト', calorie_per_100g: 20, protein_per_100g: 0.7, fat_per_100g: 0.1, carbohydrate_per_100g: 4.7 },
  { id: 13, food_name: '豚ロース', calorie_per_100g: 263, protein_per_100g: 19.3, fat_per_100g: 19.2, carbohydrate_per_100g: 0.2 },
  { id: 14, food_name: '牛もも肉', calorie_per_100g: 176, protein_per_100g: 21.2, fat_per_100g: 9.6, carbohydrate_per_100g: 0.5 },
  { id: 15, food_name: 'パスタ', calorie_per_100g: 150, protein_per_100g: 5.8, fat_per_100g: 0.9, carbohydrate_per_100g: 31.0 }
];

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[\u3000]/g, '');
}

function getDefaultFoods() {
  return DEFAULT_FOODS.map((food) => ({ ...food }));
}

function buildKeywordVariants(keyword) {
  const normalized = normalizeText(keyword);
  if (!normalized) return [];

  const variants = new Set([normalized]);

  if (normalized.includes('鶏肉') || normalized.includes('鶏') || normalized.includes('チキン')) {
    variants.add('鶏');
    variants.add('チキン');
    variants.add('むね');
    variants.add('もも');
  }

  if (normalized.includes('主菜')) {
    variants.add('肉');
    variants.add('魚');
    variants.add('卵');
    variants.add('豆腐');
    variants.add('納豆');
    variants.add('鶏');
  }

  if (normalized.includes('たんぱく') || normalized.includes('protein') || normalized.includes('タンパク')) {
    variants.add('鶏');
    variants.add('鮭');
    variants.add('まぐろ');
    variants.add('卵');
    variants.add('豆腐');
    variants.add('納豆');
    variants.add('サラダチキン');
  }

  if (normalized.includes('野菜') || normalized.includes('サラダ')) {
    variants.add('レタス');
    variants.add('トマト');
    variants.add('キャベツ');
    variants.add('ブロッコリー');
  }

  if (normalized.includes('炭水化物') || normalized.includes('米') || normalized.includes('ご飯')) {
    variants.add('米');
    variants.add('パン');
    variants.add('パスタ');
    variants.add('うどん');
    variants.add('そば');
    variants.add('じゃがいも');
  }

  return Array.from(variants);
}

function scoreFoodMatch(food, keyword) {
  const normalizedKeyword = normalizeText(keyword);
  if (!normalizedKeyword) return { food, score: 100 };

  const variants = buildKeywordVariants(keyword);
  const haystack = normalizeText(`${food.food_name || ''} ${food.food_name || ''}`);
  const protein = Number(food.protein_per_100g || 0);
  const carbs = Number(food.carbohydrate_per_100g || 0);

  let score = 0;

  if (haystack.includes(normalizedKeyword)) {
    score += 80;
  }

  variants.forEach((variant) => {
    if (haystack.includes(normalizeText(variant))) {
      score += 40;
    }
  });

  if (normalizedKeyword.includes('主菜') && protein >= 15) {
    score += 25;
  }

  if (normalizedKeyword.includes('たんぱく') || normalizedKeyword.includes('protein') || normalizedKeyword.includes('タンパク')) {
    if (protein >= 15) {
      score += 25;
    }
  }

  if (normalizedKeyword.includes('炭水化物') || normalizedKeyword.includes('米') || normalizedKeyword.includes('ご飯')) {
    if (carbs >= 20) {
      score += 25;
    }
  }

  if (normalizedKeyword.includes('鶏肉') || normalizedKeyword.includes('鶏')) {
    if (protein >= 15) {
      score += 10;
    }
  }

  return { food, score };
}

function filterFoodsByKeyword(foods, keyword) {
  const normalizedKeyword = normalizeText(keyword);
  if (!normalizedKeyword) {
    return [...foods];
  }

  const scored = foods
    .map((food) => scoreFoodMatch(food, keyword))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return (a.food.food_name || '').localeCompare(b.food.food_name || '', 'ja');
    });

  return scored.map((item) => item.food);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    normalizeText,
    buildKeywordVariants,
    scoreFoodMatch,
    filterFoodsByKeyword,
    getDefaultFoods
  };
}

if (typeof window !== 'undefined') {
  window.filterFoodsByKeyword = filterFoodsByKeyword;
  window.getDefaultFoods = getDefaultFoods;
}

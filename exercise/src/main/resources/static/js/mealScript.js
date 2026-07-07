const API_URL = 'http://localhost:8080';
const CURRENT_USER_ID = 1;
const TARGET_CALORIE = 1800; // 目標カロリー

let allFoods = [];

// 🚀 画面読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
    fetchFoods();     // 食品マスタを取得
    fetchTodayData(); // 今日のデータを取得
});

// 🔍 1. 全食品マスタをJavaから取得
function fetchFoods() {
    const select = document.getElementById('foodSelect');
    if (!select) return;

    fetch(`${API_URL}/foods`)
        .then(res => {
            if (!res.ok) throw new Error('食品データの取得に失敗しました');
            return res.json();
        })
        .then(data => {
            allFoods = data;
            renderFoodSelect(allFoods);
        })
        .catch(err => {
            console.error('Error fetching foods:', err);
            select.innerHTML = '<option value="">食品データの取得に失敗しました</option>';
        });
}

// 💡 セレクトボックスに食品リストを描画
function renderFoodSelect(foods) {
    const select = document.getElementById('foodSelect');
    if (!select) return;

    select.innerHTML = '';
    if (foods.length === 0) {
        select.innerHTML = '<option value="">該当する食品がありません</option>';
        return;
    }

    foods.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.id;
        opt.textContent = `${f.food_name} (${f.calorie_per_100g}kcal/100g)`;
        select.appendChild(opt);
    });
}

// ⚡ リアルタイム検索（HTML側の oninput="filterFoods()" に対応）
function filterFoods() {
    // 💡 HTMLに合わせて id="searchFood" に修正
    const text = document.getElementById('searchFood').value.toLowerCase().trim();
    const filtered = allFoods.filter(f => f.food_name.toLowerCase().includes(text));
    renderFoodSelect(filtered);
}

// 📥 2. 「この内容で記録する」ボタンの処理
function addMeal() {
    // 💡 HTMLのIDに完全一致させました
    const foodId = document.getElementById('foodSelect').value;
    const amountG = document.getElementById('amount').value;
    const mealType = document.getElementById('mealType').value;

    if (!foodId || !amountG || !mealType) {
        alert('食品を選択し、量を入力してください');
        return;
    }

    const payload = {
        user_id: parseInt(CURRENT_USER_ID),
        food_id: parseInt(foodId),
        amount_g: parseFloat(amountG),
        meal_type: mealType
    };

    fetch(`${API_URL}/meals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => {
        if (!res.ok) throw new Error('食事の登録に失敗しました');
        return res.json();
    })
    .then(data => {
        console.log('登録成功:', data);
        
        // 入力フォームのクリア
        document.getElementById('searchFood').value = '';
        document.getElementById('amount').value = '100';
        
        // 画面の数値と履歴リストを即座に再読込
        fetchTodayData();
    })
    .catch(err => {
        console.error('Error adding meal:', err);
        alert('登録中にエラーが発生しました');
    });
}

// 📊 3. 今日のカロリー集計・履歴の取得と画面へのマッピング
function fetchTodayData() {
    fetch(`${API_URL}/meals/today/${CURRENT_USER_ID}`)
        .then(res => res.json())
        .then(summary => {
            const currentCal = parseFloat(summary.total_calorie || 0);
            const p = parseFloat(summary.total_protein || 0);
            const f = parseFloat(summary.total_fat || 0);
            const c = parseFloat(summary.total_carbohydrate || 0);

            // カロリー表示の更新
            document.getElementById('totalCalorie').textContent = currentCal.toFixed(1);
            const remainingCal = TARGET_CALORIE - currentCal;
            document.getElementById('remainingCalorie').textContent = remainingCal < 0 ? 0 : remainingCal.toFixed(1);

            // 💡 PFCのグラム数表示更新（HTMLの単位 <span> を消さないように innerHTML で挿入）
            document.getElementById('protein').innerHTML = `${p.toFixed(1)}<span class="g-unit">g</span>`;
            document.getElementById('fat').innerHTML = `${f.toFixed(1)}<span class="g-unit">g</span>`;
            document.getElementById('carbs').innerHTML = `${c.toFixed(1)}<span class="g-unit">g</span>`;

            // 💡 PFCのプログレスバーと%の更新
            const totalPfcGram = p + f + c;
            if (totalPfcGram > 0) {
                const pPercent = Math.round((p / totalPfcGram) * 100);
                const fPercent = Math.round((f / totalPfcGram) * 100);
                const cPercent = Math.round((c / totalPfcGram) * 100);

                document.getElementById('proteinRatio').textContent = `${pPercent}%`;
                document.getElementById('proteinBar').style.width = `${pPercent}%`;

                document.getElementById('fatRatio').textContent = `${fPercent}%`;
                document.getElementById('fatBar').style.width = `${fPercent}%`;

                document.getElementById('carbsRatio').textContent = `${cPercent}%`;
                document.getElementById('carbsBar').style.width = `${cPercent}%`;
            }
        })
        .catch(err => console.error('Error fetching today summary:', err));

    // ② 今日の食事履歴リスト（<ul>）の更新
    fetch(`${API_URL}/meals/history/${CURRENT_USER_ID}`)
        .then(res => res.json())
        .then(history => {
            // 💡 HTMLの ul id="mealHistory" に合わせました
            const ul = document.getElementById('mealHistory');
            if (!ul) return;
            
            ul.innerHTML = '';
            if (history.length === 0) {
                ul.innerHTML = '<li style="text-align:center; color:#888; padding: 20px;">今日の食事記録はまだありません</li>';
                return;
            }

            history.forEach(item => {
                // 💡 テーブルではなく、アプリ風の美しいリスト（<li>）として追加
                const li = document.createElement('li');
                li.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #eee; background: white; margin-bottom: 10px; border-radius: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.02);";
                li.innerHTML = `
                    <div style="flex: 1;">
                        <span style="font-size: 11px; font-weight: bold; color: #fff; background: #2ecc71; padding: 3px 8px; border-radius: 12px; margin-right: 8px;">${item.meal_type}</span>
                        <strong style="font-size: 15px; color: #333;">${item.food_name}</strong>
                        <div style="font-size: 13px; color: #888; margin-top: 5px;">${item.amount_g}g</div>
                    </div>
                    <div style="text-align: right; margin-right: 15px;">
                        <span style="color: #333; font-weight: 800; font-size: 18px;">${item.calorie}</span>
                        <span style="font-size: 11px; color: #888;">kcal</span>
                    </div>
                    <button onclick="deleteMeal(${item.id})" style="background:#ff4757; color:white; border:none; padding:8px 12px; cursor:pointer; border-radius:8px; font-size:12px; font-weight:bold;">削除</button>
                `;
                ul.appendChild(li);
            });
        })
        .catch(err => console.error('Error fetching meal history:', err));
}

// 🗑️ 4. 履歴の削除処理
function deleteMeal(id) {
    if (!confirm('この食事記録を削除してもよろしいですか？')) return;

    fetch(`${API_URL}/meals/${id}`, { method: 'DELETE' })
        .then(res => {
            if (!res.ok) throw new Error('削除に失敗しました');
            fetchTodayData(); // 削除後に即再計算＆再描画
        })
        .catch(err => {
            console.error('Error deleting meal:', err);
            alert('削除中にエラーが発生しました');
        });
}
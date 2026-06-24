// ==========================================================================
// データベース初期マスタと接続URL設定
// ==========================================================================
const BACKEND_URL = '/api/records';

const CATEGORIES = [
    { id: 'chest', name: '胸', ename: 'Chest', icon: '💪' },
    { id: 'back', name: '背中', ename: 'Back', icon: '🦅' },
    { id: 'legs', name: '脚', ename: 'Legs', icon: '🦵' },
    { id: 'shoulders', name: '肩', ename: 'Shoulders', icon: '🛡️' },
    { id: 'arms', name: '腕', ename: 'Arms', icon: '💥' },
    { id: 'abs', name: '腹筋', ename: 'Abs', icon: '🍫' }
];

const INITIAL_EXERCISES = [
    // 胸
    { id: 'bench_press', catId: 'chest', name: 'ベンチプレス', type: 'weight', level: 'middle', desc: '仰向けに寝た状態でバーベルを大胸筋の上に下ろし、押し上げる胸の代表的な王道種目です。' },
    { id: 'push_up', catId: 'chest', name: 'プッシュアップ(腕立て伏せ)', type: 'bodyweight', level: 'beginner', desc: '自分の体重を負荷にして胸、肩、三頭筋を鍛える、どこでもできる基礎的な自重トレーニングです。' },
    { id: 'dumbbell_fly', catId: 'chest', name: 'ダンベルフライ', type: 'weight', level: 'advanced', desc: 'ダンベルを左右に大きく開き、大胸筋をストレッチさせることで強烈な刺激を与えるアイソレーション種目です。' },
    // 背中
    { id: 'lat_pulldown', catId: 'back', name: 'ラットプルダウン', type: 'weight', level: 'beginner', desc: '上方のバーを胸に引き寄せることで、背中の広がり（広背筋）を作る初心者にもおすすめの種目です。' },
    { id: 'pull_up', catId: 'back', name: 'チンニング(懸垂)', type: 'bodyweight', level: 'advanced', desc: '自重を利用してバーに体をぶら下げて引き上げる、高い負荷と効果を誇る背中の最強種目です。' },
    // 脚
    { id: 'squat', catId: 'legs', name: 'バーベルスクワット', type: 'weight', level: 'middle', desc: 'バーベルを担いでしゃがみ込む、下半身全体（大腿四頭筋・お尻）をモーレツに鍛え上げるトレーニングの王様です。' },
    { id: 'body_squat', catId: 'legs', name: '自重スクワット', type: 'bodyweight', level: 'beginner', desc: '道具を使わず正しいフォームを習得するための基本トレーニング。基礎代謝アップに最適です。' }
];

// 状態管理変数
let exercises = JSON.parse(localStorage.getItem('dietApp_custom_exs')) || INITIAL_EXERCISES;
let workoutHistory = []; // 🌟 ローカルストレージではなく、DBから取得するように空配列に変更！
let currentCategory = null;
let currentSelectedExercise = null;
let filterType = 'all';
let filterLevel = 'all';

// ==========================================================================
// 画面初期化・ナビゲーション制御
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    setTodayDate();
    renderCategories();
    initNavigation();
    initSubNavigation();
    initFilters();
    initCounters();
    initCustomExercise();
    initRecordSaving();
    loadHistoryFromDB(); // 🌟 画面を開いたときにデータベースから最新を取得！
});

function setTodayDate() {
    const today = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    document.getElementById('today-date-text').innerText = today.toLocaleDateString('en-US', options).toUpperCase();
}

function initNavigation() {
    document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetScreenId = btn.getAttribute('data-target');
            if(!targetScreenId) return;

            document.querySelectorAll('.bottom-nav .nav-item').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.sub-screen').forEach(s => s.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(targetScreenId).classList.add('active');

            const titleMap = { 'screen-categories': '部位選択', 'screen-history': '履歴リスト' };
            document.getElementById('header-title').innerText = titleMap[targetScreenId] || 'WORKOUT';
            
            // 履歴タブが開かれたら最新情報をDBから取得して再描画
            if(targetScreenId === 'screen-history') {
                loadHistoryFromDB();
            }
        });
    });
}

function initSubNavigation() {
    document.getElementById('btn-back-to-cats').addEventListener('click', () => {
        document.getElementById('sub-screen-exercises').classList.remove('active');
        document.getElementById('screen-categories').classList.add('active');
        document.getElementById('header-title').innerText = '部位選択';
    });

    document.getElementById('btn-back-to-exs').addEventListener('click', () => {
        document.getElementById('sub-screen-input').classList.remove('active');
        document.getElementById('sub-screen-exercises').classList.add('active');
        document.getElementById('header-title').innerText = currentCategory.name + 'の種目';
    });
}

// ==========================================================================
// レンダリングロジック（部位・種目・履歴）
// ==========================================================================
function renderCategories() {
    const grid = document.getElementById('category-grid');
    grid.innerHTML = '';
    CATEGORIES.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'card cat-card animate-press';
        card.innerHTML = `
            <span class="cat-icon">${cat.icon}</span>
            <span class="cat-name">${cat.name}</span>
            <span class="cat-ename">${cat.ename}</span>
        `;
        card.addEventListener('click', () => openExercisesScreen(cat));
        grid.appendChild(card);
    });
}

function openExercisesScreen(category) {
    currentCategory = category;
    document.getElementById('screen-categories').classList.remove('active');
    document.getElementById('sub-screen-exercises').classList.add('active');
    document.getElementById('selected-category-title').innerText = `${category.name} の種目一覧`;
    document.getElementById('header-title').innerText = `${category.name}の種目`;
    
    filterType = 'all';
    filterLevel = 'all';
    document.querySelectorAll('.home-type-btn').forEach(b => b.classList.toggle('active', b.dataset.type === 'all'));
    document.querySelectorAll('.home-level-btn').forEach(b => b.classList.toggle('active', b.dataset.level === 'all'));
    
    renderExercises();
}

function renderExercises() {
    const container = document.getElementById('exercise-list-container');
    container.innerHTML = '';

    const filtered = exercises.filter(ex => {
        if (ex.catId !== currentCategory.id) return false;
        if (filterType !== 'all' && ex.type !== filterType) return false;
        if (filterLevel !== 'all' && ex.level !== filterLevel) return false;
        return true;
    });

    if(filtered.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-sub); font-size:14px; margin-top:20px;">条件に合う種目がありません</p>';
        return;
    }

    filtered.forEach(ex => {
        const item = document.createElement('div');
        item.className = 'ex-item animate-press';
        
        let levelLabel = ex.level === 'beginner' ? '初級' : ex.level === 'middle' ? '中級' : '上級';
        let typeLabel = ex.type === 'bodyweight' ? '自重' : 'ウエイト';

        item.innerHTML = `
            <div class="ex-info">
                <span class="ex-name-text">${ex.name}</span>
                <span class="ex-level-badge ${ex.level || 'beginner'}">${levelLabel} / ${typeLabel}</span>
            </div>
            <span class="ex-arrow">➔</span>
        `;
        item.addEventListener('click', () => openInputScreen(ex));
        container.appendChild(item);
    });
}

function openInputScreen(exercise) {
    currentSelectedExercise = exercise;
    document.getElementById('sub-screen-exercises').classList.remove('active');
    document.getElementById('sub-screen-input').classList.add('active');
    document.getElementById('selected-exercise-title').innerText = exercise.name;
    document.getElementById('exercise-desc').innerText = exercise.desc || '解説はまだ登録されていません。';
    document.getElementById('header-title').innerText = '数値を入力';

    const weightCard = document.getElementById('weight-counter-card');
    if (exercise.type === 'bodyweight') {
        weightCard.classList.add('hide-weight');
        document.getElementById('reps-val').value = 15;
    } else {
        weightCard.classList.remove('hide-weight');
        document.getElementById('weight-val').value = 40;
        document.getElementById('reps-val').value = 10;
    }

    const latest = workoutHistory.find(h => h.exercise.id === exercise.id);
    const badge = document.getElementById('prev-record-text');
    if (latest) {
        badge.innerText = exercise.type === 'bodyweight'
            ? `前回の記録: ${latest.reps}回 (${formatDate(new Date(latest.date))})`
            : `前回の記録: ${latest.weight}kg × ${latest.reps}回 (${formatDate(new Date(latest.date))})`;
    } else {
        badge.innerText = '前回の記録: まだこの種目の記録はありません';
    }
}

// ==========================================================================
// フィルター・カウンター・カスタム追加のコントロール
// ==========================================================================
function initFilters() {
    document.querySelectorAll('.home-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.home-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterType = btn.dataset.type;
            renderExercises();
        });
    });

    document.querySelectorAll('.home-level-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.home-level-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterLevel = btn.dataset.level;
            renderExercises();
        });
    });
}

function initCounters() {
    setupCounter('btn-weight-minus', 'btn-weight-plus', 'weight-val', 2.5, 0, 500);
    setupCounter('btn-reps-minus', 'btn-reps-plus', 'reps-val', 1, 1, 100);
}

function setupCounter(minusId, plusId, inputId, step, min, max) {
    const minus = document.getElementById(minusId);
    const plus = document.getElementById(plusId);
    const input = document.getElementById(inputId);

    minus.addEventListener('click', () => {
        let val = parseFloat(input.value) || 0;
        val = Math.max(min, val - step);
        input.value = val;
    });

    plus.addEventListener('click', () => {
        let val = parseFloat(input.value) || 0;
        val = Math.min(max, val + step);
        input.value = val;
    });
}

function initCustomExercise() {
    document.getElementById('btn-add-custom').addEventListener('click', () => {
        const nameInput = document.getElementById('custom-exercise-name');
        const typeSelect = document.getElementById('custom-exercise-type');
        const name = nameInput.value.trim();

        if(!name) {
            alert('種目名を入力してください。');
            return;
        }

        const newEx = {
            id: 'custom_' + Date.now(),
            catId: currentCategory.id,
            name: name,
            type: typeSelect.value,
            level: 'beginner',
            desc: 'ユーザーによってカスタム追加された種目です。'
        };

        exercises.push(newEx);
        localStorage.setItem('dietApp_custom_exs', JSON.stringify(exercises));
        nameInput.value = '';
        renderExercises();
    });
}

// ==========================================================================
// 🌟 データベース連携処理（取得・保存・削除）
// ==========================================================================

// 🌟 AWS RDSから全履歴を取得する関数
async function loadHistoryFromDB() {
    try {
        const response = await fetch(BACKEND_URL);
        if (response.ok) {
            workoutHistory = await response.json();
            // 日付の降順（新しいものが上）になるように並び替え
            workoutHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
            renderHistoryList();
        }
    } catch (error) {
        console.error("履歴の取得に失敗しました", error);
    }
}

function initRecordSaving() {
    document.getElementById('btn-save-log').addEventListener('click', async () => {
        const weight = parseFloat(document.getElementById('weight-val').value) || 0;
        const reps = parseInt(document.getElementById('reps-val').value) || 0;
        const date = new Date();

        const recordData = {
            exercise: currentSelectedExercise,
            weight: weight,
            reps: reps,
            date: date.toISOString()
        };

        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recordData)
            });

            if (response.ok) {
                alert(`${currentSelectedExercise.name} を記録しました！\nカレンダー画面へ同期します。`);
                // 保存成功したらカレンダー画面へリダイレクト
                window.location.href = '/index.html';
            } else {
                alert('サーバーへの保存に失敗しました。');
            }
        } catch (error) {
            console.error('通信エラー:', error);
            alert('ネットワーク障害が発生しました。');
        }
    });
}

function renderHistoryList() {
    const timeline = document.getElementById('history-timeline');
    if(!timeline) return;
    timeline.innerHTML = '';

    if(workoutHistory.length === 0) {
        timeline.innerHTML = '<div class="card" style="text-align:center; color:var(--text-sub)">まだトレーニング記録はありません</div>';
        return;
    }

    workoutHistory.forEach((log) => {
        const dateObj = new Date(log.date);
        const card = document.createElement('div');
        card.className = 'card log-card';
        
        let detailText = log.exercise.type === 'bodyweight'
            ? `${log.reps} 回`
            : `${log.weight} kg × ${log.reps} 回`;

        // 🌟 削除ボタンにデータベースの「ID」を持たせる
        card.innerHTML = `
            <div class="log-date-box">
                <span class="log-day">${dateObj.getDate()}</span>
                <span class="log-month">${dateObj.toLocaleDateString('en-US', { month: 'short' })}</span>
            </div>
            <div class="log-info">
                <h4>${log.exercise.name}</h4>
                <p>${detailText}</p>
            </div>
            <div class="ex-controls right">
                 <button class="log-delete-btn" data-id="${log.id}">✕</button>
            </div>
        `;
        
        // 🌟 AWS RDSからデータを削除する処理
        card.querySelector('.log-delete-btn').addEventListener('click', async (e) => {
            const dbId = e.target.dataset.id;
            if(confirm('この記録を完全に削除しますか？\n(データベースからも削除されます)')) {
                try {
                    const res = await fetch(`${BACKEND_URL}/${dbId}`, { method: 'DELETE' });
                    if (res.ok) {
                        alert("削除しました。");
                        loadHistoryFromDB(); // 削除後、DBから最新状態を再読み込み！
                    } else {
                        alert("削除に失敗しました。");
                    }
                } catch (error) {
                    console.error("エラー:", error);
                    alert("通信エラーが発生しました。");
                }
            }
        });

        timeline.appendChild(card);
    });
}

function formatDate(date) {
    return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
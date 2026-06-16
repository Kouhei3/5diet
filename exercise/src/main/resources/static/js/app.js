/* =========================================================================
   データ定義（マスタデータ）
========================================= */
const exerciseMaster = [
    { id: 1, name: 'ベンチプレス', category: '胸', type: 'weight', level: '中級者', desc: '大胸筋全体を鍛えるジムの王道種目。肩甲骨を寄せて胸を張るのがコツです。' },
    { id: 2, name: 'チェストプレスマシン', category: '胸', type: 'weight', level: '初心者', desc: 'マシンの軌道に沿って押す安全な種目。怪我のリスクが低く初心者におすすめ。' },
    { id: 3, name: 'ダンベルフライ', category: '胸', type: 'weight', level: '上級者', desc: '大胸筋を強烈にストレッチさせる種目。重さのコントロールが重要です。' },
    { id: 4, name: '膝立ちプッシュアップ', category: '胸', type: 'bodyweight', level: '初心者', desc: '床に膝をついて行う腕立て伏せ。筋力が少ない方でも安全に胸を鍛えられます。' },
    { id: 5, name: 'プッシュアップ', category: '胸', type: 'bodyweight', level: '中級者', desc: '自重で胸を鍛える標準的な腕立て伏せ。体を一直線に保ち、深く落とします。' },
    { id: 6, name: 'ダイヤモンドプッシュアップ', category: '胸', type: 'bodyweight', level: '上級者', desc: '手でひし形を作って行う高強度な腕立て伏せ。胸の内側と二の腕を猛烈に追い込みます。' },
    { id: 7, name: 'レッグプレスマシン', category: '脚', type: 'weight', level: '初心者', desc: '背もたれに体を固定して足を押し出すマシン。腰に負担をかけず脚を鍛えられます。' },
    { id: 8, name: 'ヒップスラスト', category: '脚', type: 'weight', level: '中級者', desc: 'バーベルをお腹に乗せてお尻を突き上げる、ヒップアップ特化種目。' },
    { id: 9, name: 'バーベルスクワット', category: '脚', type: 'weight', level: '上級者', desc: 'バーベルを担いで行う高負荷な脚トレ。下半身全体のパワーを高めます。' },
    { id: 10, name: 'スクワット', category: '脚', type: 'bodyweight', level: '初心者', desc: '下半身全体を鍛える王道自重種目。太ももが床と平行になるまでお尻を落とします。' },
    { id: 11, name: 'ランジ', category: '脚', type: 'bodyweight', level: '中級者', desc: '片脚を前に大きく踏み出すスクワット。お尻ともも裏を集中的に引き締めます。' },
    { id: 12, name: 'ピストルスクワット', category: '脚', type: 'bodyweight', level: '上級者', desc: '究極の片脚スクワット。圧倒的な下半身の筋力、柔軟性、バランスが必要です。' },
    { id: 13, name: 'ラットプルダウン', category: '背中', type: 'weight', level: '初心者', desc: 'ジムのマシンを使って上からバーを引く種目。初心者でも背中に効かせやすいです。' },
    { id: 14, name: 'シーテッドロウ', category: '背中', type: 'weight', level: '中級者', desc: '前からケーブルを引っ張る種目。背中の厚みを作ります。' },
    { id: 15, name: 'デッドリフト', category: '背中', type: 'weight', level: '上級者', desc: '床からバーベルを引き上げる全身運動。背中全体の破壊力抜群の王道種目。' },
    { id: 16, name: 'タオル・ラットプルダウン', category: '背中', type: 'bodyweight', level: '初心者', desc: 'タオルを両手で強く引っ張りながら、背中の収縮を意識して腕を上下させる自宅用種目。' },
    { id: 17, name: '斜め懸垂 (インバーテッドロウ)', category: '背中', type: 'bodyweight', level: '中級者', desc: '低いバーや机の下に潜って行う懸垂。体重の半分をコントロールして背中を鍛えます。' },
    { id: 18, name: '懸垂 (プルアップ)', category: '背中', type: 'bodyweight', level: '上級者', desc: '最強の広背筋自重トレ。胸をバーに引き寄せるようにして、逆三角形の背中を作ります。' },
    { id: 19, name: 'アブドミナルマシン', category: '腹', type: 'weight', level: '中級者', desc: 'マシンの負荷を使ってお腹を丸める運動。ウエイトによる強い負荷がかけられます。' },
    { id: 20, name: 'クランチ', category: '腹', type: 'bodyweight', level: '初心者', desc: '仰向けでおへそを覗き込むように背中を丸める腹筋運動。腰への負担が少ない基本種目。' },
    { id: 21, name: 'レッグレイズ', category: '腹', type: 'bodyweight', level: '中級者', desc: '仰向けで脚を上下させる運動。気になるぽっこり下腹部をダイレクトに引き締めます。' },
    { id: 22, name: 'バイシクルクランチ', category: '腹', type: 'bodyweight', level: '上級者', desc: '自転車を漕ぐように体をねじる腹筋運動。腹直筋と脇腹を同時に激しく鍛えます。' },
    { id: 23, name: 'ショルダープレスマシン', category: '肩', type: 'weight', level: '初心者', desc: 'マシンを真上に押し上げる種目。肩の綺麗な丸みを作ります。' },
    { id: 24, name: 'サイドレイズ', category: '肩', type: 'weight', level: '中級者', desc: 'ダンベルを横に引き上げる種目。肩幅を広くし、小顔効果も期待できます。' },
    { id: 25, name: 'パイクプッシュアップ', category: '肩', type: 'bodyweight', level: '中級者', desc: 'お尻を高く上げてVの字になり、頭を床に近づける腕立て伏せ。自重で肩を鍛えます。' }
];

const categories = [
    { id: 'chest', name: '胸', icon: '🦍', ename: 'Chest' },
    { id: 'back', name: '背中', icon: '🦅', ename: 'Back' },
    { id: 'legs', name: '脚', icon: '🦵', ename: 'Legs' },
    { id: 'core', name: '腹', icon: '🍫', ename: 'Core' },
    { id: 'shoulders', name: '肩', icon: '🍈', ename: 'Shoulders' }
];

/* =========================================================================
   状態管理（アプリケーション変数）
========================================= */
let currentHomeType = 'weight';      
let currentHomeLevel = '初心者';     
let currentRecordType = 'weight';    
let currentCustomExercises = [];     
let workoutHistory = [];             
let currentSelectedExercise = null;  

/* =========================================================================
   初期化イベントリスナー
========================================= */
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();       
    initHomeTabs();         
    initRecordTabs();       
    initCounterButtons();   
    initCustomExercise();   
    initRecordSaving();     
    
    renderHome();
});

/* =========================================================================
   下部ナビゲーション＆画面切り替えロジック
========================================= */
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            navItems.forEach(n => n.classList.remove('active'));
            const targetBtn = e.currentTarget;
            targetBtn.classList.add('active');
            
            document.querySelectorAll('.app-main .screen').forEach(s => s.classList.remove('active'));
            const targetScreenId = targetBtn.getAttribute('data-target');
            document.getElementById(targetScreenId).classList.add('active');

            if (targetScreenId === 'screen-home') renderHome();
            if (targetScreenId === 'screen-record') resetRecordScreen();
            if (targetScreenId === 'screen-history') renderHistory();
        });
    });
}

function switchSubScreen(targetId) {
    document.querySelectorAll('.sub-screen, #sub-screen-category').forEach(s => s.classList.remove('active'));
    if (targetId === 'sub-screen-category') {
        document.getElementById('sub-screen-category').style.display = 'block';
    } else {
        document.getElementById('sub-screen-category').style.display = 'none';
        document.getElementById(targetId).classList.add('active');
    }
}

/* =========================================================================
   1. ホーム画面処理
========================================= */
function initHomeTabs() {
    const typeBtns = document.querySelectorAll('.home-type-btn');
    typeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            typeBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentHomeType = e.target.getAttribute('data-type');
            renderHome();
        });
    });

    const levelBtns = document.querySelectorAll('.home-level-btn');
    levelBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            levelBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentHomeLevel = e.target.getAttribute('data-level');
            renderHome();
        });
    });
}

function renderHome() {
    const today = new Date();
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    document.getElementById('date-today').innerText = `${today.getMonth() + 1}月${today.getDate()}日 ${days[today.getDay()]}曜日`;

    const container = document.getElementById('recommend-content');
    container.innerHTML = '';

    const allExercises = [...exerciseMaster, ...currentCustomExercises];
    let recommended = allExercises.filter(ex => ex.type === currentHomeType && ex.level === currentHomeLevel);

    if (recommended.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:gray; padding:20px;">該当するメニューがありません。</p>';
        return;
    }

    const displayPlan = recommended.slice(0, 3);
    displayPlan.forEach(ex => {
        const card = document.createElement('div');
        card.className = 'card recommend-card animate-press';
        card.innerHTML = `
            <div class="rec-info">
                <h4>${ex.name}</h4>
                <p>${ex.desc}</p>
            </div>
            <span class="rec-tag">${ex.level}</span>
        `;
        
        card.addEventListener('click', () => {
            currentRecordType = ex.type;
            document.querySelectorAll('.record-type-btn').forEach(b => {
                if(b.getAttribute('data-type') === currentRecordType) b.classList.add('active');
                else b.classList.remove('active');
            });
            const recordBtn = document.querySelector('[data-target="screen-record"]');
            if(recordBtn) recordBtn.click();
            showInputScreen(ex);
        });

        container.appendChild(card);
    });
}

/* =========================================================================
   2. 記録画面処理
========================================= */
function initRecordTabs() {
    const recordTypeBtns = document.querySelectorAll('.record-type-btn');
    recordTypeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            recordTypeBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentRecordType = e.target.getAttribute('data-type');
            resetRecordScreen();
        });
    });
}

function resetRecordScreen() {
    switchSubScreen('sub-screen-category');
    const grid = document.getElementById('category-grid');
    grid.innerHTML = '';
    
    categories.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'cat-card card animate-press';
        div.innerHTML = `
            <span class="cat-icon">${cat.icon}</span>
            <span class="cat-name">${cat.name}</span>
            <span class="cat-ename">${cat.ename}</span>
        `;
        div.addEventListener('click', () => showExerciseList(cat));
        grid.appendChild(div);
    });
}

function showExerciseList(category) {
    document.getElementById('selected-category-title').innerText = category.name;
    switchSubScreen('sub-screen-exercise');
    const list = document.getElementById('exercise-list');
    list.innerHTML = '';

    const allExercises = [...exerciseMaster, ...currentCustomExercises];
    const filtered = allExercises.filter(ex => ex.category === category.name && ex.type === currentRecordType);

    if (filtered.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:gray; padding:20px;">このカテゴリに登録された種目がありません。</p>';
        return;
    }

    filtered.forEach(ex => {
        const div = document.createElement('div');
        div.className = 'ex-item animate-press';
        
        let lvlClass = 'beginner';
        if (ex.level === '中級者') lvlClass = 'middle';
        if (ex.level === '上級者') lvlClass = 'advanced';

        div.innerHTML = `
            <div class="ex-info">
                <span class="ex-name-text">${ex.name}</span>
                <span class="ex-level-badge ${lvlClass}">${ex.level}</span>
            </div>
            <span class="ex-arrow">→</span>
        `;
        div.addEventListener('click', () => showInputScreen(ex));
        list.appendChild(div);
    });

    document.getElementById('btn-back-to-category').onclick = resetRecordScreen;
}

function initCustomExercise() {
    document.getElementById('btn-add-custom').addEventListener('click', () => {
        const inputObj = document.getElementById('custom-exercise-input');
        const memoObj = document.getElementById('custom-memo-input');
        const name = inputObj.value.trim();
        const memo = memoObj.value.trim();
        const categoryName = document.getElementById('selected-category-title').innerText;

        if (name) {
            const newEx = {
                id: 'custom_' + Date.now(),
                name: name,
                category: categoryName,
                type: currentRecordType,
                level: 'マイメニュー',
                desc: memo || '独自に追加したオリジナル種目です。'
            };
            currentCustomExercises.push(newEx);
            
            inputObj.value = '';
            memoObj.value = '';
            showExerciseList({ name: categoryName });
        }
    });
}

function showInputScreen(exercise) {
    currentSelectedExercise = exercise;
    document.getElementById('selected-exercise-title').innerText = exercise.name;
    document.getElementById('exercise-description').innerText = exercise.desc;

    const weightCard = document.getElementById('weight-counter-card');
    const weightInput = document.getElementById('weight-val');
    const repsInput = document.getElementById('reps-val');

    if (exercise.type === 'bodyweight') {
        weightCard.classList.add('hide-weight'); 
        weightInput.value = 0;
    } else {
        weightCard.classList.remove('hide-weight');
        weightInput.value = 40;
    }
    
    repsInput.value = 10;

    switchSubScreen('sub-screen-input');
    document.getElementById('btn-back-to-exercise').onclick = () => showExerciseList({ name: exercise.category });
}

/* =========================================================================
   3. カウンターボタン制御 & AWS非同期データ送信処理
========================================================================= */
function initCounterButtons() {
    document.querySelectorAll('.btn-round').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.target.getAttribute('data-type');
            const change = parseFloat(e.target.getAttribute('data-change'));
            
            const inputEl = document.getElementById(`${type}-val`);
            if (inputEl) {
                let currentVal = parseFloat(inputEl.value) || 0;
                let newVal = currentVal + change;
                if (newVal < 0) newVal = 0;
                inputEl.value = newVal;
            }
        });
    });
}

function initRecordSaving() {
    document.getElementById('btn-save-log').addEventListener('click', async () => {
        const weight = parseFloat(document.getElementById('weight-val').value) || 0;
        const reps = parseInt(document.getElementById('reps-val').value) || 0;
        const date = new Date();

        // 送信オブジェクトの構造
        const recordData = {
            exercise: currentSelectedExercise,
            weight: weight,
            reps: reps,
            date: date.toISOString()
        };

        // ローカル配列の履歴に先頭追加（自身の画面用）
        workoutHistory.unshift({
            exercise: currentSelectedExercise,
            weight: weight,
            reps: reps,
            date: date
        });

        alert(`${currentSelectedExercise.name} を記録しました！\nAWSサーバーへ同期します。`);
        resetRecordScreen();

        // 【通信処理】指定されたAWSのIPv4アドレスへ送信
        try {
            const targetUrl = 'http://44.220.150.89:8080/api/workout'; 

            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recordData)
            });

            if (response.ok) {
                console.log('AWSサーバー（44.220.150.89）への送信に成功しました！');
            } else {
                console.error('AWSサーバーへの送信に失敗しました。ステータス:', response.status);
            }
        } catch (error) {
            console.error('ネットワークエラー：AWSへの通信に失敗しました。', error);
        }
    });
}

/* =========================================================================
   4. 履歴画面処理
========================================================================= */
function renderHistory() {
    const container = document.getElementById('history-content');
    const filterSelect = document.getElementById('history-category-filter');
    
    if (filterSelect.options.length === 0) {
        filterSelect.innerHTML = '<option value="all">すべての部位</option>';
        categories.forEach(cat => {
            filterSelect.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
        });
        filterSelect.addEventListener('change', renderHistory);
    }

    container.innerHTML = '';
    const filterValue = filterSelect.value;

    const filteredHistory = filterValue === 'all' 
        ? workoutHistory 
        : workoutHistory.filter(log => log.exercise.category === filterValue);

    if (filteredHistory.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:gray; padding:20px;">まだ記録がありません。</p>';
        return;
    }

    filteredHistory.forEach(log => {
        const card = document.createElement('div');
        card.className = 'card log-card';
        
        const detailText = log.exercise.type === 'bodyweight' 
            ? `${log.reps} 回` 
            : `${log.weight} kg × ${log.reps} 回`;

        card.innerHTML = `
            <div class="log-date-box">
                <span class="log-day">${log.date.getDate()}</span>
                <span class="log-month">${log.date.getMonth() + 1}月</span>
            </div>
            <div class="log-info">
                <h4>${log.exercise.name}</h4>
                <p>${detailText}</p>
            </div>
        `;
        container.appendChild(card);
    });
}
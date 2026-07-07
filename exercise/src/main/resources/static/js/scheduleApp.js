const API_URL = 'http://localhost:8080';
const CURRENT_USER_ID = 1;

document.addEventListener('DOMContentLoaded', () => {
    // 💡 スケジュール画面が読み込まれたら、今日の食事摂取カロリーをJava経由でRDSから取得
    fetch(`${API_URL}/meals/today/${CURRENT_USER_ID}`)
        .then(res => res.json())
        .then(summary => {
            const todayCalorie = summary.total_calorie || 0;
            
            // スケジュール画面のHTMLにあるカロリーを表示したい要素（例: id="todayMealCalorie"）に値をセット
            const calorieElement = document.getElementById('todayMealCalorie'); 
            if (calorieElement) {
                calorieElement.textContent = `${todayCalorie} kcal`;
            }
            console.log("JavaのRDSから取得した今日の摂取カロリー:", todayCalorie);
        })
        .catch(err => console.error('スケジュール画面でのカロリー取得エラー:', err));
});
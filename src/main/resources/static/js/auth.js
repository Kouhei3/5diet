// パスワードの表示・非表示切り替え
document.querySelectorAll('.password-toggle').forEach(button => {
    button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (input.type === 'password') {
            input.type = 'text';
            this.textContent = '非表示';
        } else {
            input.type = 'password';
            this.textContent = '表示';
        }
    });
});

// ★ verify.html だけ username を hidden に入れる
const hiddenUsername = document.getElementById("hiddenUsername");
if (hiddenUsername) {
    const params = new URLSearchParams(window.location.search);
    const username = params.get("username");
    if (username) {
        hiddenUsername.value = username;
    } else {
        const msg = document.getElementById("message");
        msg.textContent = "ユーザー情報がありません。最初からやり直してください。";
        msg.className = "message error";
    }
}

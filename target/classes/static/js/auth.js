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

// ★ verify.html / reset.html だけ username を hidden に入れる
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

// ログイン・登録などのリダイレクト時に付与される ?error= をメッセージ表示する
(function showErrorFromQuery() {
    const messageEl = document.getElementById("message");
    if (!messageEl) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) {
        messageEl.textContent = "入力内容をご確認のうえ、もう一度お試しください。";
        messageEl.className = "message error";
    }
})();

// パスワードをお忘れの方：ユーザー名を送信して再設定コードをメール送付
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const username = document.getElementById("username").value.trim();
        const messageEl = document.getElementById("message");

        try {
            const res = await fetch("/api/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username })
            });
            const data = await res.json();

            if (res.ok && data.status === "success") {
                messageEl.textContent = data.message;
                messageEl.className = "message success";
                setTimeout(() => {
                    window.location.href = "/reset?username=" + encodeURIComponent(username);
                }, 1500);
            } else {
                messageEl.textContent = data.message || "送信に失敗しました。";
                messageEl.className = "message error";
            }
        } catch (err) {
            messageEl.textContent = "通信エラーが発生しました。時間をおいて再度お試しください。";
            messageEl.className = "message error";
        }
    });
}

// パスワード再設定：認証コードと新しいパスワードを送信
const resetForm = document.getElementById("resetForm");
if (resetForm) {
    resetForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const username = document.getElementById("hiddenUsername").value;
        const code = document.getElementById("code").value.trim();
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const messageEl = document.getElementById("message");

        if (newPassword !== confirmPassword) {
            messageEl.textContent = "新しいパスワードが一致しません。";
            messageEl.className = "message error";
            return;
        }

        try {
            const res = await fetch("/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, code, newPassword })
            });
            const data = await res.json();

            if (res.ok && data.status === "success") {
                messageEl.textContent = data.message;
                messageEl.className = "message success";
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1500);
            } else {
                messageEl.textContent = data.message || "再設定に失敗しました。";
                messageEl.className = "message error";
            }
        } catch (err) {
            messageEl.textContent = "通信エラーが発生しました。時間をおいて再度お試しください。";
            messageEl.className = "message error";
        }
    });
}

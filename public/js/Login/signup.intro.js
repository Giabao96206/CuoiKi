const host = window.location.hostname;
const j = window.location.host;
const port = window.location.port;
const protocol = window.location.protocol;

let alertne = document.getElementById("alertne");
document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelector("form")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      let username = document.getElementById("username").value;
      let email = document.getElementById("email").value;
      let password = document.getElementById("password1").value;

      if (!username || !email || !password) {
        alert("Vui lòng nhập đầy đủ tên đăng nhập, email và mật khẩu");
        return;
      }

      try {
        let response = await fetch(`/pushuser`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, email }),
        });

        let data = await response.json();

        if (response.ok) {
          console.log("Kết nối API thành công:", data);

          alertne.style.display = "block";
          setTimeout(() => {
            alertne.style.display = "none";
          }, 2000);
        } else {
          console.error("Lỗi phản hồi từ server:", data);
          alert(data.message || "Có lỗi xảy ra.");
        }
      } catch (err) {
        console.error("Không thể kết nối đến server:", err.message || err);
        console.log("Không thể kết nối đến server. Vui lòng thử lại sau.");
      }
    });
});

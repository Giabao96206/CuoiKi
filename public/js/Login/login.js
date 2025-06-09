// import { setCookie, getCookie, checkCookie } from "../Cilent/cokkie.js";
let host = window.location.hostname;
let buttonlogin = document.querySelectorAll(".form-button button")[0];
let alertne = document.getElementById("alertne");
let text = document.querySelector("#alertne .box-alert #success");
// console.log(host);
// console.log(buttonlogin, alertne, text);
buttonlogin.addEventListener("click", async (event) => {
  const email = document.querySelector(
    "#main #login-first .login-user input"
  ).value;
  const password = document.querySelector(
    "#main #login-first .login-user .form-pass input"
  ).value;

  event.preventDefault(); // Ngăn form reload trang
  if (!email || !password) {
    text.innerHTML = "Vui lòng nhập đầy đủ email và mật khẩu";
    alertne.style.display = "block";
    setTimeout(() => {
      alertne.style.display = "none";
    }, 2000);

    return;
  }
  try {
    let response = await fetch(`/checklogin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    let data = await response.json();
    if (response.ok) {
      console.log("✅ Kết nối API thành công:", data);
      text.innerHTML = "Đăng nhập thành công";
      alertne.style.display = "block";
      setTimeout(() => {
        alertne.style.display = "none";
      }, 2000);
      window.location.href = `/products`;
    } else {
      text.innerHTML = "Email hoặc mật khẩu không đúng";
      alertne.style.display = "block";
      setTimeout(() => {
        alertne.style.display = "none";
      }, 2000);
    }
  } catch (err) {
    console.log("❌ Lỗi kết nối đến server:", err);
  }
});

let url = "";
let slug = window.location.pathname.split("/").pop();

console.log(profiles);
let avainput = document.querySelector("#avatar-input");
// console.log(avainput);
function editInfo() {
  toggleDisplay("info-display", "none");
  toggleDisplay("info-edit", "block");

  const fields = {
    location: "#location .about-location",
    work: "#work .about-linkfb",
    phone: "#phone .about-phone",
    bio: "#bio",
  };

  Object.entries(fields).forEach(([key, selector]) => {
    document.getElementById(`edit-${key}`).value =
      document.querySelector(selector)?.innerText || "";
  });
}

function toggleDisplay(id, display) {
  document.getElementById(id).style.display = display;
}

function cancelEdit() {
  document.getElementById("info-edit").style.display = "none";
  document.getElementById("info-display").style.display = "block";
}

async function saveInfo() {
  // Cập nhật nội dung
  const fields = {
    location: "edit-location",
    work: "edit-work",
    phone: "edit-phone",
    bio: "edit-bio",
  };

  const data = {};

  for (let key in fields) {
    const value = document.getElementById(fields[key]).value;
    data[key] = value;
    const displaySelector =
      key === "bio"
        ? "#bio"
        : `#${key} .about-${key === "work" ? "linkfb" : key}`;
    document.querySelector(displaySelector).innerText = value;
  }

  try {
    let response = await fetch("/editprofile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...data, email: user.email }),
    });
    if (!response.ok) {
      console.log("Lỗi khi cập nhật thống tin");
    }
    console.log("Đã cập nhật thống tin");
  } catch (err) {
    console.error("Lỗi khi lưu thông tin:", err);
  }
  cancelEdit();
}
let originalAvatarSrc = document.querySelector(".avatar").src;

function changeAvatar(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    // Lưu lại ảnh cũ trước khi xem trước
    originalAvatarSrc = document.querySelector(".avatar").src;

    // Xem trước ảnh mới
    document.querySelector(".avatar").src = e.target.result;

    // Hiện nút xác nhận
    document.querySelector(".change-avatar-btn").style.display = "none";
    document.querySelector(".avatar-action-buttons").style.display = "block";
  };
  reader.readAsDataURL(file);
}

async function confirmAvatar() {
  const file = Array.from(avainput.files)[0];
  // Ẩn nút xác nhận, giữ nguyên ảnh mới
  try {
    let formData = new FormData();
    formData.append("image", file);
    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Lỗi khi upload ảnh");
    }
    console.log("Đã upload ảnh thành công");
    const data = await response.json();
    url = data.imageUrl;
    console.log("URL ảnh:", url);
  } catch (error) {
    console.error("Lỗi khi upload ảnh:", error);
    return;
  }

  try {
    const response = await fetch("/anhdaidien", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, email: user.email }),
    });
    const data = await response.json();
    document.querySelector("#header #nav .nav2 .login-sucess .img-1").src = url;
    document.querySelector(
      "#header #nav .nav2 .login-sucess .about-user .user-img .img img"
    ).src = url;
  } catch (err) {
    console.log(err);
  }

  document.querySelector(".avatar-action-buttons").style.display = "none";
  document.querySelector(".change-avatar-btn").style.display = "block";
}

function cancelAvatar() {
  // Trả lại ảnh cũ
  document.querySelector(".avatar").src = originalAvatarSrc;

  // Ẩn nút xác nhận
  document.querySelector(".avatar-action-buttons").style.display = "none";
  document.querySelector(".change-avatar-btn").style.display = "block";

  // Reset input file (để người dùng chọn lại ảnh nếu muốn)
  document.getElementById("avatar-input").value = "";
}

// Hàm check kết bạn
let a = document.querySelector(".profile-info");
console.log(a);
async function checkfriend() {
  try {
    let response = await fetch(
      `/checkfriend?user_email=${user.email}&friend_email=${profiles.email}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) console.log("Lỗi khi kiểm tra kết bạn");
    let data = await response.json();
    console.log(data.status || "Chưa kết bạn");
    if (data.status) {
      let div = document.createElement("div");
      div.classList.add("buttons");
      div.innerHTML = `
        <button class="remove-friend"> Hủy kết bạn </button>
        <button class="send-message"> &#x1F4AC; Nhắn tin </button>
      `;
      a.appendChild(div);
      document
        .querySelectorAll(".buttons button")[1]
        .addEventListener("click", (e) => {
          e.preventDefault();
          window.location.href = `/message/${profiles.email}`;
        });
    } else if (user.email === slug) {
      let div = document.createElement("div");
      div.classList.add("buttons");
      div.innerHTML = `
        // <button class="add-friend"> Kết bạn </button>
      `;
      // a.appendChild(div);
    } else {
      let div = document.createElement("div");
      div.classList.add("buttons");
      div.innerHTML = `
        <button class="add-friend"> Kết bạn </button>
      `;
      a.appendChild(div);
    }
  } catch (err) {
    console.error("Lỗi khi kiểm tra kết bạn:", err);
  }
}

checkfriend();

const fileInput = document.querySelector(".input-area .img-input");
const previewArea = document.querySelector(".input-area .preview");
const socket = io();
let fileIdCounter = 0;
let mySocketId = null;
let filesToUpload = [];
console.log(users);
let typingTimeout;
let typingIndicator = document.getElementById("typingIndicator");

let isLoadingFriends = false;
let usersList = []; // để lưu danh sách bạn bè từ server

// Load danh sách bạn bè
async function loadFriends() {
  if (isLoadingFriends) return;
  isLoadingFriends = true;

  try {
    const response = await fetch(`/loadfriend?email=${users.email}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.log("Lỗi khi tải danh sách người dùng");
      return;
    }

    const data = await response.json();
    usersList = data; // lưu để dùng lại

    const chatList = document.getElementById("chat-list");
    chatList.classList.add("shimmer");
    chatList.innerHTML = ""; // clear cũ

    if (Array.isArray(data)) {
      for (const user of data) {
        const userChat = document.createElement("div");
        userChat.classList.add("user-chat");
        userChat.innerHTML = `
            <img src="${user.url_image}" alt="" />
            <p class="user-name">${user.username}</p>
            <a 
            href="/message/${user.email}" 
            class="user-link" 
            data-email="${user.email}" 
            data-username="${user.username}"
            ></a>
        `;
        chatList.appendChild(userChat);
      }
    } else {
      console.error("Dữ liệu không phải dạng mảng");
    }
    let path = window.location.pathname.split("/");
    console.log(path);
    chatList.classList.remove("shimmer");
    document.getElementById("info-content")?.classList.remove("shimmer");
    document.getElementById("chat-content")?.classList.remove("shimmer");
    Array.from(chatList.children).forEach((item) => {
      const userLink = item.querySelector(
        `.user-link[data-email='${path[2]}']`
      );
      if (userLink) {
        userLink.classList.add("active");
      }
    });
  } catch (error) {
    console.error("Lỗi khi tải danh sách người dùng:", error);
  } finally {
    isLoadingFriends = false;
  }
}

// Lắng nghe click trên user-link (event delegation)
document.addEventListener("click", async function (e) {
  const target = e.target.closest(".user-link");
  if (target) {
    e.preventDefault();
    const email = target.dataset.email;
    const username = target.dataset.username;
    try {
      let response = await fetch(`/finduser?email=${email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        console.error("Lỗi khi tìm kiếm người dùng:", response.statusText);
      }
      let data = await response.json();
      // console.log("User data:", data);
      history.pushState({ email }, "", `/message/${email}`);
      loadMessagePage(email, username, data.url_image);
    } catch (error) {
      console.error("Lỗi khi xử lý click vào người dùng:", error);
    }
    const parent = document.getElementById("chat-list");
    const a = target.closest(".user-chat");
    if (a) {
      parent.removeChild(a);
      parent.prepend(a);
    }
    document.querySelectorAll(".user-link.active").forEach((el) => {
      el.classList.remove("active");
    });
    target.classList.add("active");
  }
});

// Load nội dung tin nhắn giữa current user và người nhận
async function reloadMessages(toEmail, toUsername) {
  try {
    const chatContent = document.getElementById("chat-content");
    chatContent.innerHTML = ""; // clear cũ

    const response = await fetch(
      `/loadmessage?from=${users.email}&to=${toEmail}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Lỗi khi tải tin nhắn");

    const messages = await response.json();
    // console.log(messages);

    for (let msg of messages) {
      const isMine = msg.sender_email === users.email;

      // Tin nhắn
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message", isMine ? "right" : "left");
      if (!isMine) {
        messageDiv.innerHTML = `
      <div class="img-profile"><img src="${msg.sender_img}"></div>
      <span class="${isMine ? "right" : "other"}">${msg.content}</span>`;
      } else {
        messageDiv.innerHTML = `
      <span class="${isMine ? "right" : "other"}">${msg.content}</span>`;
      }
      chatContent.appendChild(messageDiv);

      // Ảnh nếu có
      if (msg.image_url && msg.image_url.length > 0) {
        const imgWrapper = document.createElement("div");
        imgWrapper.classList.add(isMine ? "img-right" : "img-left");

        msg.image_url.split(",").forEach((src) => {
          const img = document.createElement("img");
          img.src = src.trim();
          imgWrapper.appendChild(img);
        });

        chatContent.appendChild(imgWrapper);
      }
    }

    scrollToBottom();
  } catch (error) {
    console.error("Lỗi khi tải lại tin nhắn:", error);
    document.getElementById(
      "chat-content"
    ).innerHTML = `<p style="color: red">Không tải được tin nhắn.</p>`;
  }
}

// Load page theo email
function loadMessagePage(toEmail, toUsername, toUrlImage) {
  receivers = {
    email: toEmail,
    username: toUsername,
    url_image: toUrlImage,
  };
  const roomChatName = document.querySelector(
    ".chat-area .room-chat .name-room"
  );
  roomChatName.textContent = `Chat với ${toUsername}`;
  const roomChatImg = document.querySelector(".chat-area .room-chat img");
  roomChatImg.src = toUrlImage || "/images/default-avatar.png";
  const infoContentImg = document.querySelector(
    ".info-panel #info-content .img-user img"
  );
  infoContentImg.src = toUrlImage || "/images/default-avatar.png";
  const infoContentName = document.querySelector(".info-panel .info-name");
  infoContentName.textContent = toUsername;
  const infoEmail = document.querySelector(".info-panel .info-email");
  infoEmail.textContent = toEmail;
  document.querySelector(
    ".info-panel #info-content .trangcanhan .icon-fb a"
  ).href = `/profile/${toEmail}` || "#";
  reloadMessages(toEmail, toUsername);
}

// Back/Forward trên trình duyệt
window.addEventListener("popstate", (event) => {
  const email = event.state?.email;
  if (email) {
    const user = usersList.find((u) => u.email === email);
    if (user) {
      loadMessagePage(user.email, user.username, user.url_image);
    }
  }
});

// Cuộn xuống cuối
function scrollToBottom() {
  const chatContent = document.getElementById("chat-content");
  chatContent.scrollTop = chatContent.scrollHeight;
}

// Khi load trang
window.onload = () => {
  loadFriends();
  const path = window.location.pathname.split("/");
  // console.log(path[2]);

  // if()
  // Nếu URL đang là /message/email thì load tin nhắn luôn

  if (path[1] === "message" && path[2]) {
    const email = decodeURIComponent(path[2]);
    // Đợi loadFriends xong mới tìm được username
    const checkInterval = setInterval(() => {
      const user = usersList.find((u) => u.email === email);

      if (user) {
        console.log("Found user:", user);
        clearInterval(checkInterval);
        history.replaceState({ email }, "", `/message/${email}`);
        loadMessagePage(user.email, user.username, user.url_image);
      }
    }, 100);
  }
  scrollToBottom();
};

// Hàm cuộn xuống cuối chat
function scrollToBottom() {
  const chatContent = document.getElementById("chat-content");
  chatContent.scrollTop = chatContent.scrollHeight;
}

// Khi kết nối socket
socket.on("connect", () => {
  mySocketId = socket.id;
  socket.emit("register", { email: users.email });
});

// Nhận tin nhắn
socket.on("send_private_message", (data) => {
  const chatContent = document.getElementById("chat-content");
  const isMine = data.from === users.email;
  console.log(data);
  console.log(isMine);

  const message = document.createElement("div");
  message.classList.add("message", isMine ? "right" : "left");
  if (!isMine) {
    message.innerHTML = ` 
  <div class="img-profile"><img src="${data.avatar}"></div>
  <span class="${isMine ? "right" : "other"}">${data.text}</span>`;
  } else {
    message.innerHTML = `
  <span class="${isMine ? "right" : "other"}">${data.text}</span>`;
  }

  chatContent.appendChild(message);

  // const messageDiv = document.createElement("div");
  // messageDiv.classList.add("message", isMine ? "right" : "left");
  // if (!isMine) {
  //   messageDiv.innerHTML = `
  //     <div class="img-profile"><img src="${msg.sender_img}"></div>
  //     <span class="${isMine ? "right" : "other"}">${msg.content}</span>`;
  // } else {
  //   messageDiv.innerHTML = `
  //     <span class="${isMine ? "right" : "other"}">${msg.content}</span>
  //           <div class="img-profile"><img src="${msg.sender_img}"></div>`;
  // }
  // chatContent.appendChild(messageDiv);

  // console.log(data);
  // console.log(data.images);
  if (data.images.length > 0) {
    const imgWrapper = document.createElement("div");
    imgWrapper.classList.add(isMine ? "img-right" : "img-left");
    data.images.forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      imgWrapper.appendChild(img);
    });
    chatContent.appendChild(imgWrapper);
  }

  scrollToBottom(); // Cuộn xuống cuối chat khi có tin nhắn mới
});

// Gửi tin nhắn
async function sendMessage() {
  const msgInput = document.getElementById("msgInput");
  const msg = msgInput.value.trim();

  if (!msg && filesToUpload.length === 0) return;

  let uploadedUrls = [];

  if (filesToUpload.length > 0) {
    const formData = new FormData();
    filesToUpload.forEach((file) => formData.append("image", file));
    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      uploadedUrls = data.imageUrl || [];
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
    }
  }

  socket.emit("private-message", {
    from: users.email,
    to: receivers.email,
    text: msg,
    images: uploadedUrls,
    avatar: users.avatar,
  });

  msgInput.value = "";
  previewArea.innerHTML = "";
  fileInput.value = "";
  filesToUpload = [];
}

// Render ảnh preview
function renderPreview(file) {
  const reader = new FileReader();
  const fileId = fileIdCounter++;
  file._id = fileId; // gán ID vào file

  reader.onload = () => {
    const div = document.createElement("div");
    div.classList.add("img-privew");
    div.setAttribute("data-id", fileId);
    div.innerHTML = `<i class="ti-close"></i><img src="${reader.result}">`;
    previewArea.appendChild(div);
  };
  reader.readAsDataURL(file);
}

// Chọn file từ input
fileInput.addEventListener("change", () => {
  const files = Array.from(fileInput.files);
  files.forEach((file) => {
    filesToUpload.push(file);
    renderPreview(file);
  });
  fileInput.value = "";
});

// Dán ảnh từ clipboard
document.addEventListener("paste", function (event) {
  const items = (event.clipboardData || event.originalEvent.clipboardData)
    .items;
  for (const item of items) {
    if (item.type.indexOf("image") !== -1) {
      const file = item.getAsFile();
      filesToUpload.push(file);
      renderPreview(file);
    }
  }
});

// Kéo thả ảnh
previewArea.addEventListener("dragover", (event) => {
  event.preventDefault();
  previewArea.style.border = "2px dashed #00f";
});
previewArea.addEventListener("dragleave", () => {
  previewArea.style.border = "";
});
previewArea.addEventListener("drop", (event) => {
  event.preventDefault();
  previewArea.style.border = "";

  const files = Array.from(event.dataTransfer.files);
  files.forEach((file) => {
    if (file.type.startsWith("image/")) {
      filesToUpload.push(file);
      renderPreview(file);
    }
  });
});

// Xóa ảnh khỏi preview + danh sách
previewArea.addEventListener("click", (event) => {
  if (
    event.target.tagName === "I" &&
    event.target.classList.contains("ti-close")
  ) {
    const imgPreview = event.target.closest(".img-privew");
    const fileId = parseInt(imgPreview.getAttribute("data-id"));
    filesToUpload = filesToUpload.filter((file) => file._id !== fileId);
    imgPreview.remove();
  }
});

// Enter để gửi tin nhắn
document
  .querySelector(".input-area #msgInput")
  .addEventListener("keydown", (e) => {
    // let parent = document.getElementById("chat-list");
    // let a = e.target.closest(".user-chat");
    // console.log(a);
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });

// Xử lý nút đăng xuất (nếu có)
document
  .querySelector(".container .user-now .logout")
  ?.addEventListener("click", async (e) => {
    e.preventDefault();
    let conf = confirm("Bạn có chắc muốn đăng xuất không?");
    if (conf) {
      try {
        let respone = await fetch("/logout");
        if (respone.ok) window.location.reload();
        else alert("Lỗi đăng xuất. Vui lòng thử lại sau.");
      } catch (error) {
        console.error("Lỗi khi đăng xuất:", error);
      }
    }
  });

// Hiện thông tin người dùng khi click avatar
document
  .querySelector(".container .user-now")
  ?.addEventListener("click", function () {
    const aboutUserNow = this.querySelector(".about-user-now");
    aboutUserNow.style.display =
      aboutUserNow.style.display === "flex" ? "none" : "flex";
  });

// Ẩn thông tin người dùng khi click ra ngoài
document.addEventListener("click", function (event) {
  const aboutUserNow = document.querySelector(".container .user-now");
  if (!aboutUserNow.contains(event.target)) {
    document.querySelector(
      ".container .user-now .about-user-now"
    ).style.display = "none";
  }
});

// reloadMessages(); // Gọi hàm để tải lại tin nhắn khi trang được tải

// let s = document.querySelector(".chat-area .room-chat .icon-call a");
// console.log(s);
document
  .querySelector(".chat-area .room-chat .icon-call a")
  .addEventListener("click", (e) => {
    window.open(
      `/callmess/${receivers.email}`,
      "_blank",
      "width=1000,height=1000,left=100,top=100,noopener"
    );
  });

// const tooltip = document.getElementById("hover-tooltip");
// // console.log(tooltip);

// document.addEventListener("mouseover", (e) => {
//   const userDiv = e.target.closest(".user-chat");
//   if (userDiv) {
//     const email = userDiv.querySelector(".user-link")?.dataset.email;
//     const username = userDiv.querySelector(
//       "#chat-list .user-chat .user-name"
//     )?.textContent;
//     const imgSrc = userDiv.querySelector("img")?.src;

//     tooltip.innerHTML = `
//       <div style="display: flex; align-items: center;">
//         <img src="${imgSrc}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 8px;" />
//         <div>
//           <strong style=" color: black">${username}</strong><br/>
//           <span style="font-size: 12px; color: black">${email}</span>
//         </div>
//       </div>
//     `;
//     tooltip.style.display = "block";
//   }
// });

// document.addEventListener("mousemove", (e) => {
//   tooltip.style.top = `${e.pageY + 10}px`;
//   tooltip.style.left = `${e.pageX + 10}px`;
// });

// document.addEventListener("mouseout", (e) => {
//   if (e.target.closest(".user-chat")) {
//     tooltip.style.display = "none";
//   }
// });

document
  .querySelector("emoji-picker")
  .addEventListener("emoji-click", (event) => {
    const msgInput = document.getElementById("msgInput");
    msgInput.value += event.detail.unicode;
  });

// Typing indicator
document.getElementById("msgInput").addEventListener("input", () => {
  socket.emit("typing", { email: receivers.email });
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("stopTyping", { email: receivers.email });
  }, 3000);
});

socket.on("typing", (data) => {
  typingIndicator.style.display = "inline-block";
});

socket.on("stopTyping", () => {
  typingIndicator.style.display = "none";
});

scrollToBottom();

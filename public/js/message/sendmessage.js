import * as Popper from "https://cdn.jsdelivr.net/npm/@popperjs/core@^2/dist/esm/index.js";
const button_icon = document.querySelector(".input-area .button-icon");
if (button_icon) {
  const tooltip = document.querySelector(".tooltip");
  // console.log(tooltip);
  Popper.createPopper(button_icon, tooltip);

  button_icon.onclick = () => {
    tooltip.classList.toggle("shown");
  };
}

function autoResize(textarea) {
  textarea.style.height = "40px"; // Reset height
  textarea.style.height = textarea.scrollHeight + "px"; // Set theo nội dung
}
const formchat = document.getElementById("chat-content");
const textarea = document.getElementById("msgInput");

textarea.addEventListener("input", () => {
  const value = textarea.value.trim();

  if (value === "") {
    // Reset khi không có nội dung
    textarea.style.height = "40px"; // hoặc giá trị mặc định
    formchat.style.maxHeight = "600px"; // reset về chiều cao nhỏ
  } else {
    // Gõ nội dung -> mở rộng textarea
    const maxTextareaHeight = 100;
    const newHeight = Math.min(textarea.scrollHeight, maxTextareaHeight);
    textarea.style.height = newHeight + "px";

    // Giữ formchat ở chiều cao tối đa để hiển thị tin nhắn
    formchat.style.maxHeight = `calc(640px - ${newHeight}px)`;
  }
});

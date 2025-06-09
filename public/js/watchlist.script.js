const products = document.querySelectorAll(".section1-film-container");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      } else {
        entry.target.classList.remove("active");
      }
    });
  },
  {
    root: document.querySelector(".section1-film"),
    rootMargin: "0px",
    threshold: 0.6,
  }
);

products.forEach((product) => {
  observer.observe(product);
});

const a = document.querySelector(
  ".main-content .content .container .about1-movie .text .list-button li:nth-child(1) a"
);

const b = document.querySelector(
  ".main-content .content .container .movie .trailer"
);

const c = document.querySelector(
  ".main-content .content .container .movie .trailer iframe"
);

function getYouTubeVideoId(url) {
  const regex =
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

a.addEventListener("click", (event) => {
  event.preventDefault(); // Ngăn chặn hành vi mặc định của liên kết
  const videoId = getYouTubeVideoId(a.href);
  if (!videoId) {
    alert("Không có trailer video");
    return;
  }
  c.src = `https://www.youtube.com/embed/${videoId}`;
  b.style.display = "block"; // Hiển thị iframe
  b.scrollIntoView({
    behavior: "smooth",
  });
});

let scoreElement = document.querySelector(
  `.main-content .content .container .more-movie .social .vote .stars-inner`
);
let score = scoreElement.getAttribute("leng");
console.log(score);
function updateStars(score) {
  const widthPercent = Math.max(0, Math.min(score * 10, 100)); // giới hạn từ 0 đến 100%
  document.getElementById("stars-inner").style.width = widthPercent + "%";
}

updateStars(score);

particlesJS("particles-js", {
  particles: {
    number: {
      value: 150,
    },
    color: {
      value: "#ffffff",
    },
    shape: {
      type: "circle",
    },
    opacity: {
      value: 0.5,
    },
    size: {
      value: 5,
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#ffffff",
      opacity: 0.4,
      width: 1,
    },
    move: {
      enable: true,
      speed: 2,
    },
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: {
        enable: true,
        mode: "repulse", // Các mode khác: "grab", "bubble"
      },
      onclick: {
        enable: true,
        mode: "push",
      },
    },
    modes: {
      repulse: {
        distance: 100,
      },
    },
  },
  retina_detect: true,
});

document.addEventListener("mousemove", function (e) {
  const trail = document.createElement("div");
  trail.className = "trail";
  document.body.appendChild(trail);
  trail.style.left = e.clientX - 4 + "px";
  trail.style.top = e.clientY + window.scrollY - 4 + "px";

  setTimeout(() => {
    trail.remove();
  }, 1000);
});

// Hiệu ứng about-film
let about_film = document.querySelectorAll(
  ".main-content .content .container .more-movie"
);

let observe5 = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("showes2");
      } else {
        entry.target.classList.remove("showes2");
      }
    });
  },
  {
    threshold: 0.2,
  }
);

about_film.forEach((box) => {
  observe5.observe(box);
});

let sectionfilm1 = document.querySelectorAll(
  ".main-content .content .container .section1"
);
sectionfilm1.forEach((box) => {
  observe5.observe(box);
});

// fb -commnet
let fbcommnet = document.querySelectorAll(
  ".main-content .content .container .comment-fb"
);
fbcommnet.forEach((box) => {
  observe5.observe(box);
});

let film_list = document.querySelectorAll(
  ".main-content .content .container .section1-film"
);

document
  .querySelector(".main-content .icon-next #icon-next1")
  .addEventListener("click", () => {
    film_list.forEach((item) => {
      item.scrollLeft += 300;
    });
  });

const {
  PhimLe,
  PhimBo,
  PhimVienTuong,
} = require("../../models/products.model.js");
const { connectdtb } = require("../../config/database.js");
connectdtb();

function splitMoviesStable(movies, chunkSize = 20) {
  const result = [null];
  for (let i = 0; i < movies.length; i += chunkSize) {
    const chunk = movies.slice(i, i + chunkSize);
    result.push(chunk);
  }
  return result;
}

async function getProducts(model, query) {
  const products = await model.find(query).sort({ _id: 1 }).exec();
  return products;
}
const fetchAPI = async (api) => {
  try {
    const response = await fetch(api);
    const data = await response.json();
    return data?.items || data?.data?.items || [];
  } catch (error) {
    console.error(`Lỗi khi gọi API: ${api}`, error);
    return [];
  }
};

let cachedMoviePages = {};

const taomang = async (a, b) => {
  let film = await getProducts(a, b); // Lấy dữ liệu đã được sort
  const movieChunks = splitMoviesStable(film); // Chia nhóm
  return movieChunks;
};

module.exports.gener = async (req, res) => {
  try {
    let key = req.params.key;
    let a = req.params.num;
    let page = parseInt(a);
    let theloai = {
      "hanh-dong": "Hành Động",
      "tinh-cam": "Tình Cảm",
      "hai-huoc": "Hài Hước",
      "co-trang": "Cổ Trang",
      "tam-ly": "Tâm Lý",
      "chien-tranh": "Chiến Tranh",
      "khoa-hoc": "Khoa Học",
      "am-nhac": "Âm Nhạc",
      "hoc-duong": "Học Đường",
      "vo-thuat": "Võ Thuật",
      "vien-tuong": "Viễn Tưởng",
      "kinh-di": "Kinh Dị",
      "hinh-su": "Hình Sự",
      "the-thao": "Thể Thao",
      "hoc-duong": "Học Đường",
      "chieu-rap": "Chiếu Rạp",
      "gia-dinh": "Gia Đình",
      "bi-an": "Bí Ẩn",
    };
    let filml, filmb, film, leng;
    if (theloai[key] === "Chiếu Rạp") {
      filml = await taomang(PhimLe, { chieurap: true });
      film = [...(filml[page] || []), ...(filml[page + 1] || [])];
      leng = filml.length;
    } else {
      filml = await taomang(PhimLe, { category: theloai[key] });
      filmb = await taomang(PhimBo, { category: theloai[key] });
      if (!filml[page] || filml[page].length < 9) {
        film = [...(filmb[page] || []), ...(filmb[page + 1] || [])];
      } else if (!filmb[page] || filmb[page].length < 9) {
        film = [...(filml[page] || []), ...(filml[page + 1] || [])];
      } else {
        film = [...(filmb[page] || []), ...(filml[page] || [])];
      }
      leng = Math.max(filmb.length, filml.length);
    }

    if (page > leng) {
      return res.status(500).send("Không tìm thấy phim");
    }
    let name = theloai[key];
    res.render("client/pages/search/search", {
      film, // vì film là mảng, lấy phần tử đầu tiên
      name,
      leng,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
  }
};
module.exports.country = async (req, res) => {
  try {
    let key = req.params.country;
    let a = req.params.num;
    let page = parseInt(a);
    let name;
    let countries = {
      "trung-quoc": "Trung Quốc",
      "viet-nam": "Việt Nam",
      "han-quoc": "Hàn Quốc",
      "nhat-ban": "Nhật Bản",
      "thai-lan": "Thái Lan",
      "au-mi": "Âu Mỹ",
    };
    if (key === "tong-hop") {
      let filmb = await taomang(PhimBo, {});
      let filml = await taomang(PhimLe, {});
      let film;
      if (!filml[page] || filml[page].length < 9) {
        film = [...(filmb[page] || []), ...(filmb[page + 1] || [])];
      } else if (!filmb[page] || filmb[page].length < 9) {
        film = [...(filml[page] || []), ...(filml[page + 1] || [])];
      } else {
        film = [...(filmb[page] || []), ...(filml[page] || [])];
      }
      let leng = filmb.length > filml.length ? filmb.length : filml.length;
      if (filmb.length == 0 || filml.length == 0) {
        return res.status(500).send("Không tìm thấy phim");
      }
      name = "TỔNG HỢP";
      res.render("client/pages/search/search", {
        film, // vì film là mảng, lấy phần tử đầu tiên,
        name,
        leng,
        user: req.session.user,
      });
      return;
    }
    let filmb = await taomang(PhimBo, { country: countries[key] });
    let filml = await taomang(PhimLe, { country: countries[key] });
    let film;

    if (!filml[page] || filml[page].length < 9) {
      film = [...(filmb[page] || []), ...(filmb[page + 1] || [])];
    } else if (!filmb[page] || filmb[page].length < 9) {
      film = [...(filml[page] || []), ...(filml[page + 1] || [])];
    } else {
      film = [...(filmb[page] || []), ...(filml[page] || [])];
    }
    let leng = filmb.length > filml.length ? filmb.length : filml.length;
    if (filmb.length == 0 || filml.length == 0) {
      return res.status(500).send("Không tìm thấy phim");
    }
    name = countries[key];
    res.render("client/pages/search/search", {
      film, // vì film là mảng, lấy phần tử đầu tiên
      name,
      leng,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
  }
};
module.exports.year = async (req, res) => {
  try {
    let key = req.params.year;
    let s1 = parseInt(key);
    let num = req.params.num;
    let page = parseInt(num);
    if (isNaN(s1)) {
      return res.status(404).send("Không tìm thấy phim");
    }

    if (s1 === 2007) {
      let filmb = await taomang(PhimBo, { year: s1 });
      let filml = await taomang(PhimLe, { year: s1 });
      let film;

      if (!filml[page] || filml[page].length < 9) {
        film = [...(filmb[page] || []), ...(filmb[page + 1] || [])];
      } else if (!filmb[page] || filmb[page].length < 9) {
        film = [...(filml[page] || []), ...(filml[page + 1] || [])];
      } else {
        film = [...(filmb[page] || []), ...(filml[page] || [])];
      }
      let leng = filmb.length > filml.length ? filmb.length : filml.length;
      if (filmb.length == 0 || filml.length == 0) {
        return res.status(500).send("Không tìm thấy phim");
      }
      let name = "Sau 2007";
      res.render("client/pages/search/search", {
        film,
        name,
        leng,
        user: req.session.user,
      });
      return;
    }
    let filmb = await taomang(PhimBo, { year: s1 });
    let filml = await taomang(PhimLe, { year: s1 });
    let film;

    if (!filml[page] || filml[page].length < 9) {
      film = [...(filmb[page] || []), ...(filmb[page + 1] || [])];
    } else if (!filmb[page] || filmb[page].length < 9) {
      film = [...(filml[page] || []), ...(filml[page + 1] || [])];
    } else {
      film = [...(filmb[page] || []), ...(filml[page] || [])];
    }
    let leng = filmb.length > filml.length ? filmb.length : filml.length;
    if (filmb.length == 0 || filml.length == 0) {
      return res.status(500).send("Không tìm thấy phim");
    }
    let name = "Năm " + s1;
    res.render("client/pages/search/search", {
      film,
      name,
      leng,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.phim = async (req, res) => {
  try {
    let id = req.params.id;
    let page = parseInt(req.params.num);
    let film, name, leng, filml, filmb;

    if (id === "phimle") {
      filml = await taomang(PhimLe, {});
      film = [...(filml[page] || []), ...(filml[page + 1] || [])];
      name = "Lẻ";
      leng = filml.length;
    } else if (id === "phimbo") {
      filmb = await taomang(PhimBo, {});
      film = [...(filmb[page] || []), ...(filmb[page + 1] || [])];
      name = "Bộ";
      leng = filmb.length;
    }

    res.render("client/pages/search/search", {
      film,
      name,
      leng,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.chieurap = async (req, res) => {
  try {
  } catch (err) {
    console.log(err);
  }
};
let a = async () => {
  try {
    let filml, filmb, leng;
    filml = await taomang(PhimBo, { slug: "nguoi-hung-yeu-duoi" });

    console.log(filml);
  } catch (err) {
    console.log(err);
  }
};
// a();

const {
  PhimLe,
  PhimBo,
  PhimVienTuong,
} = require("../../models/products.model");
const { connectdtb } = require("../../config/database.js");
const { get } = require("mongoose");
connectdtb();

const Fuse = require("fuse.js");

async function getProducts(model, query) {
  const products = await model.find(query);
  return products;
}

const fetchAPI = async (api) => {
  try {
    const response = await fetch(api);
    const data = await response.json();
    return data?.items || data?.data?.items || data || [];
  } catch (error) {
    console.error(`Lỗi khi gọi API: ${api}`, error);
    return [];
  }
};

const toSlug = (str) => {
  return str
    .normalize("NFD") // tách dấu
    .replace(/[\u0300-\u036f]/g, "") // xóa dấu
    .toLowerCase()
    .replace(/\s+/g, "-") // thay space bằng gạch ngang
    .replace(/[^\w\-]+/g, "") // xóa ký tự đặc biệt
    .replace(/\-\-+/g, "-") // xóa nhiều gạch liền nhau
    .replace(/^-+|-+$/g, ""); // xóa gạch đầu/cuối
};

const timPhimTheoTen = async (tenPhim) => {
  const regex = new RegExp(tenPhim, "i");
  const slug = toSlug(tenPhim);
  const slugRegex = new RegExp(slug, "i");

  const phimLe = await PhimLe.find({
    $or: [{ name: { $regex: regex } }, { slug: { $regex: slugRegex } }],
  });

  const phimBo = await PhimBo.find({
    $or: [{ name: { $regex: regex } }, { slug: { $regex: slugRegex } }],
  });

  return [...phimLe, ...phimBo];
};

const timPhimFuzzy = async (tuKhoa, limit) => {
  const options = {
    keys: ["name", "slug", "origin_name"],
    threshold: 0.4, // nhỏ hơn = chính xác hơn
  };
  const dsPhim = [];
  for (let i = 1; i < 5; i++) {
    const a = await fetchAPI(
      `https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(
        tuKhoa
      )}&page=${i}`
    );
    if (a.length < 0) continue;
    dsPhim.push(...a);
  }

  const fuse = new Fuse(dsPhim, options);
  const ketQua = fuse.search(tuKhoa);

  return ketQua.slice(0, limit).map((kq) => kq.item);
};

const timPhimFuzzy2 = async (tuKhoa, limit) => {
  const phimLe = await PhimLe.find();
  const phimBo = await PhimBo.find();
  const dsPhim = [...phimLe, ...phimBo];

  const options = {
    keys: ["name", "slug"],
    threshold: 0.4,
  };

  const fuse = new Fuse(dsPhim, options);
  const ketQua = fuse.search(tuKhoa);

  return ketQua.slice(0, limit).map((kq) => kq.item);
};

module.exports.gener = async (req, res) => {
  try {
    let key = req.params.key;
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
    };

    let filml = await getProducts(PhimLe, { category: theloai[key] });
    let filmb = await getProducts(PhimBo, { category: theloai[key] });
    let film = [...filml, ...filmb];
    if (filmb.length == 0 || filml.length == 0) {
      return res.status(500).send("Không tìm thấy phim");
    }
    let name = theloai[key];
    res.render("client/pages/search/search", {
      film, // vì film là mảng, lấy phần tử đầu tiên
      name,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.country = async (req, res) => {
  try {
    let key = req.params.country;
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
      let filmb = await getProducts(PhimBo, {});
      let filml = await getProducts(PhimLe, {});
      let film = [...filmb, ...filml];
      name = "TỔNG HỢP";
      res.render("client/pages/search/search", {
        film, // vì film là mảng, lấy phần tử đầu tiên
        user: req.session.user,
      });
      return;
    }
    let filmb = await getProducts(PhimBo, { country: countries[key] });
    let filml = await getProducts(PhimLe, { country: countries[key] });
    let film = [...filmb, ...filml];
    name = countries[key];
    if (filmb.length == 0 || filml.length == 0) {
      return res.status(500).send("Không tìm thấy phim");
    }

    res.render("client/pages/search/search", {
      film, // vì film là mảng, lấy phần tử đầu tiên
      name,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.year = async (req, res) => {
  try {
    let key = req.params.year;
    let year = parseInt(key);
    if (isNaN(year)) {
      return res.status(500).send("Không tìm thấy phim");
    }

    if (year === 2007) {
      let filmb = await getProducts(PhimBo, { year: { $lt: 2007 } });
      let filml = await getProducts(PhimLe, { year: { $lt: 2007 } });
      let film = [...filmb, ...filml];
      let name = "Sau 2007";
      res.render("client/pages/search/search", {
        film, // vì film là mảng, lấy phần tử đầu tiên
        name,
        user: req.session.user,
      });
      return;
    }

    let filmb = await getProducts(PhimBo, { year: year });
    let filml = await getProducts(PhimLe, { year: year });
    let film = [...filmb, ...filml];
    if (filmb.length == 0 || filml.length == 0) {
      return res.status(500).send("Không tìm thấy phim");
    }
    let name = "Năm " + year;
    res.render("client/pages/search/search", {
      film, // vì film là mảng, lấy phần tử đầu tiên
      name,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.phim = async (req, res) => {
  try {
    let id = req.params.id;
    let film;
    let name;
    if (id === "phimle") {
      film = await getProducts(PhimLe, {});
      name = "Lẻ";
    } else if (id === "phimbo") {
      film = await getProducts(PhimBo, {});
      name = "Bộ";
    }
    res.render("client/pages/search/search", {
      film, // vì film là mảng, lấy phần tử đầu tiên
      name,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.timkiem = async (req, res) => {
  try {
    let a = req.query.keyword;
    let name = a.split("-").join(" ");
    let film1 = await timPhimFuzzy(name, 25);
    let film2 = await timPhimFuzzy2(name, 25);

    let slugs = film1.map((item) => item.slug);
    film2 = film2.filter((item) => !slugs.includes(item.slug));
    let film = [...film1, ...film2];
    res.render("client/pages/search/search2", {
      film, // vì film là mảng, lấy phần tử đầu tiên
      name,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
  }
};

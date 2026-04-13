/**
 * api.js
 * ──────────────────────────────────────────────────────────────
 * Mô phỏng các API call tới server với độ trễ ngẫu nhiên.
 * Mỗi hàm trả về một Promise<{ data, error }> — không bao giờ
 * throw, giúp caller luôn xử lý được cả trường hợp lỗi.
 *
 * Khi tích hợp server thật, chỉ cần thay phần body của từng hàm
 * bằng fetch() tương ứng — interface không đổi.
 * ──────────────────────────────────────────────────────────────
 */

/* ── Dữ liệu gốc (thay bằng simulateDB thật khi deploy) ── */
const DB = {
  products: [
    //set
    {
      id: 1,
      name: "Lạp xưởng + bò + đậu",
      price: "33.000đ",
      cats: ["best-seller", "set"],
      badge: "hot",
    },
    {
      id: 2,
      name: "Set rong biển",
      price: "33.000đ",
      cats: ["best-seller", "set"],
      url: "../public/img/set-rong-bien.jpg",
      badge: "new",
    },
    {
      id: 4,
      name: "Cơm mắm tép chưng thịt",
      price: "33.000đ",
      cats: ["set"],
      url: "../public/img/com-mam-tep-chung-thit.webp",
    },

    {
      id: 7,
      name: "Cơm trứng tráng thịt bằm",
      price: "33.000đ",
      cats: ["set"],
      url: "../public/img/com-trung-trang-thit-bam.jfif",
    },
    {
      id: 8,
      name: "Cơm đùi gà sốt mắm",
      price: "33.000đ",
      cats: ["set"],
      url: "../public/img/com-dui-ga-sot-mam.jfif",
    },
    {
      id: 9,
      name: "Spaghetti",
      price: "40.000đ",
      cats: ["best-seller", "set"],
      url: "../public/img/spaghetti.jpg",
    },
    {
      id: 10,
      name: "Bún trộn đặc biệt",
      price: "40.000đ",
      cats: ["best-seller", "set"],
      url: "../public/img/bun-tron-dac-biet.jpg",
    },

    //Cơm
    { id: 21, name: "Cơm đảo", price: "33.000đ", cats: ["bed"] },
    { id: 22, name: "Cơm trắng", price: "33.000đ", cats: ["bed"] },
    { id: 23, name: "Cơm đảo (mang về)", price: "33.000đ", cats: ["bed"] },
    { id: 24, name: "Cơm trắng (mang về)", price: "33.000đ", cats: ["bed"] },
    {
      id: 25,
      name: "Cơm thêm (cho suất mang về)",
      price: "10.000đ",
      cats: ["bed"],
    },

    //Topping
    {
      id: 55,
      name: "Lạp xưởng",
      cats: ["topping"],
      url: "../public/img/lap-xuong.jpg",
    },
    {
      id: 56,
      name: "Thịt bò",
      cats: ["topping"],
      url: "../public/img/thit-bo.jpg",
    },
    {
      id: 57,
      name: "Gà xiên",
      cats: ["topping"],
      url: "../public/img/ga-xien.jpg",
    },
    {
      id: 58,
      name: "Đùi gà",
      cats: ["topping"],
      url: "../public/img/dui-ga.jpg",
    },
    {
      id: 59,
      name: "Chả cá",
      cats: ["topping"],
      url: "../public/img/cha-ca.jpg",
    },
    {
      id: 60,
      name: "Thịt băm",
      cats: ["topping"],
      url: "../public/img/thit-bam.jfif",
    },
    {
      id: 61,
      name: "Thịt luộc",
      cats: ["topping"],
      url: "../public/img/thit-luoc.jfif",
    },
    {
      id: 62,
      name: "Thịt kho tàu",
      cats: ["topping"],
      url: "../public/img/thit-kho-tau.jpg",
    },
    {
      id: 63,
      name: "Thịt nướng",
      cats: ["topping"],
      url: "../public/img/thit-nuong.jpg",
    },
    {
      id: 64,
      name: "Trứng ốp la",
      cats: ["topping"],
      url: "../public/img/trung-op-la.webp",
    },
    {
      id: 65,
      name: "Mọc",
      cats: ["topping"],
      url: "../public/img/moc.jfif",
    },
    {
      id: 66,
      name: "Chả nem",
      cats: ["topping"],
      url: "../public/img/cha-nem.jpg",
    },
    {
      id: 67,
      name: "Lườn ngỗng",
      cats: ["topping"],
      url: "../public/img/luon-ngong.jfif",
    },
    {
      id: 68,
      name: "Chả lá lốt",
      cats: ["topping"],
      url: "../public/img/cha-la-lot.jfif",
    },
    {
      id: 69,
      name: "Nem nướng",
      cats: ["topping"],
      url: "../public/img/nem-nuong.jpg",
    },
    {
      id: 70,
      name: "Thịt heo xào mộc nhĩ nấm hương",
      cats: ["topping"],
      url: "../public/img/thit-heo-xao-moc-nhi-nam-huong.jpg",
    },
    {
      id: 71,
      name: "Đậu rán",
      cats: ["topping"],
      url: "../public/img/dau-ran.jpg",
    },
    {
      id: 101,
      name: "Trà đá",
      price: "Miễn phí",
      cats: ["drink"],
      url: "../public/img/tra-da.webp",
      badge: "hot",
      free: true,
    },
    {
      id: 102,
      name: "Coca",
      price: "10.000đ",
      cats: ["drink"],
      url: "../public/img/coca.jpg",
    },
  ],

  categories: [
    { id: "best-seller", label: "Best seller" },
    { id: "set", label: "Set" },
    { id: "bed", label: "Cơm" },
    { id: "topping", label: "Topping" },
    { id: "drink", label: "Đồ uống" },
  ],

  user: {
    id: "u-001",
    lastName: "Nguyễn",
    firstName: "Văn Hùng",
    email: "hung.nguyen@email.com",
    phone: "0912 345 678",
    address: "12 Lý Thường Kiệt, Hoàn Kiếm",
    city: "Hà Nội",
    dob: "1995-08-20",
    tier: "Khách thân thiết",
  },

  loginState: false,

  settings: {
    notif: true,
    sms: false,
    promo: true,
    darkMode: false,
    twoFA: false,
  },

  orders: [
    {
      id: "#DH-20240401",
      date: "01/04/2024",
      status: "pending",
      items: [
        { name: "Bún trộn đặc biệt", qty: 1, price: "70.000đ", emoji: "🍜" },
      ],
      total: "70.000đ",
    },
    {
      id: "#DH-20240315",
      date: "15/03/2024",
      status: "delivered",
      items: [
        { name: "Lẩu xương + bữ + đậu", qty: 1, price: "31.000đ", emoji: "🍲" },
        { name: "Set nem nướng", qty: 2, price: "70.000đ", emoji: "🥩" },
      ],
      total: "171.000đ",
    },
    {
      id: "#DH-20240228",
      date: "28/02/2024",
      status: "delivered",
      items: [
        { name: "Trà sữa trân châu", qty: 2, price: "35.000đ", emoji: "🧋" },
        { name: "Bánh flan trứng", qty: 3, price: "25.000đ", emoji: "🍮" },
      ],
      total: "145.000đ",
    },
    {
      id: "#DH-20240210",
      date: "10/02/2024",
      status: "cancelled",
      items: [{ name: "Set rong biển", qty: 1, price: "33.000đ", emoji: "🍱" }],
      total: "33.000đ",
    },
  ],

  notices: [
    {
      id: 1,
      type: "promo",
      read: false,
      title: "Khuyến mãi tháng 4 — Giảm 20% toàn bộ Set",
      date: "2024-04-05",
      summary: "Trong suốt tháng 4, tất cả các Set món được giảm 20%.",
      content:
        "Chào mừng bạn đến với chương trình khuyến mãi tháng 4!\n\nTừ ngày 01/04 đến 30/04/2024, toàn bộ các Set món trong thực đơn được giảm 20% so với giá niêm yết.\n\n📌 Điều kiện áp dụng:\n• Áp dụng cho tất cả khách hàng, không giới hạn số lần sử dụng\n• Có thể kết hợp cùng topping và đồ uống miễn phí kèm set\n• Không áp dụng đồng thời với các mã giảm giá khác\n\nHãy nhanh tay đặt món để tận hưởng ưu đãi hấp dẫn này nhé!",
    },
    {
      id: 2,
      type: "system",
      read: false,
      title: "Cập nhật chính sách đặt bàn trước",
      date: "2024-04-02",
      summary: "Thời gian đặt tối thiểu nay là 2 giờ trước khi đến.",
      content:
        "Kính gửi Quý khách hàng,\n\nChúng tôi xin thông báo một số thay đổi trong chính sách đặt bàn trước có hiệu lực từ ngày 01/04/2024:\n\n🕐 Thời gian đặt bàn:\n• Tối thiểu: 2 giờ trước giờ đến\n• Tối đa: 7 ngày trước\n\n❌ Chính sách huỷ bàn:\n• Huỷ trước 2 giờ: Miễn phí hoàn toàn\n• Huỷ trong vòng 2 giờ: Tính phí giữ chỗ 20.000đ/bàn",
    },
    {
      id: 3,
      type: "order",
      read: true,
      title: "Đơn hàng #DH-20240315 đã được giao thành công",
      date: "2024-03-15",
      summary: "Đơn hàng của bạn đã được giao thành công.",
      content:
        "Xin chào Nguyễn Văn Hùng,\n\nĐơn hàng #DH-20240315 của bạn đã được giao thành công vào lúc 12:35 ngày 15/03/2024.\n\n🛍 Chi tiết đơn hàng:\n• Lẩu xương + bữ + đậu × 1 — 31.000đ\n• Set nem nướng × 2 — 140.000đ\n• Tổng cộng: 171.000đ\n\nCảm ơn bạn đã chọn Food. Hẹn gặp lại! 🍜",
    },
    {
      id: 4,
      type: "promo",
      read: true,
      title: "Mã FOOD10 — Giảm 10% cho lần đặt hàng tiếp theo",
      date: "2024-03-10",
      summary: "Bạn nhận được mã giảm giá FOOD10. Hạn dùng đến 31/03/2024.",
      content:
        "Cảm ơn bạn đã là khách hàng thân thiết!\n\n🎁 Mã giảm giá: FOOD10\n💰 Mức giảm: 10% trên tổng hoá đơn\n📅 Hạn sử dụng: 31/03/2024\n\n📌 Lưu ý:\n• Áp dụng cho đơn hàng từ 50.000đ trở lên\n• Mỗi tài khoản chỉ dùng được 1 lần",
    },
    {
      id: 5,
      type: "system",
      read: true,
      title: "Thực đơn tháng 3 — Ra mắt món mới",
      date: "2024-03-01",
      summary: "Chúng tôi vừa cập nhật thực đơn tháng 3 với 3 món mới.",
      content:
        "Thực đơn tháng 3 đã chính thức ra mắt!\n\n🍮 Bánh flan trứng — 25.000đ\n🧋 Trà sữa trân châu — 35.000đ\n🍜 Bún trộn đặc biệt — 70.000đ\n\nĐặt hàng ngay để trải nghiệm những hương vị mới nhất!",
    },
    {
      id: 6,
      type: "order",
      read: true,
      title: "Đơn hàng #DH-20240228 đã được xác nhận",
      date: "2024-02-28",
      summary: "Đơn hàng đang được chuẩn bị. Dự kiến phục vụ trong 15-20 phút.",
      content:
        "Xin chào Nguyễn Văn Hùng,\n\nĐơn hàng #DH-20240228 của bạn đã được xác nhận!\n\n⏱ Thời gian dự kiến: 15–20 phút\n📍 Bàn số: 2\n\n🛍 Tổng cộng: 145.000đ\n• Thanh toán: Tiền mặt",
    },
  ],

  cart: null,
};

//make proxy to store in localstorage
const getSafeData = (key) => {
  const rawData = localStorage.getItem(key);

  // Chặn ngay lập tức nếu không có dữ liệu hoặc là chuỗi rỗng
  if (!rawData) return null;

  try {
    return JSON.parse(rawData);
  } catch (e) {
    console.error("Dữ liệu lỗi, không thể mở gói!");
    return null;
  }
};

const localDB = getSafeData("simulateDB");
let targetDB = localDB ? localDB : DB;

const DBHandler = {
  get(target, property) {
    const value = target[property];
    if (typeof value === "object" && value !== null) {
      // Nếu là Object, bọc nó vào một lớp Proxy mới với cùng luật lệ này
      return new Proxy(value, DBHandler);
    }

    return value;
  },

  set(target, property, value) {
    target[property] = value;
    localStorage.setItem("simulateDB", JSON.stringify(targetDB));
    return true;
  },

  deleteProperty(target, property) {
    // if (property === "username") {
    //   console.error("❌ Lỗi: Tuyệt đối không được xóa username!");
    //   return false;
    // }

    delete target[property];
    localStorage.setItem("simulateDB", JSON.stringify(targetDB));
    return true;
  },
};

const simulateDB = new Proxy(targetDB, DBHandler);

/* ── Utility ── */
const delay = (min = 400, max = 900) =>
  new Promise((res) => setTimeout(res, min + Math.random() * (max - min)));

const respond = (data) => ({ data, error: null });
const fail = (msg) => ({ data: null, error: msg });

const deepClone = (val) => JSON.parse(JSON.stringify(val));

/* ════════════════════════════════════════════
   MENU / CATALOG
════════════════════════════════════════════ */

/** GET /products */
export async function fetchProducts() {
  await delay(500, 900);
  return respond(deepClone(simulateDB.products));
}

/** GET /categories */
export async function fetchCategories() {
  await delay(300, 600);
  return respond(deepClone(simulateDB.categories));
}

/* ════════════════════════════════════════════
   AUTH
════════════════════════════════════════════ */

/** POST /auth/login */
export async function login({ phone, password }) {
  await delay(600, 1100);
  if (!phone || !password) return fail("Vui lòng nhập đầy đủ thông tin.");
  if (simulateDB.user.password !== password || simulateDB.user.phone !== phone)
    return fail("Mật khẩu hoặc SĐT không đúng.");
  simulateDB.loginState = true;
  return respond({
    token: "mock-jwt-token-abc123",
    user: deepClone(simulateDB.user),
  });
}

/** POST /auth/register */
export async function register(fields) {
  await delay(700, 1200);
  const { firstName, lastName, email, phone, password } = fields;
  if (!firstName || !lastName || !email || !phone || !password)
    return fail("Vui lòng điền đầy đủ thông tin.");
  if (password.length < 6) return fail("Mật khẩu phải có ít nhất 6 ký tự.");
  simulateDB.user = { ...simulateDB.user, ...fields };
  return respond({ success: true, message: "Đăng ký thành công!" });
}

/** POST /auth/logout */
export async function logout() {
  await delay(500, 900);
  simulateDB.loginState = false;
  return respond({ success: true });
}

/* ════════════════════════════════════════════
   STATUS
════════════════════════════════════════════ */

/** GET loginState */
export async function fetchLoginState() {
  await delay(400, 800);
  return respond(deepClone(simulateDB.loginState));
}

/* ════════════════════════════════════════════
   USER / ACCOUNT
════════════════════════════════════════════ */

/** GET /user/profile */
export async function fetchProfile() {
  await delay(400, 800);
  return respond(deepClone(simulateDB.user));
}

/** PUT /user/profile */
export async function updateProfile(fields) {
  await delay(500, 900);
  if (fields?.delete === true) {
    targetDB = DB;
    localStorage.removeItem("simulateDB");
  } else simulateDB.user = { ...simulateDB.user, ...fields };
  return respond({ success: true, user: deepClone(simulateDB.user) });
}

/* ════════════════════════════════════════════
   SETTING
════════════════════════════════════════════ */

/** GET /settings */
export async function fetchSettings() {
  await delay(400, 800);
  return respond(deepClone(simulateDB.settings));
}

/** PUT /settings */
export async function updateSettings(fields) {
  await delay(500, 900);
  simulateDB.settings = { ...simulateDB.settings, ...fields };
  return respond({
    success: true,
    settings: deepClone(simulateDB.settings),
  });
}

/* ════════════════════════════════════════════
   CART
════════════════════════════════════════════ */

/** GET /cart */
export async function fetchCart() {
  await delay(400, 800);
  return respond(deepClone(simulateDB.cart));
}

/** PUT /cart */
export async function updateCart(product) {
  await delay(500, 900);
  simulateDB.cart = { ...simulateDB.cart, product };
  return respond({ success: true, cart: deepClone(simulateDB.cart) });
}
/* ════════════════════════════════════════════
   ORDERS
════════════════════════════════════════════ */

/** GET /orders */
export async function fetchOrders() {
  await delay(500, 1000);
  return respond(deepClone(simulateDB.orders));
}

/** POST /orders */
export async function placeOrder(payload) {
  await delay(700, 1300);
  const newOrder = {
    id: "#DH-" + Date.now().toString().slice(-8),
    date: new Date().toLocaleDateString("vi-VN"),
    status: "pending",
    items: payload.items,
    total: payload.total,
  };
  simulateDB.orders.unshift(newOrder);
  return respond({ success: true, order: deepClone(newOrder) });
}

/** PATCH /orders/:id/cancel — huỷ đơn hàng đang chờ */
export async function cancelOrder(id) {
  await delay(500, 900);
  const order = simulateDB.orders.find((o) => o.id === id);
  if (!order) return fail("Không tìm thấy đơn hàng.");
  if (order.status !== "pending")
    return fail("Chỉ có thể huỷ đơn hàng đang chờ xử lý.");
  order.status = "cancelled";
  return respond({ success: true, order: deepClone(order) });
}

/** PATCH /orders/:id/confirm-delivery — xác nhận đã nhận hàng */
export async function confirmDelivery(id) {
  await delay(500, 900);
  const order = simulateDB.orders.find((o) => o.id === id);
  if (!order) return fail("Không tìm thấy đơn hàng.");
  if (order.status !== "pending")
    return fail("Đơn hàng không ở trạng thái có thể xác nhận.");
  order.status = "delivered";
  return respond({ success: true, order: deepClone(order) });
}

/* ════════════════════════════════════════════
   NOTICES
════════════════════════════════════════════ */

/** GET /notices */
export async function fetchNotices() {
  await delay(400, 800);
  return respond(deepClone(simulateDB.notices));
}

/** PATCH /notices/:id/read */
export async function markNoticeRead(id) {
  await delay(150, 300);
  const n = simulateDB.notices.find((n) => n.id === id);
  if (n) n.read = true;
  return respond({ success: true });
}

/** PATCH /notices/read-all */
export async function markAllNoticesRead() {
  await delay(200, 400);
  simulateDB.notices.forEach((n) => {
    n.read = true;
  });
  return respond({ success: true });
}

/* ════════════════════════════════════════════
   PROMO CODES
════════════════════════════════════════════ */

/** POST /promo/validate */
export async function validatePromo(code) {
  await delay(400, 800);
  const promos = { FOOD10: { discount: 0.1, label: "Giảm 10%" } };
  const promo = promos[code?.toUpperCase()];
  if (!promo) return fail("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
  return respond(promo);
}

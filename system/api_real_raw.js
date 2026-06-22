/* ════════════════════════════════════════════
   MENU / CATALOG - PUBLIC
════════════════════════════════════════════ */

/** GET /products */
export async function fetchProducts() {
  const res = await fetch(BASE_URL + "/api/v1/product/view?page=0&size=4", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });
  if (!res.ok) {
    const errorText = await res.json();
    console.log(errorText);
    return fail(`Lỗi Server [${res.status}]: ${errorText}`);
  }
  const rawdata = await res.json();
  console.log(rawdata);
  if (!rawdata) return fail("not find data");
  const data = rawdata.content;
  console.log(data);
  return { data, error: null };
}

/** GET /categories */
export async function fetchCategories() {
  const res = await fetch(BASE_URL + "/api/v1/category/view/all", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    return fail(`Lỗi Server [${res.status}]: ${errorText}`);
  }
  const rawdata = await res.json();
  if (!rawdata) return fail("not find data");
  const data = rawdata;
  return { data, error: null };
}

/* ════════════════════════════════════════════
   AUTH
════════════════════════════════════════════ */

/** POST /user/login */
export async function login({ username, password }) {
  if (!username || !password) return fail("Vui lòng nhập đầy đủ thông tin.");
  const res = await fetch(BASE_URL + "/api/v1/user/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      login_id: username,
      password: password,
    }),
  });
  if (!res.ok) {
    const errorText = await res.json();
    console.log(errorText);
    return fail(`Lỗi Server [${res.status}]: ${errorText}`);
  }
  const data = await res.json();
  if (!data) return fail("not find data");
  console.log(data);
  token = data.jwt;

  if (token) {
    // 4. Lưu Token vào localStorage để dùng cho các request sau này
    console.log(token);
    localStorage.setItem("access_token", token);

    Mock_Database.simulateDB.loginState = true;
    return respond({
      token: token,
      user: Mock_Database.deepClone(data),
    });
  } else {
    return fail("Server không trả về mã token");
  }
}

/** POST /user/register */
export async function register(fields) {
  const { firstName, lastName, email, phone, password } = fields;
  if (!firstName || !lastName || (!email && !phone) || !password)
    return fail("Vui lòng điền đầy đủ thông tin.");

  if (password.length < 6) return fail("Mật khẩu phải có ít nhất 6 ký tự.");

  const res = await fetch(BASE_URL + "/api/v1/user/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      full_name: firstName + lastName,
      username: "user_" + phone,
      phone: phone,
      email: email,
      password: password,
    }),
  });
  if (!res.ok) {
    const errorText = await res.json();
    console.log(errorText);
    return fail(`Lỗi Server [${res.status}]: ${errorText}`);
  }
  const data = await res.json();
  // console.log(da)
  if (!data) return fail("not find data");
  console.log(data);
  token = data.jwt;

  if (token) {
    // 4. Lưu Token vào localStorage để dùng cho các request sau này
    console.log(token);
    localStorage.setItem("access_token", token);
    return respond({
      token: token,
      user: Mock_Database.deepClone(data),
    });
  } else {
    return fail("Server không trả về mã token");
  }
}

/** POST /user/logout */
// export async function logout() {
//   const res = await fetch("http://10.245.107.123:8080/api/v1/user/login", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ loginState: false }),
//   });
//   if (!res.ok) {
//     const errorText = await res.text();
//     return fail(`Lỗi Server [${res.status}]: ${errorText}`);
//   }
//   if (!data) return fail("not find data");
//   const data = await res.json();
//   console.log(data);
//   Mock_Database.simulateDB.loginState = false;
//   return respond({ success: true });
// }

export async function logout() {
  await Mock_Database.delay(500, 900);
  Mock_Database.simulateDB.loginState = false;
  return respond({ success: true });
}

/* ════════════════════════════════════════════
   STATUS
════════════════════════════════════════════ */

/** GET loginState */

export async function fetchLoginState() {
  if (token) {
    const res = await fetch(BASE_URL + "/api/v1/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ token: token }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      return fail(`Lỗi Server [${res.status}]: ${errorText}`);
    }
    const data = await res.json();
    if (!data) return fail("not find data");
    console.log(data);
    return { data, error: null };
  }
  return { loginState: false, error: null };
}

/* ════════════════════════════════════════════
   USER / ACCOUNT
════════════════════════════════════════════ */

/** GET /user/profile */
export async function fetchProfile() {
  const response = await fetch(BASE_URL + "/api/v1/user/profile", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  console.log(await response.json());
  return respond(data);
}

/** PUT /user/profile */
export async function updateProfile(fields) {
  const res = await fetch(BASE_URL + "/api/v1/user/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fields),
  });
  if (!res.ok) {
    const errorText = await res.text();
    return fail(`Lỗi Server [${res.status}]: ${errorText}`);
  }
  if (!data) return fail("not find data");
  const data = await res.json();
  console.log(data);
  return respond(await fetchProfile());
}

/* ════════════════════════════════════════════
   SETTING
════════════════════════════════════════════ */

/** GET /settings */
export async function fetchSettings() {
  let resdata;
  await fetch(BASE_URL + "/api/v1/user/settings", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  })
    .then((res) => {
      if (res.ok) return res.json();
      // else throw new Error("Ngu");
    })
    .then((data) => {
      resdata = data;
      console.log(data);
    })
    .catch((ex) => console.log(ex));
  return respond(resdata);
}

/** PUT /settings */
export async function updateSettings(fields) {
  const res = await fetch(BASE_URL + "/api/v1/user/settings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fields),
  });
  if (!res.ok) {
    const errorText = await res.text();
    return fail(`Lỗi Server [${res.status}]: ${errorText}`);
  }
  const data = await res.json();
  if (!data) return fail("not find data");
  console.log(data);
  return respond(await fetchSettings());
}

/* ════════════════════════════════════════════
   CART
════════════════════════════════════════════ */

/** GET /cart — lấy giỏ hàng đã lưu */
// export async function fetchCart() {
//   let resdata;
//   await fetch(BASE_URL + "/api/v1/user/cart", {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: "Bearer " + token,
//     },
//   })
//     .then((res) => {
//       if (res.ok) return res.json();
//       // else throw new Error("Ngu");
//     })
//     .then((data) => {
//       resdata = data;
//       console.log(data);
//     })
//     .catch((ex) => console.log(ex));
//   return respond(resdata);
// }

export async function fetchCart() {
  await Mock_Database.delay(300, 600);
  return Mock_Database.respond(
    Mock_Database.deepClone(Mock_Database.simulateDB.cart),
  );
}

/*
 * PUT /cart — ghi đè toàn bộ giỏ hàng
 *  @param {{ [productId: number]: number }} cartData
 */

// export async function updateCart(cartData) {
//   const res = await fetch(BASE_URL + "/api/v1/user/cart", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(cartData),
//   });
//   if (!res.ok) {
//     const errorText = await res.text();
//     return fail(`Lỗi Server [${res.status}]: ${errorText}`);
//   }
//   const data = await res.json();
//   if (!data) return fail("not find data");
//   console.log(data);
//   return respond(await fetchCart());
// }

export async function updateCart(cartData) {
  await Mock_Database.delay(200, 500);
  Mock_Database.simulateDB.cart = Mock_Database.deepClone(cartData);
  return Mock_Database.respond({
    success: true,
    cart: Mock_Database.deepClone(Mock_Database.simulateDB.cart),
  });
}

/* ════════════════════════════════════════════
   ORDERS
════════════════════════════════════════════ */

/** GET /orders */
// export async function fetchOrders() {
//   let resdata;
//   await fetch(BASE_URL + "/api/v1/user/orders", {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: "Bearer " + token,
//     },
//   })
//     .then((res) => {
//       if (res.ok) return res.json();
//       // else throw new Error("Ngu");
//     })
//     .then((data) => {
//       resdata = data;
//       console.log(data);
//     })
//     .catch((ex) => console.log(ex));
//   return respond(resdata);
// }

export async function fetchOrders() {
  await Mock_Database.delay(500, 1000);
  return Mock_Database.respond(
    Mock_Database.deepClone(Mock_Database.simulateDB.orders),
  );
}

/** POST /orders */
export async function placeOrder(payload) {
  await Mock_Database.delay(700, 1300);
  const newOrder = {
    id: "#DH-" + Date.now().toString().slice(-8),
    date: new Date().toLocaleDateString("vi-VN"),
    status: payload.payment_success ? "pending" : "waiting",
    payment: payload.payment,
    items: payload.items,
    total: payload.total,
  };
  Mock_Database.simulateDB.orders.unshift(newOrder);
  return respond({ success: true, order: Mock_Database.deepClone(newOrder) });
}

/** PATCH /orders/:id/cancel — huỷ đơn hàng đang chờ */
export async function cancelOrder(id) {
  await Mock_Database.delay(500, 900);
  const order = Mock_Database.simulateDB.orders.find((o) => o.id === id);
  if (!order) return fail("Không tìm thấy đơn hàng.");
  if (order.status !== "pending" && order.status !== "waiting")
    return fail("Chỉ có thể huỷ đơn hàng đang chờ xử lý.");
  order.status = "cancelled";
  return respond({ success: true, order: Mock_Database.deepClone(order) });
}

/** PATCH /orders/:id/confirm-delivery — xác nhận đã nhận hàng */
export async function confirmDelivery(id) {
  await Mock_Database.delay(500, 900);
  const order = Mock_Database.simulateDB.orders.find((o) => o.id === id);
  if (!order) return fail("Không tìm thấy đơn hàng.");
  if (order.status !== "pending")
    return fail("Đơn hàng không ở trạng thái có thể xác nhận.");
  order.status = "delivered";
  return respond({ success: true, order: Mock_Database.deepClone(order) });
}

/* ════════════════════════════════════════════
   NOTICES
════════════════════════════════════════════ */

/** GET /notices */
export async function fetchNotices() {
  await Mock_Database.delay(400, 800);
  return respond(Mock_Database.deepClone(Mock_Database.simulateDB.notices));
}

/** PATCH /notices/:id/read */
export async function markNoticeRead(id) {
  await Mock_Database.delay(150, 300);
  const n = Mock_Database.simulateDB.notices.find((n) => n.id === id);
  if (n) n.read = true;
  return respond({ success: true });
}

/** PATCH /notices/read-all */
export async function markAllNoticesRead() {
  await Mock_Database.delay(200, 400);
  Mock_Database.simulateDB.notices.forEach((n) => {
    n.read = true;
  });
  return respond({ success: true });
}

/* ════════════════════════════════════════════
   PROMO CODES
════════════════════════════════════════════ */

/** POST /promo/validate */
export async function validatePromo(code) {
  await Mock_Database.delay(400, 800);
  const promos = { FOOD10: { discount: 0.1, label: "Giảm 10%" } };
  const promo = promos[code?.toUpperCase()];
  if (!promo) return fail("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
  return respond(promo);
}

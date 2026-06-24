/**
 *
 */
import { Mock_Database } from "./api_mock";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export let BASE_URL =
  localStorage.getItem("url") ??
  "https://pending-dem-personals-residence.trycloudflare.com";

/** Số sản phẩm tối đa mỗi lần tải */
export const PRODUCTS_PAGE_SIZE = 10;

/** Thời gian sống của token (ms) — dùng để đặt auto-logout timer */
export const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 phút

/** Mã lỗi đặc biệt khi JWT hết hạn — DataContext lắng nghe để auto-logout */
export const JWT_EXPIRED = "JWT_EXPIRED";

/* ════════════════════════════════════════════
   TOKEN STORE (module-level)
════════════════════════════════════════════ */

let _token = null;
let _expiresAt = null;

export const setToken = ({ token, expiresAt }) => {
  _token = token;
  _expiresAt = expiresAt;
};
export const clearToken = () => {
  _token = null;
  _expiresAt = null;
};
export const getToken = () => _token;
export const getExpiresAt = () => _expiresAt;

/* ════════════════════════════════════════════
   HTTP HELPERS
════════════════════════════════════════════ */

const respond = (data) => ({ data, error: null });
const fail = (msg) => ({ data: null, error: msg });

/** Header dùng chung cho mọi request */
const baseHeaders = () => ({
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true",
});

/** Header có kèm Authorization token */
const authHeaders = () => ({
  ...baseHeaders(),
  ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
});

const parseServerError = async (res) => {
  let body = null;
  try {
    body = await res.json();
  } catch (error) {
    /* body không phải JSON */
    console.log("parseServerError_log: " + error);
  }

  // Phát hiện JWT hết hạn — trả mã đặc biệt để DataContext auto-logout
  if (
    res.status === 401 &&
    (body?.message === "Jwt Expired" || body?.details?.includes("JWT expired"))
  ) {
    return fail(JWT_EXPIRED);
  }

  // Lỗi server khác
  const message = body?.message ?? body?.error ?? `Lỗi server [${res.status}]`;
  return fail(message);
};

const safeFetch = async (url, options) => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.log(url + " phát hiện lỗi res");
      return parseServerError(res);
    }
    const data = await res.json();
    console.log(`dữ liệu từ  ${url}  là: `);
    console.log(data);
    return respond(data);
  } catch (err) {
    return fail(`Lỗi kết nối: ${err.message}`);
  }
};

const SocketNotice = [];
/* ════════════════════════════════════════════
   AUTH — PUBLIC
════════════════════════════════════════════ */

/** POST /auth/login */
export async function login({ username, password }) {
  if (!username || !password) return fail("Vui lòng nhập đầy đủ thông tin.");
  // console.log("đã thực hiện login");
  return safeFetch(`${BASE_URL}/api/v1/user/login`, {
    method: "POST",
    headers: baseHeaders(),
    body: JSON.stringify({
      login_id: username,
      password: password,
    }),
  });
}

/** POST /auth/register */
export async function register(fields) {
  const { firstName, lastName, email, phone, password } = fields;
  if (!firstName || !lastName || (!email && !phone) || !password)
    return fail("Vui lòng điền đầy đủ thông tin.");

  if (password.length < 6) return fail("Mật khẩu phải có ít nhất 6 ký tự.");
  console.log("đã thực hiện register");
  return safeFetch(`${BASE_URL}/api/v1/user/register`, {
    method: "POST",
    headers: baseHeaders(),
    body: JSON.stringify({
      full_name: firstName + lastName,
      username: "user_" + phone,
      phone: phone,
      email: email,
      password: password,
    }),
  });
}

/**
 * fetchLoginState — kiểm tra token còn hạn trên server khi app reload.
 * Gọi một lần duy nhất lúc DataProvider mount.
 *
 * Nếu _token chưa có (chưa đăng nhập) → trả { loginState: false }
 * Nếu server xác nhận hợp lệ → trả { loginState: true, expiresAt }
 * Nếu token hết hạn (401) → trả lỗi JWT_EXPIRED để DataContext xử lý
 */
export async function fetchLoginState() {
  if (!_token) {
    // console.log("Không có token sẵn trong máy. Bỏ qua");
    return { data: { loginState: false }, error: null };
  }
  // console.log("đang kiểm tra token");
  const res = await fetch(`${BASE_URL}/api/v1/token`, {
    method: "POST",
    headers: baseHeaders(),
    body: _token,
  });

  if (!res.ok) return parseServerError(res);

  const data = await res.json();
  // console.log("Fetch login data : ", data);
  if (!data) return fail("Không nhận được dữ liệu từ server.");
  return respond(data); // Server trả: { loginState: true, expiresAt }
}

/* ════════════════════════════════════════════
   CATALOG — PUBLIC (không cần token)
════════════════════════════════════════════ */

export async function fetchProducts({ category_id }) {
  return safeFetch(`${BASE_URL}/api/v1/category/view?id=${category_id}`, {
    method: "GET",
    headers: baseHeaders(),
  });
  // Server trả: { content: Product[], totalPages, totalElements }
}

/** GET /categories — danh sách danh mục (public) */
export async function fetchCategories() {
  return safeFetch(`${BASE_URL}/api/v1/category/view/all`, {
    method: "GET",
    headers: baseHeaders(),
  });
}

/* ════════════════════════════════════════════
   PROTECTED — tất cả cần token hợp lệ
════════════════════════════════════════════ */

/** GET /user/profile */
export async function fetchProfile() {
  return safeFetch(`${BASE_URL}/api/v1/user/profile`, {
    method: "GET",
    headers: authHeaders(),
  });
}

/** PUT /user/profile */
export async function updateProfile(fields) {
  const endpoint = fields.password
    ? "password"
    : fields.delete
      ? "?confirm=true"
      : "profile";
  return safeFetch(`${BASE_URL}/api/v1/user/${endpoint}`, {
    method: fields.delete ? "DELETE" : "PUT",
    headers: authHeaders(),
    body: JSON.stringify(fields),
  });
}

/** GET /user/settings */
export async function fetchSettings() {
  return safeFetch(`${BASE_URL}/api/v1/user/settings`, {
    method: "GET",
    headers: authHeaders(),
  });
}

/** PUT /user/settings */
export async function updateSettings(patch) {
  return safeFetch(`${BASE_URL}/api/v1/user/settings`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(patch),
  });
}

/** PUT /user/password */
export async function updatePassword(patch) {
  // console.log("changePasswffdford: ", patch);
  return safeFetch(`${BASE_URL}/api/v1/user/password`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(patch),
  });
}

/** DELETE /user */
export async function disableUser(patch) {
  return safeFetch(`${BASE_URL}/api/v1/user?confirm=true`, {
    method: "DELETE",
    headers: authHeaders(),
    body: JSON.stringify(patch),
  });
}

/** GET /cart */
export async function fetchCart() {
  const { data, error } = await safeFetch(`${BASE_URL}/api/v1/cart/view`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (error) return respond(data.content);
  // console.log("datacart", data);
  const formattedCart = data.content.reduce((acc, item) => {
    acc[item.product.id] = {
      id: item.id,
      product_id: item.product,
      quantity: item.quantity,
    };
    return acc;
  }, {});
  const productCart = data.content.map((item) => item.product);

  return respond({ formattedCart, productCart });
}

/** PUT /cart */
export async function updateCart(cartData, mode) {
  console.log("CARTDATA: ", cartData);
  const endpoint = mode == "del" ? `delete?id=${cartData.id}` : "add";
  const method = mode == "del" ? "DELETE" : "POST";
  return safeFetch(`${BASE_URL}/api/v1/cart/${endpoint}`, {
    method: method,
    headers: authHeaders(),
    body: JSON.stringify({
      product_id: cartData.product_id,
      quantity: cartData.quantity,
    }),
  });
}

/** GET /orders */
export async function fetchOrders(status, page = 0) {
  // console.log("STATUSORDER:: ", status);
  const state = status === "pending" ? "unfinished" : "finished";
  const { data, error } = await safeFetch(
    `${BASE_URL}/api/v1/order/view/${state}?page=${page}&size=10`,
    {
      method: "GET",
      headers: authHeaders(),
    },
  );
  if (error) return fail("lỗi từ fetchOrders");
  const updateOrderItems = await Promise.all(
    data.content.map(async (order) => {
      const { data: itemsData, error } = await safeFetch(
        `${BASE_URL}/api/v1/order/view?id=${order.id}`,
        {
          method: "GET",
          headers: authHeaders(),
        },
      );
      if (error) return { ...order, items: [] };
      return { ...order, items: itemsData.order_items };
    }),
  );
  const updatedData = {
    ...data,
    content: updateOrderItems,
  };
  // console.log("ORDERSDATA: ", updatedData);
  return respond(updatedData);
}

/** GET QR for payment */
export async function fetchQR(id) {
  return safeFetch(`${BASE_URL}/api/v1/order/pay?id=${id}`, {
    method: "GET",
    headers: authHeaders(),
  });
}

/** POST invoice request */

// export async function invoiceRequest(id) {
//   return safeFetch(`${BASE_URL}/api/v1/order/invoice?id=${id}`, {
//     method: "GET",
//     headers: authHeaders(),
//   });
// }

/** POST /orders */
export async function placeOrder(payload) {
  return safeFetch(`${BASE_URL}/api/v1/order/create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

/** PATCH /orders/:id/cancel */
export async function cancelOrder(id) {
  return safeFetch(`${BASE_URL}/api/v1/order/cancel?id=${id}&confirm=true`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

/** PATCH /orders/:id/confirm-delivery */
export async function confirmDelivery(id) {
  return safeFetch(`${BASE_URL}/api/v1/order/${id}/confirm-delivery`, {
    method: "PATCH",
    headers: authHeaders(),
  });
}

/**fetch notices */

export async function fetchNotices() {
  return safeFetch(`${BASE_URL}/api/v1/notice`, {
    method: "GET",
    headers: authHeaders(),
  });
}

//dùng websocket để lấy notice
// Biến cục bộ cấp module (Singleton)
let stompClient = null;
let onNoticeCallback = null; // Lưu trữ hàm callback từ React

/**
 * Khởi tạo WebSocket. Chỉ chạy khi token hợp lệ.
 * @param {string} token - JWT Token
 * @param {string} wsUrl - Địa chỉ WebSocket server
 * @param {function} onNotice - Hàm callback để truyền dữ liệu về React
 */

export const initWebSocket = (token, onNotice) => {
  // 1. Kiểm tra điều kiện token
  if (!token) {
    // console.log("Token null: Ngắt kết nối hoặc từ chối khởi tạo.");
    disconnectWebSocket();
    return;
  }

  // Cập nhật hàm callback mới nhất
  onNoticeCallback = onNotice;

  // 2. Dọn dẹp kết nối cũ nếu hàm được gọi lại với token mới
  if (stompClient && stompClient.active) {
    stompClient.deactivate();
  }

  // 3. Khởi tạo Client mới
  stompClient = new Client({
    webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    debug: (str) => {
      console.log("STOMP: ", str);
    },

    onConnect: () => {
      // console.log("Connected");
      // Đăng ký các kênh và sử dụng callback để đẩy dữ liệu về Context
      stompClient.subscribe("/topic/global", (msg) => {
        // console.log("GLOBAL MSG", msg);
        if (onNoticeCallback) onNoticeCallback("global", msg.body);
      });

      stompClient.subscribe("user/topic/order", (msg) => {
        if (onNoticeCallback) onNoticeCallback("order", msg.body);
      });

      stompClient.subscribe("user/topic/pay", (msg) => {
        if (onNoticeCallback) onNoticeCallback("payment", msg.body);
      });
    },

    onStompError: (frame) => {
      // console.error("Lỗi giao thức STOMP:", frame.headers["message"]);
    },
  });

  // 4. Kích hoạt kết nối
  stompClient.activate();
};

/**
 * Ngắt kết nối chủ động (sử dụng khi đăng xuất hoặc unmount)
 */
export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
};
/** POST /promo/validate */
export async function validatePromo(code) {
  return safeFetch(`${BASE_URL}/api/v1/promo/validate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ code }),
  });
}

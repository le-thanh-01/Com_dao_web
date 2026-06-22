const USE_MOCK_API = false;
// const USE_MOCK_API =
//   import.meta.env.VITE_USE_MOCK_API === "true";

import * as realApi from "./api_real";
import * as mockApi from "./api_mock";

const api = new Proxy(USE_MOCK_API ? mockApi : realApi, {
  get(target, prop) {
    if (!(prop in target)) {
      return () => {
        console.warn(
          `[API Warning]: Hàm '${prop}' không tồn tại trong module API hiện tại.`,
        );
        return Promise.reject(new Error(`Missing API implementation: ${prop}`));
      };
    }
    return target[prop];
  },
});

export const {
  fetchProducts,
  fetchCategories,
  fetchNotices,
  fetchLoginState,
  fetchSettings,
  fetchCart,
  fetchOrders,
  placeOrder,
  fetchProfile,
  updateProfile,
  updateSettings,
  updateCart,
  markNoticeRead,
  markAllNoticesRead,
  cancelOrder,
  confirmDelivery,
  register,
  login,
  logout,
  setToken,
  clearToken,
  getToken,
  JWT_EXPIRED,
  validatePromo,
  initWebSocket,
  disconnectWebSocket,
  fetchQR,
  updatePassword,
  disableUser,
} = api;

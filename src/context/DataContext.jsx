/**
 * DataContext.jsx
 * ──────────────────────────────────────────────────────────────
 * Cung cấp dữ liệu từ server (qua api.js) cho toàn bộ app.
 * Mỗi resource có 3 trạng thái riêng: { data, loading, error }.
 *
 * Hook tiện ích:
 *   useProducts()    → { products, loading, error }
 *   useCategories()  → { categories, loading, error }
 *   useFooterLinks() → { footerLinks, loading, error }
 *   useNotices()     → { notices, loading, error, markRead, markAllRead }
 *   useOrders()      → { orders, pendingOrders, historyOrders, loading, error }
 *   useUserProfile() → { user, loading, error, updateProfile }
 *
 *  * 1. [MỚI] fetchLoginState() gọi server khi app reload để kiểm tra
 *    token còn hạn — không chỉ đọc sessionStorage.
 *
 *    2. [MỚI] Products được fetch theo từng category đang hiển thị
 *    (fetchProductsByCategory), tối đa PRODUCTS_PAGE_SIZE = 10 mỗi lần.
 *    useProductsByCategory(category) refetch khi category thay đổi.
 *
 *    3. [MỚI] withTokenGuard bắt lỗi JWT_EXPIRED từ bất kỳ call nào
 *    → hiển thị toast + doLogout() + trả về để App có thể navigate.
 *
 * ──────────────────────────────────────────────────────────────
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  fetchProducts as fetchProductsByCategory,
  fetchCategories,
  fetchNotices,
  fetchLoginState as apiFetchLoginState,
  fetchSettings,
  fetchCart,
  fetchOrders,
  fetchProfile,
  updateProfile,
  updateSettings,
  updateCart,
  markNoticeRead,
  markAllNoticesRead,
  cancelOrder,
  confirmDelivery,
  register,
  login as apiLogin,
  setToken,
  clearToken,
  getToken,
  JWT_EXPIRED,
  initWebSocket,
  disconnectWebSocket,
  fetchQR,
  updatePassword,
  disableUser,
} from "../../system/api";
/* ── helpers ── */
const initial = { data: null, loading: true, error: null };

const useResource = (fetcher, loginState = true) => {
  const [state, setState] = useState(initial);

  useEffect(() => {
    if (!loginState) return;

    let alive = true;
    setState(initial);
    fetcher().then(({ data, error }) => {
      if (!alive) return;
      setState({ data, loading: false, error });
    });
    return () => {
      alive = false;
    };
  }, [loginState]); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = useCallback(() => {
    if (!loginState) return;

    setState(initial);
    fetcher().then(({ data, error }) => {
      setState({ data, loading: false, error });
    });
  }, [loginState]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, refetch };
};

/* ════════════════════════════════════════════
   CONTEXT
════════════════════════════════════════════ */
const DataContext = createContext(null);

export function DataProvider({ children }) {
  /* ── Toast state — hiển thị khi JWT hết hạn ── */
  const [toast, setToast] = useState(null); // { message, type }
  const showToast = useCallback((message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  /* ── login and logout ── */

  /* ── Auth state ────────────────────────────────────────────────────────
     Khôi phục token từ sessionStorage vào api.js module TRƯỚC khi render,
     để các resource fetch (nếu loginState=true) có token ngay lập tức.
  ───────────────────────────────────────────────────────────────────── */
  const [loginState, setLoginState] = useState(() => {
    const raw = sessionStorage.getItem("auth");
    if (!raw) return false;
    try {
      const { token } = JSON.parse(raw);
      if (!token) {
        sessionStorage.removeItem("auth");
        return false;
      }
      setToken({ token }); // khôi phục vào api.js
      return true;
    } catch {
      return false;
    }
  });

  const doLogout = useCallback(() => {
    clearToken();
    sessionStorage.removeItem("auth");
    setLoginState(false);
  }, []);

  useEffect(() => {
    // if (!loginState) return; // chưa đăng nhập, không cần check

    apiFetchLoginState().then(({ data, error }) => {
      if (error?.error === JWT_EXPIRED || !data) {
        // Token không còn hợp lệ phía server
        showToast("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        doLogout();
        return;
      }
    });
  }, []); // eslint-disable-line — chỉ chạy một lần khi mount

  const login = useCallback(async (credentials) => {
    const { data, error } = await apiLogin(credentials);
    if (error) return { data, error };
    // console.log("OURDATA: ", data.jwt);
    const token = data.jwt;
    // console.log("OUTTOKENNNN: ", token);
    setToken({ token: token, expiresAt: "ex" });
    sessionStorage.setItem(
      "auth",
      JSON.stringify({ token: token, expiresAt: "ex" }),
    );
    setLoginState(true);
    return { data, error: null };
  }, []);
  const logout = useCallback(() => doLogout(), [doLogout]);

  const isLoggedIn = !!loginState;
  // console.log("isLoggenIn: " + isLoggedIn);
  /**
   * withTokenGuard — bắt JWT_EXPIRED từ mọi protected call.
   * Nếu nhận được JWT_EXPIRED:
   *   1. Hiển thị toast cảnh báo
   *   2. Tự động logout
   *   3. Trả về lỗi để caller (nếu cần) có thể navigate
   */
  const withTokenGuard = useCallback(
    async (fn) => {
      const result = await fn();
      if (result?.error === JWT_EXPIRED) {
        showToast("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        doLogout();
      }
      return result;
    },
    [doLogout, showToast],
  );
  /* ── Products theo category với pagination ───────────────────────────
     State mỗi category:
       items:       Product[]  — danh sách tích luỹ qua các trang
       page:        number     — trang hiện tại (0-based)
       totalPages:  number     — tổng số trang server trả về
       hasMore:     boolean    — còn trang tiếp theo không
       loading:     boolean    — đang fetch trang đầu (category vừa đổi)
       loadingMore: boolean    — đang fetch thêm (bấm "Xem thêm")
       error:       string|null
  ────────────────────────────────────────────────────────────────────── */
  const CATEGORY_INITIAL = {
    items: [],
    loading: false,
    error: null,
  };
  const [productState, setProductState] = useState({
    byCategory: {}, // { [categoryId]: CATEGORY_INITIAL }
    active: null,
  });

  /**
   * allProducts — Map<id, Product> tích luỹ mọi sản phẩm đã fetch qua mọi category.
   * Tách riêng khỏi byCategory để CartProvider có thể dùng mà không ảnh hưởng grid.
   * Dùng useRef (không phải useState) vì CartProvider đọc trực tiếp qua useMemo —
   * không cần trigger re-render riêng, quota tự recalc khi cart thay đổi.
   */
  const allProductsMap = useRef(new Map()); // Map<id, Product>

  /** Trả về snapshot Array để truyền vào CartProvider */
  const [allProductsArr, setAllProductsArr] = useState([]);

  /** Merge sản phẩm mới vào allProductsMap và cập nhật allProductsArr */
  const _mergeProducts = useCallback((newItems) => {
    let changed = false;
    newItems.forEach((p) => {
      if (!allProductsMap.current.has(p.id)) {
        allProductsMap.current.set(p.id, p);
        changed = true;
      }
    });
    if (changed) {
      setAllProductsArr([...allProductsMap.current.values()]);
    }
  }, []);

  /** Cập nhật state của một category cụ thể */
  const _updateCat = useCallback(
    (category, patch) =>
      setProductState((prev) => ({
        ...prev,
        byCategory: {
          ...prev.byCategory,
          [category]: {
            ...(prev.byCategory[category] ?? CATEGORY_INITIAL),
            ...patch,
          },
        },
      })),
    [],
  );

  /**
   * fetchProductsForCategory — fetch từ đầu (page 0) khi đổi category.
   * Reset danh sách, giữ lại state cũ trong khi loading để tránh flicker.
   */
  const fetchProductsForCategory = useCallback(
    async (category_id) => {
      setProductState((prev) => ({
        ...prev,
        active: category_id,
        byCategory: {
          ...prev.byCategory,
          [category_id]: {
            ...(prev.byCategory[category_id] ?? CATEGORY_INITIAL),
            loading: true,
            error: null,
          },
        },
      }));
      const { data, error } = await fetchProductsByCategory({
        category_id,
      });

      if (error) {
        _updateCat(category_id, { loading: false, error });
        return;
      }

      // Server trả { content, totalPages, totalElements, number }
      const items = data?.products ?? (Array.isArray(data) ? data : []);

      _updateCat(category_id, {
        items,
        loading: false,
        error: null,
      });
      _mergeProducts(items);
    },
    [_updateCat, _mergeProducts],
  );

  /**
   * loadMoreProducts — fetch trang tiếp theo và APPEND vào items hiện có.
   * - Tự động dừng nếu không còn trang (hasMore = false)
   * - Nếu server trả lỗi → set hasMore = false, không retry
   */
  // const loadMoreProducts = useCallback(
  //   async (category_id) => {
  //     const state = productState.byCategory[category_id] ?? CATEGORY_INITIAL;
  //     if (!state.hasMore || state.loading || state.loadingMore) return;

  //     const nextPage = state.page + 1;
  //     _updateCat(category_id, { loadingMore: true });

  //     const { data, error } = await fetchProductsByCategory({
  //       category_id,
  //     });

  //     if (error) {
  //       // Lỗi → dừng hẳn, không hiện gì thêm
  //       _updateCat(category_id, { loadingMore: false, hasMore: false });
  //       return;
  //     }

  //     const newItems = data?.products ?? (Array.isArray(data) ? data : []);
  //     const totalPages = data?.total_pages ?? state.totalPages;
  //     const hasMore = nextPage + 1 < totalPages;

  //     _updateCat(category_id, {
  //       items: [...state.items, ...newItems],
  //       page: nextPage,
  //       totalPages,
  //       hasMore,
  //       loadingMore: false,
  //     });

  //     _mergeProducts(newItems);
  //   },
  //   [productState, _updateCat, _mergeProducts],
  // );

  /* ── catalog ── */
  const categories = useResource(fetchCategories);

  /* ── user ── */
  const userState = useResource(fetchProfile, isLoggedIn);

  const updateUserProfile = useCallback(
    async (fields) => {
      return withTokenGuard(async () => {
        const result = await updateProfile(fields);
        if (!result.error) userState.refetch();
        return result;
      });
    },
    [withTokenGuard, userState.refetch],
  );

  /* ── settings ── */
  const userSettings = useResource(fetchSettings, isLoggedIn);

  const updateUserSettings = useCallback(
    async (patch) => {
      return withTokenGuard(async () => {
        const result = await updateSettings(patch);
        if (!result.error) userSettings.refetch();
        return result;
      });
    },
    [withTokenGuard, userSettings.refetch],
  );
  /** change password */
  const changePassword = useCallback(
    async (patch) => {
      return withTokenGuard(async () => {
        const result = await updatePassword(patch);
        if (!result.error) userSettings.refetch();
        return result;
      });
    },
    [withTokenGuard, userSettings.refetch],
  );

  const delUser = useCallback(async () => {
    return withTokenGuard(async () => {
      const result = await disableUser();
      if (!result.error) userSettings.refetch();
      return result;
    });
  }, [withTokenGuard, userSettings.refetch]);

  /* ── cart ── */
  const fetchCartWrapper = async () => {
    const response = await fetchCart();
    if (!response.error && response?.data?.productCart) {
      response?.data?.productCart.forEach((item) => _mergeProducts([item]));
    }
    return { data: response?.data?.formattedCart, error: response.error };
  };
  const userCart = useResource(fetchCartWrapper, isLoggedIn);

  const updateUserCart = useCallback(
    async (cartData, mode) => {
      // console.log("CART_DATACONTEXT", {cartData,mode});
      return withTokenGuard(async () => {
        const result = await updateCart(cartData, mode);
        if (!result.error) userCart.refetch();
        return result;
      });
    },
    [withTokenGuard, userCart.refetch],
  );

  /* ── Notices ── */
  const [socketNotice, setSocketNotice] = useState([]);
  const totalNotice = useMemo(() => {
    return socketNotice.length;
  }, [socketNotice]);

  useEffect(() => {
    if (!loginState) return;
    fetchNotices().then(({ data, error }) => {
      if (!error) {
        setSocketNotice(data.content);
      }
    });
  }, [loginState]); // eslint-disable-line

  const formatAndPushNotice = (type, rawData) => {
    let payload = rawData;
    if (typeof rawData === "string") {
      try {
        payload = JSON.parse(rawData);
      } catch (e) {
        payload = rawData;
      }
    }

    setSocketNotice((prev) => [...prev, payload]);
  };
  // useEffect(() => {
  //   console.log("NOTICEDATAÂ: ", socketNotice);
  // }, [socketNotice]);

  useEffect(() => {
    const token = getToken();
    // Gọi hàm khởi tạo ở api.js. Hàm này tự động từ chối nếu _token là null
    initWebSocket(token, formatAndPushNotice);

    // Cleanup function: Đảm bảo ngắt kết nối khi component bị hủy
    // hoặc trước khi useEffect chạy lại với token mới
    return () => {
      disconnectWebSocket();
    };
  }, [loginState]);

  /* ─── Invoice request ─── */
  const baseUrl = import.meta.env.BASE_URL;
  const INVOICE_PAGE_PATH = `${baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"}pages/invoice.html`;

  const popupRef = useRef(null);
  const handlerRef = useRef(null);

  const InvoiceRequest = useCallback((orderId) => {
    // console.log("ORDERID từ invoice: ", orderId);
    // Dọn listener cũ nếu người dùng bấm nhiều lần
    if (handlerRef.current) {
      window.removeEventListener("message", handlerRef.current);
    }

    const popup = window.open(INVOICE_PAGE_PATH, "_blank");
    popupRef.current = popup;

    // if (!popup) {
    //   console.error("Không thể mở cửa sổ. Trình duyệt có thể đã chặn popup.");
    //   return;
    // }

    function handleMessage(event) {
      // Chỉ chấp nhận message từ cùng origin (vì invoice.html cùng domain)
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data) return;

      if (data.type === "INVOICE_READY") {
        // Trang con đã sẵn sàng -> gửi dữ liệu bảo mật
        popup.postMessage(
          {
            type: "INVOICE_AUTH",
            token: getToken(),
            id: orderId,
          },
          window.location.origin,
        );
      }

      if (data.type === "INVOICE_RESULT") {
        if (data.success) {
          console.log("Lấy hoá đơn thành công:", data.payload);
        } else {
          console.error("Lấy hoá đơn thất bại:", data.payload);
        }
        window.removeEventListener("message", handleMessage);
        handlerRef.current = null;
      }
    }

    handlerRef.current = handleMessage;
    window.addEventListener("message", handleMessage);
  }, []); // eslint-disable-line

  /* ── QR ── */
  const [QRloading, setQRLoading] = useState(false);
  const fetchQRForId = useCallback(
    async (id) => {
      if (!loginState) return;
      setQRLoading(true);
      return withTokenGuard(async () => {
        const { data, error } = await fetchQR(id);
        // if (error) console.error("Lỗi từ QRFetch: ", error);
        setQRLoading(false);
        return { data, error };
      });
    },
    [withTokenGuard],
  );

  /* ── Orders ── */
  const ORDER_INITIAL = {
    items: [],
    page: 0,
    totalPages: 1,
    hasMore: false,
    loading: false,
    loadingMore: false,
    error: null,
  };

  const [orderState, setOrderState] = useState({
    byStatus: {
      pending: ORDER_INITIAL,
      history: ORDER_INITIAL,
    },
    active: null,
  });
  // useEffect(() => {
  // console.log("orderState: ", orderState);
  // }, [orderState]); // eslint-disable-line

  // Tải trang đầu tiên (Reset danh sách)
  const fetchOrdersForStatus = useCallback(async (status) => {
    setOrderState((prev) => ({
      ...prev,
      active: status,
      byStatus: {
        ...prev.byStatus,
        [status]: {
          ...(prev.byStatus[status] ?? ORDER_INITIAL),
          loading: true,
          error: null,
        },
      },
    }));

    const { data, error } = await fetchOrders(status, 0);

    if (error) {
      setOrderState((prev) => ({
        ...prev,
        byStatus: {
          ...prev.byStatus,
          [status]: {
            ...prev.byStatus[status],
            loading: false,
            error,
          },
        },
      }));
      return;
    }

    setOrderState((prev) => ({
      ...prev,
      byStatus: {
        ...prev.byStatus,
        [status]: {
          items: data.content ?? [],
          loading: false,
          error: null,
        },
      },
    }));
  }, []);

  // Tải trang tiếp theo (Append vào danh sách)
  const loadMoreOrders = useCallback(async () => {
    if (!orderState.hasMore || orderState.loading || orderState.loadingMore)
      return;

    const nextPage = orderState.page + 1;
    setOrderState((prev) => ({ ...prev, loadingMore: true }));

    const { data, error } = await fetchOrders({ page: nextPage });

    if (error) {
      setOrderState((prev) => ({
        ...prev,
        loadingMore: false,
        hasMore: false,
      }));
      return;
    }

    const newItems = data?.content ?? (Array.isArray(data) ? data : []);
    const totalPages = data?.total_pages ?? orderState.totalPages;
    const hasMore = nextPage + 1 < totalPages;

    setOrderState((prev) => ({
      ...prev,
      items: [...prev.items, ...newItems],
      page: nextPage,
      totalPages,
      hasMore,
      loadingMore: false,
    }));
  }, [orderState]);

  const cancelOrderAction = useCallback(
    async (id) => {
      return withTokenGuard(async () => {
        const result = await cancelOrder(id);
        if (
          !result.error ||
          result.error ==
            "Lỗi kết nối: Failed to execute 'json' on 'Response': Unexpected end of JSON input"
        ) {
          await fetchOrdersForStatus("pending");
          await fetchOrdersForStatus("history");
        }
        return result;
      });
    },
    [withTokenGuard, fetchOrdersForStatus],
  );

  const confirmDeliveryAction = useCallback(
    async (id) => {
      return withTokenGuard(async () => {
        const result = await confirmDelivery(id);
        if (
          !result.error ||
          result.error ==
            "Lỗi kết nối: Failed to execute 'json' on 'Response': Unexpected end of JSON input"
        ) {
          await fetchOrdersForStatus("pending");
          await fetchOrdersForStatus("history");
        }
        return result;
      });
    },
    [withTokenGuard, fetchOrdersForStatus],
  );

  /* ── Context value ── */
  const value = useMemo(
    () => ({
      auth: {
        loginState,
        login,
        logout,
      },
      toast,
      products: {
        byCategory: productState.byCategory,
        activeCategory: productState.active,
        allProducts: allProductsArr,
        fetchProductsForCategory,
      },

      categories,

      user: { ...userState, updateUserProfile },
      settings: {
        ...userSettings,
        updateUserSettings,
        delUser,
        changePassword,
      },
      notices: {
        totalNotice,
        data: socketNotice,
        loading: false,
        error: null,
      },
      invoice: { InvoiceRequest },
      QR: { QRloading, fetchQRForId },
      orders: {
        byStatus: orderState.byStatus,
        activeStatus: orderState.active,
        fetchOrdersForStatus,
        cancelOrder: cancelOrderAction,
        confirmDelivery: confirmDeliveryAction,
      },
      cart: { ...userCart, updateUserCart: updateUserCart },
    }),
    [
      loginState,
      login,
      logout,
      toast,
      productState,
      fetchProductsForCategory,
      categories,
      userState,
      updateUserProfile,
      userSettings,
      updateUserSettings,
      delUser,
      changePassword,
      socketNotice,
      totalNotice,
      InvoiceRequest,
      QRloading,
      fetchQRForId,
      orderState,
      cancelOrder,
      confirmDelivery,
      userCart,
      updateUserCart,
      fetchOrdersForStatus,
      loadMoreOrders,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

/* ════════════════════════════════════════════
   PUBLIC HOOKS
════════════════════════════════════════════ */

export const useAuth = () => useContext(DataContext).auth;

export const useToast = () => useContext(DataContext).toast;

export const useAllProducts = () => {
  const { products } = useContext(DataContext);
  return products.allProducts;
};

export const useProductsByCategory = (category) => {
  const { products } = useContext(DataContext);
  // console.log("đang kiểm tra products");
  // console.log(products);
  const state = products.byCategory[category] ?? {
    items: [],
    loading: false,
    error: null,
  };
  return {
    products: state.items,
    loading: state.loading,
    error: state.error,
    fetchProductsForCategory: products.fetchProductsForCategory,
  };
};

export const useCategories = () => {
  const { categories } = useContext(DataContext);
  return {
    categories: categories.data ?? [],
    loading: categories.loading,
    error: categories.error,
  };
};

export const useUserProfile = () => {
  const { user } = useContext(DataContext);
  return {
    user: user.data,
    loading: user.loading,
    error: user.error,
    updateUserProfile: user.updateUserProfile,
  };
};
export const useUserSettings = () => {
  const { settings } = useContext(DataContext);
  return {
    settings: settings.data,
    loading: settings.loading,
    error: settings.error,
    updateUserSettings: settings.updateUserSettings,
    deleteUser: settings.delUser,
    changePassword: settings.changePassword,
  };
};
export const useNotices = () => {
  const { notices } = useContext(DataContext);
  return {
    notices: notices.data ?? [],
    loading: notices.loading,
    error: notices.error,
    totalNotice: notices.totalNotice,
  };
};
export const useUserCart = () => {
  const { cart } = useContext(DataContext);
  return {
    userCart: cart.data ?? {},
    loading: cart.loading,
    error: cart.error,
    updateUserCart: cart.updateUserCart,
  };
};

export const useInvoice = () => {
  const { invoice } = useContext(DataContext);
  return {
    invoiceRequest: invoice.InvoiceRequest,
  };
};

export const useUserQR = () => {
  const { QR } = useContext(DataContext);
  return {
    loading: QR.QRloading,
    fetchQR: QR.fetchQRForId,
  };
};

export const useOrders = (status = null) => {
  const { orders } = useContext(DataContext);

  const state = orders.byStatus[status] ?? {
    items: [],
    loading: false,
    error: null,
  };

  return {
    orders: state.items,
    loading: state.loading,
    error: state.error,
    cancelOrder: orders.cancelOrder,
    confirmDelivery: orders.confirmDelivery,
    fetchOrdersForStatus: orders.fetchOrdersForStatus,
  };
};

export const addProfile = async (fields) => {
  const { data, error } = await register(fields);
  return { data, error };
};

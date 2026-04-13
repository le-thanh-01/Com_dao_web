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
 * ──────────────────────────────────────────────────────────────
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  fetchProducts,
  fetchCategories,
  fetchNotices,
  fetchLoginState,
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
  login,
  logout,
} from "../../system/api";
/* ── helpers ── */
const initial = { data: null, loading: true, error: null };

const useResource = (fetcher) => {
  const [state, setState] = useState(initial);

  useEffect(() => {
    let alive = true;
    setState(initial);
    fetcher().then(({ data, error }) => {
      if (!alive) return;
      setState({ data, loading: false, error });
    });
    return () => {
      alive = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = useCallback(() => {
    setState(initial);
    fetcher().then(({ data, error }) =>
      setState({ data, loading: false, error }),
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, refetch };
};

/* ════════════════════════════════════════════
   CONTEXT
════════════════════════════════════════════ */
const DataContext = createContext(null);

export function DataProvider({ children }) {
  /* ── catalog ── */
  const products = useResource(fetchProducts);
  const categories = useResource(fetchCategories);

  /* ── user ── */
  const userState = useResource(fetchProfile);

  const updateUserProfile = useCallback(
    async (fields) => {
      const { data, error } = await updateProfile(fields);
      if (!error) {
        userState.refetch();
      }
      return { data, error };
    },
    [userState.refetch],
  );

  /* ── login and logout ── */
  const userLoginState = useResource(fetchLoginState);

  const handleLogin = useCallback(
    async (userData) => {
      const { data, error } = await login(userData);
      if (!error) {
        userLoginState.refetch();
      }
      return { data, error };
    },
    [userLoginState.refetch],
  );
  const handleLogout = useCallback(async () => {
    const { data, error } = await logout();
    if (!error) {
      userLoginState.refetch();
    }
    return { data, error };
  }, [userLoginState.refetch]);

  /* ── settings ── */
  const userSettings = useResource(fetchSettings);

  const updateUserSettings = useCallback(
    async (fields) => {
      const { data, error } = await updateSettings(fields);
      if (!error) {
        userSettings.refetch();
      }
      return { data, error };
    },
    [userSettings.refetch],
  );

  /* ── cart ── */
  const userCart = useResource(fetchCart);

  const updateUserCart = useCallback(
    async (fields) => {
      const { data, error } = await updateCart(fields);
      if (!error) {
        userCart.refetch();
      }
      return { data, error };
    },
    [userCart.refetch],
  );
  /* ── notices ── */
  const noticesState = useResource(fetchNotices);

  const markRead = useCallback(
    async (id) => {
      await markNoticeRead(id);
      noticesState.refetch();
    },
    [noticesState.refetch],
  );

  const markAllRead = useCallback(async () => {
    await markAllNoticesRead();
    noticesState.refetch();
  }, [noticesState.refetch]);

  /* ── orders ── */
  const ordersState = useResource(fetchOrders);

  const cancelOrderAction = useCallback(
    async (id) => {
      const result = await cancelOrder(id);
      if (!result.error) ordersState.refetch();
      return result;
    },
    [ordersState.refetch],
  );

  const confirmDeliveryAction = useCallback(
    async (id) => {
      const result = await confirmDelivery(id);
      if (!result.error) ordersState.refetch();
      return result;
    },
    [ordersState.refetch],
  );

  return (
    <DataContext.Provider
      value={{
        products,
        categories,
        user: { ...userState, updateUserProfile },
        notices: { ...noticesState, markRead, markAllRead },
        loginState: { ...userLoginState, handleLogin, handleLogout },
        settings: { ...userSettings, updateUserSettings },
        cart: { ...userCart, updateUserCart },
        orders: {
          ...ordersState,
          cancelOrder: cancelOrderAction,
          confirmDelivery: confirmDeliveryAction,
        },
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

/* ════════════════════════════════════════════
   PUBLIC HOOKS
════════════════════════════════════════════ */

export const useProducts = () => {
  const { products } = useContext(DataContext);
  return {
    products: products.data ?? [],
    loading: products.loading,
    error: products.error,
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

export const useLoginState = () => {
  const { loginState } = useContext(DataContext);
  return {
    loginState: loginState.data,
    loading: loginState.loading,
    error: loginState.error,
    handleLogin: loginState.handleLogin,
    handleLogout: loginState.handleLogout,
  };
};

export const useUserSettings = () => {
  const { settings } = useContext(DataContext);

  return {
    userSettings: settings.data,
    loading: settings.loading,
    error: settings.error,

    updateUserSettings: settings.updateUserSettings,
  };
};

export const useUserCart = () => {
  const { cart } = useContext(DataContext);
  return {
    userCart: cart.userCart,
    loading: cart.loading,
    error: cart.error,
    updateUserCart: cart.updateUserCart,
  };
};

export const useNotices = () => {
  const { notices } = useContext(DataContext);
  const unreadCount = useMemo(() => {
    if (!notices || !notices.data) return 0;
    return notices.data.filter((n) => !n.read).length;
  }, [notices]);
  return {
    notices: notices.data ?? [],
    loading: notices.loading,
    error: notices.error,
    markRead: notices.markRead,
    markAllRead: notices.markAllRead,
    unreadCount,
  };
};

export const useOrders = () => {
  const { orders } = useContext(DataContext);
  const all = orders.data ?? [];
  return {
    orders: all,
    pendingOrders: all.filter((o) => o.status === "pending"),
    historyOrders: all.filter((o) => o.status !== "pending"),
    loading: orders.loading,
    error: orders.error,
    refetch: orders.refetch,
    cancelOrder: orders.cancelOrder,
    confirmDelivery: orders.confirmDelivery,
  };
};

export const addProfile = async (fields) => {
  const { data, error } = await register(fields);
  return { data, error };
};

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";

/* ═══════════════════════════════════════════════════════════════
   1. PURE HELPERS — không phụ thuộc React, dễ test độc lập
   ═══════════════════════════════════════════════════════════════ */

/**
 * Bed ID không được tính vào maxTopping / maxDrink.
 * Thêm id vào đây nếu có thêm bed ngoại lệ trong tương lai.
 */
const QUOTA_EXCLUDED_BED_IDS = new Set([25]);

/**
 * countableBeds — lọc chỉ lấy bed được tính quota (loại trừ QUOTA_EXCLUDED_BED_IDS).
 * Pure helper, dùng chung trong cả evaluateProductQuota và quota useMemo.
 */
const getCountableBeds = (productsList) =>
  productsList.filter(
    (p) => p.cats?.includes("bed") && !QUOTA_EXCLUDED_BED_IDS.has(p.id),
  );

/**
 * evaluateProductQuota
 * Kiểm tra một sản phẩm có bị chặn trong ngữ cảnh của một cart cụ thể không.
 * Dùng `targetCart` thay vì state trực tiếp → an toàn trong setCart(prevCart => ...).
 *
 * THAY ĐỔI SO VỚI PHIÊN BẢN TRƯỚC:
 * - Tách khỏi useMemo/useCallback → tái sử dụng cho cả handleIncrement và getStatus
 * - Dùng getCountableBeds() → loại trừ bed id=25 khỏi tính toán maxTopping/maxDrink
 *
 * @param {number}   productId    - ID sản phẩm cần kiểm tra
 * @param {object}   targetCart   - Snapshot cart tại thời điểm kiểm tra
 * @param {object[]} productsList - Toàn bộ danh sách sản phẩm
 * @returns {{ isBlocked: boolean, isTopping: boolean, isDrink: boolean, qty: number }}
 */
const evaluateProductQuota = (productId, targetCart, productsList) => {
  const product = productsList.find((p) => p.id === productId);
  if (!product)
    return { isBlocked: false, isTopping: false, isDrink: false, qty: 0 };

  const qty = targetCart[productId] || 0;
  const isTopping = product.cats?.includes("topping");
  const isDrink = product.cats?.includes("drink");

  // Không phải topping/drink → không bao giờ bị chặn bởi quota
  if (!isTopping && !isDrink)
    return { isBlocked: false, isTopping, isDrink, qty };

  // THAY ĐỔI: chỉ đếm bed được phép, loại trừ id trong QUOTA_EXCLUDED_BED_IDS
  const countableBeds = getCountableBeds(productsList);
  const totalBeds = countableBeds.reduce(
    (s, p) => s + (targetCart[p.id] || 0),
    0,
  );
  const hasBed = totalBeds > 0;

  let isBlocked = false;

  if (isTopping) {
    const tops = productsList.filter((p) => p.cats?.includes("topping"));
    const usedToppings = tops.reduce((s, p) => s + (targetCart[p.id] || 0), 0);
    const maxToppings = totalBeds * 2;
    const maxPerTopping = totalBeds; // mỗi loại topping tối đa = số bed

    isBlocked =
      !hasBed ||
      (qty === 0 && usedToppings >= maxToppings) ||
      (qty > 0 && usedToppings >= maxToppings) ||
      qty >= maxPerTopping;
  } else {
    const drinks = productsList.filter((p) => p.cats?.includes("drink"));
    const usedDrinks = drinks.reduce((s, p) => s + (targetCart[p.id] || 0), 0);
    const maxDrinks = totalBeds * 1;

    isBlocked =
      !hasBed ||
      (qty === 0 && usedDrinks >= maxDrinks) ||
      (qty > 0 && usedDrinks >= maxDrinks);
  }

  return { isBlocked, isTopping, isDrink, qty };
};

/*
 *
 * clearExtrasAfterBedDecrement
 * Xoá HOÀN TOÀN toàn bộ topping và drink khỏi cart khi một bed bị giảm.
 *
 * THAY ĐỔI SO VỚI PHIÊN BẢN TRƯỚC:
 * - Trước: cắt bớt đúng lượng vượt quota (trim từng item)
 * - Sau: xoá sạch tất cả topping và drink, không phụ thuộc quota
 *
 * Chú ý: chỉ xoá topping/drink khi không còn bed nào được tính quota.
 * Nếu vẫn còn bed hợp lệ (không thuộc QUOTA_EXCLUDED_BED_IDS), giữ nguyên.
 *
 * @param {object}   updatedCart  - Cart đã trừ bed rồi
 * @param {object[]} productsList - Danh sách sản phẩm
 * @returns {object} cart đã xoá sạch topping và drink (nếu hết bed tính quota)
 */
const clearExtrasAfterBedDecrement = (updatedCart, productsList) => {
  // Tính lại số bed còn lại sau khi đã giảm (chỉ tính bed được phép)
  // const countableBeds = getCountableBeds(productsList);
  // const remainingBeds = countableBeds.reduce(
  //   (s, p) => s + (updatedCart[p.id] || 0),
  //   0,
  // );

  // // Nếu vẫn còn bed hợp lệ → không xoá, để quota tự điều chỉnh khi render
  // if (remainingBeds > 0) return updatedCart;

  // Hết toàn bộ bed được tính quota → xoá sạch topping và drink
  const result = { ...updatedCart };
  productsList.forEach((p) => {
    if (p.cats?.includes("topping") || p.cats?.includes("drink")) {
      delete result[p.id];
    }
  });
  return result;
};

/* ═══════════════════════════════════════════════════════════════
   2. CONTEXT
   ═══════════════════════════════════════════════════════════════ */
const CartContext = createContext(null);

/*
 *
 * CartProvider
 *
 * @param {object[]} products    - Danh sách sản phẩm từ DataContext
 * @param {object}   initialCart - Giỏ hàng đã lưu từ server (restore sau reload)
 * @param {function} onCartChange- Callback sync lên server, debounce 600ms
 */
export function CartProvider({
  children,
  products = [],
  initialCart = {},
  onCartChange,
}) {
  const [cart, setCart] = useState(initialCart);

  /* ── Restore cart từ server khi initialCart về lần đầu ── */
  const initialised = useRef(false);
  useEffect(() => {
    if (!initialised.current && Object.keys(initialCart).length > 0) {
      setCart(initialCart);
      initialised.current = true;
    }
  }, [initialCart]);

  /* ── Debounce sync lên server 600ms sau mỗi thay đổi ── */
  const syncTimer = useRef(null);
  useEffect(() => {
    if (!onCartChange) return;
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => onCartChange(cart), 600);
    return () => clearTimeout(syncTimer.current);
  }, [cart, onCartChange]);

  /* ── Raw mutators ── */
  const increment = useCallback(
    (id) => setCart((p) => ({ ...p, [id]: (p[id] || 0) + 1 })),
    [],
  );

  const decrement = useCallback(
    (id) =>
      setCart((prev) => {
        const next = (prev[id] || 0) - 1;
        if (next <= 0) {
          const c = { ...prev };
          delete c[id];
          return c;
        }
        return { ...prev, [id]: next };
      }),
    [],
  );

  const setQty = useCallback(
    (id, qty) =>
      setCart((prev) => {
        if (qty <= 0) {
          const n = { ...prev };
          delete n[id];
          return n;
        }
        return { ...prev, [id]: qty };
      }),
    [],
  );

  const clearCart = useCallback(() => setCart({}), []);

  /* ── Quota — phục vụ UI đọc ── */
  const quota = useMemo(() => {
    // THAY ĐỔI: dùng getCountableBeds() → loại trừ bed id=25 khỏi maxTopping/maxDrink
    const countableBeds = getCountableBeds(products);
    const tops = products.filter((p) => p.cats?.includes("topping"));
    const drinks = products.filter((p) => p.cats?.includes("drink"));

    const totalBeds = countableBeds.reduce((s, p) => s + (cart[p.id] || 0), 0);
    const usedToppings = tops.reduce((s, p) => s + (cart[p.id] || 0), 0);
    const usedDrinks = drinks.reduce((s, p) => s + (cart[p.id] || 0), 0);
    const maxToppings = totalBeds * 2;
    const maxDrinks = totalBeds * 1;

    return {
      totalBeds,
      maxToppings,
      maxDrinks,
      usedToppings,
      usedDrinks,
      toppingFull: totalBeds > 0 && usedToppings >= maxToppings,
      drinkFull: totalBeds > 0 && usedDrinks >= maxDrinks,
      hasBed: totalBeds > 0,
    };
  }, [cart, products]);

  /**
   * getStatus — cho UI đọc trạng thái block của một sản phẩm.
   * Dùng `cart` (state tĩnh hiện tại) — an toàn vì chỉ render.
   */
  const getStatus = useCallback(
    (productId) => {
      const { isBlocked, qty } = evaluateProductQuota(
        productId,
        cart,
        products,
      );
      return { blocked: isBlocked, incBlocked: isBlocked, qty };
    },
    [cart, products],
  );

  /**
   * handleIncrement — quota-aware increment.
   * Dùng `prevCart` bên trong setCart() → đúng khi React batch nhiều updates.
   * Tái sử dụng evaluateProductQuota với prevCart thay vì snapshot cũ.
   */
  const handleIncrement = useCallback(
    (productId, e) => {
      e?.stopPropagation();
      setCart((prevCart) => {
        const { isBlocked } = evaluateProductQuota(
          productId,
          prevCart,
          products,
        );
        if (isBlocked) return prevCart; // huỷ update, không re-render
        return { ...prevCart, [productId]: (prevCart[productId] || 0) + 1 };
      });
    },
    [products],
  );

  /**
   * handleDecrement — decrement thông thường cho sản phẩm không phải bed.
   */
  const handleDecrement = useCallback(
    (productId, e) => {
      e?.stopPropagation();
      decrement(productId);
    },
    [decrement],
  );

  /**
   * TÍNH NĂNG MỚI: handleBedDecrement
   * Dành riêng cho sản phẩm thuộc category "Bed".
   * Sau khi giảm Bed, tự động trim topping/drink vượt quota mới.
   *
   * Luồng: prevCart → giảm Bed → tính quota mới → trim extras → commit
   * Toàn bộ trong một BedCart() duy nhất → atomic, không flash UI trung gian.
   */
  const handleBedDecrement = useCallback(
    (productId, e) => {
      e?.stopPropagation();
      setCart((prevCart) => {
        const currentQty = prevCart[productId] || 0;
        if (currentQty <= 0) return prevCart;

        // 1. Giảm Bed
        let next = { ...prevCart };
        const newQty = currentQty - 1;
        if (newQty <= 0) delete next[productId];
        else next[productId] = newQty;

        // 2. Trim topping/drink nếu vượt quota mới
        next = clearExtrasAfterBedDecrement(next, products);

        return next;
      });
    },
    [products],
  );

  const totalItems = useMemo(
    () => Object.values(cart).reduce((s, q) => s + q, 0),
    [cart],
  );

  /* ── Memoize context value để tránh re-render không cần thiết ── */
  const contextValue = useMemo(
    () => ({
      cart,
      increment,
      decrement,
      setQty,
      clearCart,
      getStatus,
      handleIncrement,
      handleDecrement,
      handleBedDecrement, // THÊM MỚI
      totalItems,
      quota,
    }),
    [
      cart,
      increment,
      decrement,
      setQty,
      clearCart,
      getStatus,
      handleIncrement,
      handleDecrement,
      handleBedDecrement,
      totalItems,
      quota,
    ],
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

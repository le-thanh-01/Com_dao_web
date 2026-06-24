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
const isBedProduct = (p) => p.id <= 13 && !QUOTA_EXCLUDED_BED_IDS.has(p.id);
const getCountableBeds = (productsList) =>
  productsList.filter((p) => isBedProduct(p));

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
  const qty = targetCart[productId] || 0;
  const product = productsList.find((p) => p.id === productId);
  if (!product) return { isBlocked: false, isDrink: false, qty: 0 };

  // const isTopping = product.cats?.includes("topping");
  const isDrink = product.id > 30 && product.id < 40;

  // Không phải topping/drink → không bao giờ bị chặn bởi quota
  if (!isDrink) return { isBlocked: false, isDrink, qty };

  // THAY ĐỔI: chỉ đếm bed được phép, loại trừ id trong QUOTA_EXCLUDED_BED_IDS
  const countableBeds = getCountableBeds(productsList);
  const totalBeds = countableBeds.reduce(
    (s, p) => s + (targetCart[p.id] || 0),
    0,
  );
  const hasBed = totalBeds > 0;

  let isBlocked = false;

  // if (isTopping) {
  //   const tops = productsList.filter((p) => p.cats?.includes("topping"));
  //   const usedToppings = tops.reduce((s, p) => s + (targetCart[p.id] || 0), 0);
  //   const maxToppings = totalBeds * 2;
  //   const maxPerTopping = totalBeds; // mỗi loại topping tối đa = số bed

  //   isBlocked =
  //     !hasBed ||
  //     (qty === 0 && usedToppings >= maxToppings) ||
  //     (qty > 0 && usedToppings >= maxToppings) ||
  //     qty >= maxPerTopping;
  // } else

  const drinks = productsList.filter((p) => p.id > 30 && p.id < 40);
  // console.log("drink: ", drinks);
  const usedDrinks = drinks.reduce((s, p) => s + (targetCart[p.id] || 0), 0);
  const maxDrinks = totalBeds * 1;

  isBlocked =
    !hasBed ||
    (qty === 0 && usedDrinks >= maxDrinks) ||
    (qty > 0 && usedDrinks >= maxDrinks);

  // console.log(
  //   "targerCart: ",
  //   targetCart,
  //   "isBlocked: ",
  //   isBlocked,
  //   "\nHasbed: ",
  //   hasBed,
  //   "\nqty: ",
  //   qty,
  //   "\nusedDrink: ",
  //   usedDrinks,
  //   "\nmaxDrink: ",
  //   maxDrinks,
  // );

  return { isBlocked, isDrink, qty };
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
  const _isDrink = (p) => p.id > 30 && p.id < 40;
  const _isTopping = (p) => p.id > 13 && p.id < 31;
  productsList.forEach((p) => {
    if (_isDrink(p)) {
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
  //Giỏ hàng dùng để thay đổi giao diện (được component sử dụng)
  const [cart, setCart] = useState(initialCart);
  //Giỏ hàng chuyên dụng cho updateQueue
  const cartRef = useRef({});
  //Hàng đợi gửi lần lượt các sản phẩm mới thay đổi trong giỏ hàng
  const updateQueue = useRef([]);
  //Biến trạng thái đảm bảo không gửi sản phẩm sau trong khi sản
  //phẩm trước vẫn đang gửi
  const isSyncing = useRef(false);

  // useEffect(() => {
  //   console.log("CART_IN_CẢTCONTEXT", cart);
  // }, [cart]);

  /* ── Restore cart từ server khi initialCart về lần đầu ── */
  const initialised = useRef(false);
  useEffect(() => {
    if (!initialised.current && Object.keys(initialCart).length > 0) {
      cartRef.current = initialCart;
      setCart(initialCart);
      initialised.current = true;
    }
  }, [initialCart]);

  /** bổ sung sản phẩm mới vào hàng đợi
   * findIndex() cập nhật sản phẩm đã có trong hàng đợi
   */
  const enqueueUpdate = (productId, newQuantity) => {
    const existingIndex = updateQueue.current.findIndex(
      (item) => item.product_id === Number(productId),
    );

    if (existingIndex !== -1) {
      // Ghi đè số lượng mới nhất vào tác vụ đang chờ
      updateQueue.current[existingIndex].quantity = newQuantity;
    } else {
      // Tạo tác vụ mới nếu chưa tồn tại trong hàng đợi
      updateQueue.current.push({
        product_id: Number(productId),
        quantity: newQuantity,
      });
    }
    // Kích hoạt tiến trình gửi API ngầm
    processQueue();
  };

  //Thực hiện gửi sản phẩm lên server
  //đệ quy trong hàm để đảm bảo xử lý hết toàn bộ sản phẩm còn tồn đọng
  //trong hàng đợi
  const processQueue = async () => {
    if (isSyncing.current || updateQueue.current.length === 0) return;
    isSyncing.current = true;

    const currentUpdate = updateQueue.current.shift();
    // console.log("currentUpdateCart: ", onCartChange);

    try {
      await onCartChange(currentUpdate);
    } catch (error) {
      console.error("Lỗi đồng bộ hóa với Server:", error);
    } finally {
      isSyncing.current = false;
      processQueue(); // Đệ quy xử lý tác vụ tiếp theo
    }
  };

  /* ── Raw mutators ── */
  const increment = useCallback((id) => {
    cartRef.current[id] = (cartRef.current[id] || 0) + 1;
    setCart((p) => ({ ...p, [id]: (p[id] || 0) + 1 }));
    enqueueUpdate(id, cartRef.current[id]);
  }, []);

  const decrement = useCallback((id) => {
    const currentQuantity = cartRef.current[id] || 0;
    if (currentQuantity <= 0) return;

    const newQuantity = currentQuantity - 1;

    if (newQuantity === 0) {
      const { [id]: _, ...rest } = cartRef.current;
      cartRef.current = rest;
    } else {
      cartRef.current = {
        ...cartRef.current,
        [id]: newQuantity,
      };
    }
    setCart(cartRef.current);

    enqueueUpdate(id, newQuantity);
  }, []);

  const setQty = useCallback((product, qty) => {
    if (qty <= 0) {
      const { [product.id]: _, ...rest } = cartRef.current;
      let nextState = rest;
      if (isBedProduct(product)) {
        const currentCartState = cartRef.current;
        nextState = clearExtrasAfterBedDecrement(nextState, products);
        const changedItems = {};

        changedItems[product.id] = qty;

        Object.keys(currentCartState).forEach((key) => {
          if (key != String(product.id)) {
            const oldVal = currentCartState[key];
            const newVal = nextState[key] || 0;

            if (oldVal !== newVal) {
              changedItems[key] = newVal;
            }
          }
        });

        cartRef.current = nextState;
        setCart(nextState);

        Object.entries(changedItems).forEach(([id, qty]) => {
          enqueueUpdate(id, qty);
        });
      } else cartRef.current = rest;
    } else {
      cartRef.current = {
        ...cartRef.current,
        [id]: qty,
      };
    }
    setCart(cartRef.current);

    enqueueUpdate(product.id, newQuantity);
  }, []);

  const clearCart = useCallback(() => setCart({}), []);

  /* ── Quota — phục vụ UI đọc ── */
  const quota = useMemo(() => {
    // THAY ĐỔI: dùng getCountableBeds() → loại trừ bed id=25 khỏi maxTopping/maxDrink
    const countableBeds = getCountableBeds(products);
    // const tops = products.filter((p) => p.cats?.includes("topping"));
    const drinks = products.filter((p) => p.id > 30 && p.id < 40);

    const totalBeds = countableBeds.reduce((s, p) => s + (cart[p.id] || 0), 0);
    // const usedToppings = tops.reduce((s, p) => s + (cart[p.id] || 0), 0);
    const usedDrinks = drinks.reduce((s, p) => s + (cart[p.id] || 0), 0);
    // const maxToppings = totalBeds * 2;
    const maxDrinks = totalBeds * 1;

    return {
      totalBeds,
      // maxToppings,
      maxDrinks,
      // usedToppings,
      usedDrinks,
      // toppingFull: totalBeds > 0 && usedToppings >= maxToppings,
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
      const { isBlocked } = evaluateProductQuota(
        productId,
        cartRef.current,
        products,
      );
      if (isBlocked) return;
      //cập nhật cart ref
      cartRef.current = {
        ...cartRef.current,
        [productId]: (cartRef.current[productId] || 0) + 1,
      };
      //cập nhật cart state
      setCart(cartRef.current);
      enqueueUpdate(productId, cartRef.current[productId]);
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

      const currentCartState = cartRef.current;
      const currentQty = currentCartState[productId] || 0;

      if (currentQty <= 0) return;

      let nextCartState = { ...currentCartState };
      const newQty = currentQty - 1;

      if (newQty <= 0) {
        delete nextCartState[productId];
      } else {
        nextCartState[productId] = newQty;
      }
      // console.log("currentcartstate: ", currentCartState);
      nextCartState = clearExtrasAfterBedDecrement(nextCartState, products);
      // console.log("nextCartstate: ", nextCartState);
      const changedItems = {};

      changedItems[productId] = newQty;

      Object.keys(currentCartState).forEach((key) => {
        if (key != String(productId)) {
          const oldVal = currentCartState[key];
          const newVal = nextCartState[key] || 0;

          if (oldVal !== newVal) {
            changedItems[key] = newVal;
          }
        }
      });

      cartRef.current = nextCartState;
      setCart(nextCartState);

      Object.entries(changedItems).forEach(([id, qty]) => {
        enqueueUpdate(id, qty);
      });
    },
    [products], // Lưu ý: Nếu có quy tắc linter nghiêm ngặt, cần thêm enqueueUpdate vào dependency array
  );

  const totalItems = useMemo(
    () => Object.values(cart).reduce((s, q) => s + q, 0),
    [cart],
  );

  /* ── Memoize context value để tránh re-render không cần thiết ── */
  const contextValue = useMemo(
    () => ({
      cart,
      cartRef,
      increment,
      decrement,
      setQty,
      clearCart,
      getStatus,
      handleIncrement,
      handleDecrement,
      handleBedDecrement, // THÊM MỚI
      totalItems,
      getCountableBeds,
      isBedProduct,
      quota,
    }),
    [
      cart,
      cartRef,
      increment,
      decrement,
      setQty,
      clearCart,
      getStatus,
      handleIncrement,
      handleDecrement,
      handleBedDecrement,
      totalItems,
      getCountableBeds,
      isBedProduct,
      quota,
    ],
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

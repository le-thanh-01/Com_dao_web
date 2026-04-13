import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

// --- 1. HÀM TIỆN ÍCH ĐỘC LẬP (PURE FUNCTION) ---
// Hàm này không phụ thuộc vào Hook của React, chỉ làm toán.
const evaluateProductQuota = (productId, targetCart, productsList) => {
  const product = productsList.find((p) => p.id === productId);
  if (!product)
    return { isBlocked: false, isTopping: false, isDrink: false, qty: 0 };

  const qty = targetCart[productId] || 0;
  const isTopping = product.cats?.includes("topping");
  const isDrink = product.cats?.includes("drink");

  // Nếu không phải topping/drink, luôn luôn cho qua
  if (!isTopping && !isDrink) {
    return { isBlocked: false, isTopping, isDrink, qty };
  }

  // Nội suy quota dựa trên targetCart được truyền vào
  const beds = productsList.filter((p) => p.cats?.includes("bed"));
  const totalBeds = beds.reduce((s, p) => s + (targetCart[p.id] || 0), 0);
  const hasBed = totalBeds > 0;
  let isBlocked = false;
  if (isTopping) {
    const tops = productsList.filter((p) => p.cats?.includes("topping"));
    const usedToppings = tops.reduce((s, p) => s + (targetCart[p.id] || 0), 0);
    const maxToppings = totalBeds * 2; // CHỈ SỬA LOGIC Ở ĐÂY NẾU CÓ THAY ĐỔI

    const toppingFull = totalBeds > 0 && usedToppings >= maxToppings;
    const maxPerTopping = totalBeds;
    const thisToppingFull = totalBeds > 0 && qty >= maxPerTopping;

    isBlocked =
      (toppingFull && qty === 0) ||
      (qty > 0 && usedToppings >= maxToppings) ||
      thisToppingFull ||
      !hasBed;
  } else if (isDrink) {
    const drinks = productsList.filter((p) => p.cats?.includes("drink"));
    const usedDrinks = drinks.reduce((s, p) => s + (targetCart[p.id] || 0), 0);
    const maxDrinks = totalBeds * 1; // CHỈ SỬA LOGIC Ở ĐÂY NẾU CÓ THAY ĐỔI

    const drinkFull = totalBeds > 0 && usedDrinks >= maxDrinks;
    isBlocked =
      (drinkFull && qty === 0) ||
      (qty > 0 && usedDrinks >= maxDrinks) ||
      !hasBed;
  }

  return { isBlocked, isTopping, isDrink, qty };
};

// --- 2. ỨNG DỤNG VÀO CONTEXT ---
const CartContext = createContext(null);

export function CartProvider({ children, products = [] }) {
  const [cart, setCart] = useState({});

  // Các hàm nguyên thủy giữ nguyên
  const increment = useCallback(
    (id) => setCart((p) => ({ ...p, [id]: (p[id] || 0) + 1 })),
    [],
  );
  // ... (giữ nguyên decrement, setQty, clearCart)
  const decrement = useCallback(
    (productId) =>
      setCart((prev) => {
        const next = (prev[productId] || 0) - 1;
        if (next <= 0) {
          const c = { ...prev };
          delete c[productId];
          return c;
        }
        return { ...prev, [productId]: next };
      }),
    [],
  );

  const clearCart = useCallback(() => setCart({}), []);

  // 2. Quota phục vụ riêng cho UI (Trạng thái đọc)
  const quota = useMemo(() => {
    const beds = products.filter((p) => p.cats?.includes("bed"));
    const tops = products.filter((p) => p.cats?.includes("topping"));
    const drinks = products.filter((p) => p.cats?.includes("drink"));

    const totalBeds = beds.reduce((s, p) => s + (cart[p.id] || 0), 0);
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

  // getStatus dùng để render UI: Truyền 'cart' (State Tĩnh hiện tại)
  const getStatus = useCallback(
    (productId) => {
      const { isBlocked, qty } = evaluateProductQuota(
        productId,
        cart,
        products,
      );
      // Bạn có thể tách incBlocked và blocked ra nếu UI cần thiết,
      // ở đây gộp chung thành isBlocked cho gọn.
      return { blocked: isBlocked, incBlocked: isBlocked, qty };
    },
    [cart, products],
  );

  // handleIncrement dùng để tương tác: Truyền 'prevCart' (State Động trong hàng đợi)
  const handleIncrement = useCallback(
    (productId, e) => {
      e?.stopPropagation();

      setCart((prevCart) => {
        // Tái sử dụng lại chính xác logic kinh doanh ở trên, nhưng áp dụng cho prevCart
        const { isBlocked, qty } = evaluateProductQuota(
          productId,
          prevCart,
          products,
        );

        if (isBlocked) {
          console.warn("Thao tác bị chặn do vượt quota trong hàng đợi");
          return prevCart; // Hủy cập nhật
        }

        return { ...prevCart, [productId]: (prevCart[productId] || 0) + 1 }; // Cho phép cập nhật
      });
    },
    [products],
  );

  // ... (Giữ nguyên phần còn lại của Provider)

  const handleDecrement = useCallback(
    (productId, e) => {
      e?.stopPropagation();
      decrement(productId);
    },
    [decrement],
  );

  const totalItems = Object.values(cart).reduce((s, q) => s + q, 0);

  // 4. Ngăn chặn re-render diện rộng bằng useMemo
  const contextValue = useMemo(
    () => ({
      cart,
      increment,
      decrement,
      getStatus,
      handleIncrement,
      handleDecrement,
      clearCart,
      totalItems,
      quota,
    }),
    [
      cart,
      increment,
      decrement,
      getStatus,
      handleIncrement,
      handleDecrement,
      clearCart,
      totalItems,
      quota,
    ],
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

import { CartProvider } from "./CartContext";
import {
  DataProvider,
  useAuth,
  useProductsByCategory,
  useUserCart,
  useAllProducts,
} from "./DataContext";

function CartBridge({ children }) {
  const allProducts = useAllProducts();
  const { loginState } = useAuth();
  const { userCart, updateUserCart } = useUserCart();
  return (
    <CartProvider
      products={allProducts}
      initialCart={loginState ? userCart : {}}
      onCartChange={loginState ? updateUserCart : undefined}
    >
      {children}
    </CartProvider>
  );
}

// Component này chỉ làm nhiệm vụ tổ hợp tất cả các Provider
export const AppProviders = ({ children }) => {
  return (
    <DataProvider>
      <CartBridge>{children}</CartBridge>
    </DataProvider>
  );
};

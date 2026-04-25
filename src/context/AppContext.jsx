import { CartProvider } from "./CartContext";
import {
  DataProvider,
  useProducts,
  useUserCart,
  useLoginState,
} from "./DataContext";

function CartBridge({ children }) {
  const { products } = useProducts();
  const { userCart, updateUserCart } = useUserCart();
  const { loginState } = useLoginState();
  return (
    <CartProvider
      products={products}
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

import { CartProvider } from "./CartContext";
import { DataProvider, useProducts } from "./DataContext";

function CartBridge({ children }) {
  const { products } = useProducts();
  return <CartProvider products={products}>{children}</CartProvider>;
}

// Component này chỉ làm nhiệm vụ tổ hợp tất cả các Provider
export const AppProviders = ({ children }) => {
  return (
    <DataProvider>
      <CartBridge>{children}</CartBridge>
    </DataProvider>
  );
};

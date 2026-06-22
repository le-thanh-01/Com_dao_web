import { useState, useEffect, useRef } from "react";
import {
  useProductsByCategory,
  useCategories,
  useToast,
} from "./context/DataContext";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import FilterBar from "./components/FilterBar/FilterBar";
import { ProductGrid } from "./components/ProductCard/ProductCard";
import Footer from "./components/Footer/Footer";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Account from "./components/Account/Account";
import Checkout from "./components/Checkout/Checkout";
import NoticePage from "./components/Notice/Notice";
import { useUserSettings } from "./context/DataContext";
import { PageLoader, ErrorBlock } from "./components/Skeleton/Skeleton";
import "../system/api";
import "./styles/global.css";
import "./App.css";

/** Toast toàn cục — hiển thị lỗi JWT expired và các thông báo hệ thống */
function GlobalToast() {
  const toast = useToast();
  if (!toast) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 9999,
        background: "var(--surface)",
        border: "1px solid var(--red)",
        borderRadius: "var(--radius-lg)",
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        animation: "fadeUp 0.3s ease",
        maxWidth: 360,
        fontSize: 13,
        color: "var(--text)",
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--red)"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {toast.message}
    </div>
  );
}

const parseCurrency = (str) => {
  if (typeof str !== "string") return 0;
  const num = parseFloat(str.replace("đ", "").trim());
  return isNaN(num) ? 0 : num;
};

const compareCost = (sort_type) => (a, b) => {
  if (sort_type === "asc") return a.price - b.price;
  if (sort_type === "desc") return b.price - a.price;
  return 0;
};

export default function App() {
  const [page, setPage] = useState("home");
  const [mainPage, subPage] = page.split("/");
  const [activeCategory, setActiveCategory] = useState("best-seller");
  const [activeCategoryId, setActiveCategoryId] = useState(1);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [activeSort, setActiveSort] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const { settings: userSettings, settingsLoading: loading } =
    useUserSettings();

  const {
    products,
    loading: productsLoading,
    loadingMore,
    hasMore,
    error: productsError,
    fetchProductsForCategory,
    loadMoreProducts,
  } = useProductsByCategory(activeCategoryId);

  const { categories } = useCategories();

  // Fetch sản phẩm mỗi khi category thay đổi
  useEffect(() => {
    fetchProductsForCategory(activeCategoryId);
  }, [activeCategoryId]); // eslint-disable-line

  // console.log("products: ");
  // console.log(products);
  const hasInitializedTheme = useRef(false);

  useEffect(() => {
    if (loading || !userSettings) {
      return;
    }
    let darkMode = userSettings.use_dark_mode;
    document.documentElement.classList.toggle("light", !darkMode);
    hasInitializedTheme.current = true;
  }, [loading, userSettings]);

  if (mainPage === "login") return <Login onNavigate={setPage} />;
  if (mainPage === "register") return <Register onNavigate={setPage} />;
  if (mainPage === "account")
    return <Account onNavigate={setPage} initialPanel={subPage} />;
  if (mainPage === "checkout") return <Checkout onNavigate={setPage} />;
  if (mainPage === "notices") return <NoticePage onNavigate={setPage} />;

  if (loading) return <PageLoader></PageLoader>;

  const filteredProducts = products
    .filter((p) => {
      // console.log("P_BADGE: ", p.badge);
      // console.log("ACTIVEFILTER: ", activeFilter);
      const matchSearch = p.label
        .toLowerCase()
        .includes(searchValue.toLowerCase());
      const matchFilter =
        activeFilter === "ALL"
          ? true
          : activeFilter === "NEW"
            ? p.badge === "NEW"
            : activeFilter === "HOT"
              ? p.badge === "HOT"
              : true;
      return matchSearch && matchFilter;
    })
    .sort(compareCost(activeSort));

  return (
    <div className="app">
      <Navbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onNavigate={setPage}
        currentPage={page}
      />

      <div className="app__body">
        <Sidebar
          categories={categories}
          activeCategory={activeCategoryId}
          onCategoryChange={setActiveCategory}
          onCategoryIdChange={setActiveCategoryId}
        />

        <main className="app__main">
          <FilterBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            activeSort={activeSort}
            onSortChange={setActiveSort}
          />
          {productsError ? (
            <ErrorBlock message={productsError} />
          ) : (
            <ProductGrid
              products={filteredProducts}
              activeCategory={activeCategory}
              loading={productsLoading}
              loadingMore={loadingMore}
              hasMore={hasMore && !searchValue} // không auto-load khi đang search
              onLoadMore={() => loadMoreProducts(activeCategoryId)}
            />
          )}
        </main>
      </div>

      <Footer />
      <GlobalToast />
    </div>
  );
}

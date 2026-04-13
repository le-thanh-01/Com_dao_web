import { useState, useEffect, useRef } from "react";
import { useProducts, useCategories } from "./context/DataContext";
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

export default function App() {
  const [page, setPage] = useState("home");
  const [activeCategory, setActiveCategory] = useState("best-seller");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const { userSettings, settingsLoading: loading } = useUserSettings();

  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts();
  const { categories } = useCategories();

  const hasInitializedTheme = useRef(false);

  useEffect(() => {
    if (loading || !userSettings) {
      return;
    }
    let darkMode = userSettings.darkMode;
    document.documentElement.classList.toggle("light", !darkMode);
    hasInitializedTheme.current = true;
  }, [loading, userSettings]);

  if (page === "login") return <Login onNavigate={setPage} />;
  if (page === "register") return <Register onNavigate={setPage} />;
  if (page === "account") return <Account onNavigate={setPage} />;
  if (page === "checkout") return <Checkout onNavigate={setPage} />;
  if (page === "notices") return <NoticePage onNavigate={setPage} />;

  if (loading) return <PageLoader></PageLoader>;

  const filteredProducts = products.filter((p) => {
    const matchCat = p.cats.includes(activeCategory);
    const matchSearch = p.name
      .toLowerCase()
      .includes(searchValue.toLowerCase());
    const matchFilter =
      activeFilter === "all"
        ? true
        : activeFilter === "new"
          ? p.badge === "new"
          : activeFilter === "promo"
            ? p.badge === "hot"
            : true;
    return matchCat && matchSearch && matchFilter;
  });

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
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        <main className="app__main">
          <FilterBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
          {productsError ? (
            <ErrorBlock message={productsError} />
          ) : (
            <ProductGrid
              products={filteredProducts}
              activeCategory={activeCategory}
              loading={productsLoading}
            />
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

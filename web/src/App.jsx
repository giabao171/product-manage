import { useEffect } from "react";
import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Categories from "./components/Categories.jsx";
import Products from "./components/Products.jsx";

/**
 * Build the navigation link class.
 *
 * @param isActive True when this route is active
 * @return Link class name
 */
function navClass({ isActive }) {
  return isActive ? "nav-link active" : "nav-link";
}

const PAGE_TITLES = {
  "/products": "Products",
  "/categories": "Categories",
};

/**
 * Render the product and category pages.
 * Express serves this app for /products and /categories.
 *
 * @return Page element
 */
export default function App() {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || "Products";

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  return (
    <main className="page">
      <header className="header">
        <h1>{pageTitle}</h1>
      </header>
      <nav className="nav">
        <NavLink to="/products" className={navClass}>
          Products
        </NavLink>
        <NavLink to="/categories" className={navClass}>
          Categories
        </NavLink>
      </nav>
      <Routes>
        <Route path="/products" element={<Products />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </main>
  );
}

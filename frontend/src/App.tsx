import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import { ProtectedRoute } from "./app/ProtectedRoute";
import { Navbar } from "./components/Navbar";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import ManageProductsPage from "./pages/ManageProductsPage";
import { ManagerRoute } from "./app/ManagerRoute";
import ProductFormPage from "./pages/ProductFormPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import ManageOrdersPage from "./pages/ManageOrdersPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navbar />
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Navbar />
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/:id"
        element={
          <ProtectedRoute>
            <Navbar />
            <ProductPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <Navbar />
            <CartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage/products"
        element={
          <ManagerRoute>
            <Navbar />
            <ManageProductsPage />
          </ManagerRoute>
        }
      />
      <Route
        path="/manage/products/new"
        element={
          <ManagerRoute>
            <Navbar />
            <ProductFormPage />
          </ManagerRoute>
        }
      />
      <Route
        path="/manage/products/:id"
        element={
          <ManagerRoute>
            <Navbar />
            <ProductFormPage />
          </ManagerRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Navbar />
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <Navbar />
            <OrderDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage/orders"
        element={
          <ManagerRoute>
            <Navbar />
            <ManageOrdersPage />
          </ManagerRoute>
        }
      />
    </Routes>
  );
}

export default App;
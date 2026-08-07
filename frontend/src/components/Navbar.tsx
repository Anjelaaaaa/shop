import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { useCart } from "../features/cart/CartContext";

export function Navbar() {
  const { isAuthenticated, getUser, logout } = useAuth();
  const user = getUser();
  const navigate = useNavigate();
  const { count } = useCart();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated()) return null;

  return (
    <nav style={{ 
      background: 'white', 
      padding: '15px 30px', 
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <Link to="/" style={{ fontWeight: 'bold', fontSize: '20px', textDecoration: 'none', color: '#333' }}>
          🛍️ Магазин
        </Link>
      </div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#555' }}>Каталог</Link>
        <Link to="/profile" style={{ textDecoration: 'none', color: '#555' }}>Профиль</Link>
        <Link to="/cart" style={{ textDecoration: "none", color: "#555" }}>
          Корзина {count > 0 && `(${count})`}
        </Link>
        <span style={{ color: '#333' }}>👋 {user?.first_name || user?.email}</span>
        <button 
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Выйти
        </button>
      </div>
    </nav>
  );
}
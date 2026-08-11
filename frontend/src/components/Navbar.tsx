import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../features/auth/useAuth';
import { useCart } from '../features/cart/CartContext';
import { api } from '../shared/api/client';

interface Notification {
  id: number;
  is_read: boolean;
}

export function Navbar() {
  const { isAuthenticated, getUser, logout } = useAuth();
  const { count } = useCart();
  const user = getUser();
  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN';
  const navigate = useNavigate();

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications/')).data,
    enabled: isAuthenticated(),
    refetchInterval: 15000,
  });
  const unread = notifications?.filter((n) => !n.is_read).length ?? 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated()) return null;

  const badge: React.CSSProperties = {
    background: '#f44336',
    color: 'white',
    borderRadius: '10px',
    padding: '1px 7px',
    fontSize: '12px',
    marginLeft: '4px',
  };

  return (
    <nav style={{
      background: 'white',
      padding: '15px 30px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div>
        <Link to="/" style={{ fontWeight: 'bold', fontSize: '20px', textDecoration: 'none', color: '#333' }}>
          🛍️ Магазин
        </Link>
      </div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#555' }}>Каталог</Link>
        <Link to="/cart" style={{ textDecoration: 'none', color: '#555' }}>
          Корзина {count > 0 && `(${count})`}
        </Link>
        <Link to="/orders" style={{ textDecoration: 'none', color: '#555' }}>Мои заказы</Link>
        <Link to="/notifications" style={{ textDecoration: 'none', color: '#555' }}>
          Уведомления {unread > 0 && <span style={badge}>{unread}</span>}
        </Link>
        <Link to="/profile" style={{ textDecoration: 'none', color: '#555' }}>Профиль</Link>
        {isManager && (
          <Link to="/manage/products" style={{ textDecoration: 'none', color: '#555' }}>Управление</Link>
        )}
        {isManager && (
          <Link to="/manage/orders" style={{ textDecoration: 'none', color: '#555' }}>Заказы</Link>
        )}
        <span style={{ color: '#333' }}>👋 {user?.first_name || user?.email}</span>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Выйти
        </button>
      </div>
    </nav>
  );
}
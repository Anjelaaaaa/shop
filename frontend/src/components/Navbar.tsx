import { Link, NavLink, useNavigate } from 'react-router-dom';
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

  return (
    <nav className="navbar">
      <div className="nav-inner">
      <Link to="/" className="brand">Beauty</Link>
      <div className="nav-links">
        <NavLink to="/" end className="nav-link">Каталог</NavLink>
        <NavLink to="/cart" className="nav-link">
          Корзина {count > 0 && `(${count})`}
        </NavLink>
        <NavLink to="/orders" className="nav-link">Мои заказы</NavLink>
        <NavLink to="/notifications" className="nav-link">
          Уведомления {unread > 0 && <span className="nav-badge">{unread}</span>}
        </NavLink>
        <NavLink to="/profile" className="nav-link">Профиль</NavLink>
        {isManager && <NavLink to="/manage/products" className="nav-link">Управление</NavLink>}
        {isManager && <NavLink to="/manage/orders" className="nav-link">Заказы</NavLink>}
        <span className="nav-hello">{user?.first_name || user?.email}</span>
        <button onClick={handleLogout} className="btn btn-ghost btn-sm">Выйти</button>
      </div>
      </div>
    </nav>
  );
}
